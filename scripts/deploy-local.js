/**
 * deploy-local.js — Despliegue + Seed en Hardhat Network local
 *
 * Uso:
 *   1. Terminal A: npx hardhat node
 *   2. Terminal B: npx hardhat run scripts/deploy-local.js --network localhost
 *
 * Resultado: Imprime la dirección del contrato desplegado.
 *            Copia esa dirección en CONFIG.contractAddress de game-a-space/app.js
 *            y game-b-fantasy/app.js.
 */

const { ethers } = require("hardhat");

async function main() {
  const [admin, seller, buyer] = await ethers.getSigners();

  console.log("\n======================================");
  console.log("  EAI PROJECT — LOCAL DEPLOYMENT");
  console.log("======================================");
  console.log(`Admin  : ${admin.address}`);
  console.log(`Seller : ${seller.address}`);
  console.log(`Buyer  : ${buyer.address}`);

  // ── 1. Deploy ────────────────────────────────────────────────────────────────
  console.log("\n[1/4] Deploying EAIProject contract...");
  const EAIProject = await ethers.getContractFactory("EAIProject");
  const contract = await EAIProject.deploy(admin.address);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`      ✔ Deployed to: ${contractAddress}`);

  // ── 2. Grant MINTER_ROLE to admin (already done in constructor, just log it) ─
  const MINTER_ROLE = await contract.MINTER_ROLE();
  console.log("\n[2/4] Minting test tokens to seller...");

  // Mint 10 units of Token ID 1 to seller
  const TOKEN_ID = 1;
  const TOKEN_AMOUNT = 10;
  const TOKEN_URI = "https://raw.githubusercontent.com/example/eai-metadata/main/token1.json";

  await contract.connect(admin).mint(
    seller.address,
    TOKEN_ID,
    TOKEN_AMOUNT,
    TOKEN_URI,
    "0x"
  );

  const sellerBalance = await contract.balanceOf(seller.address, TOKEN_ID);
  console.log(`      ✔ Seller balance (Token #${TOKEN_ID}): ${sellerBalance}`);

  // ── 3. Approve marketplace to manage seller's tokens ─────────────────────────
  console.log("\n[3/4] Approving marketplace to manage seller tokens...");
  await contract.connect(seller).setApprovalForAll(contractAddress, true);
  console.log("      ✔ Approval granted");

  // ── 4. List 5 units at 0.01 ETH each ─────────────────────────────────────────
  console.log("\n[4/4] Creating marketplace listing...");
  const PRICE_PER_UNIT = ethers.parseEther("0.01");
  await contract.connect(seller).listForSale(TOKEN_ID, 5, PRICE_PER_UNIT);
  const listing = await contract.listings(seller.address, TOKEN_ID);
  console.log(`      ✔ Listed ${listing.amount} unit(s) at ${ethers.formatEther(listing.pricePerUnit)} ETH each`);

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n======================================");
  console.log("  DEPLOYMENT COMPLETE — COPY THIS INFO");
  console.log("======================================");
  console.log(`Contract Address : ${contractAddress}`);
  console.log(`Seller Address   : ${seller.address}`);
  console.log(`Token ID         : ${TOKEN_ID}`);
  console.log(`Listed Amount    : 5 units at 0.01 ETH each`);
  console.log("\n>>> Paso siguiente:");
  console.log(`    En game-a-space/app.js y game-b-fantasy/app.js,`);
  console.log(`    cambia contractAddress a: "${contractAddress}"`);
  console.log(`    y usa la cuenta del Seller (signer[1]) en MetaMask para ver el listado.`);
  console.log("======================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
