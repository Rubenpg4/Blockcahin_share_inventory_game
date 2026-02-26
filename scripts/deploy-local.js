/**
 * deploy-local.js — Despliegue + Seed ALEATORIO en Hardhat Network local
 *
 * Uso:
 *   1. Terminal A: npx hardhat node
 *   2. Terminal B: npx hardhat run scripts/deploy-local.js --network localhost
 *
 * Cada vez que lo ejecutas, genera un inventario ALEATORIO para 3 jugadores,
 * crea listings de venta al azar, distribuye tokens GOLD, y mintea 1 NFT
 * (reliquia única ERC-721) para cada jugador.
 * Incluye metadata server en puerto 3333.
 */

const { ethers } = require("hardhat");
const path = require("path");
const http = require("http");
const fs = require("fs");

// ─── Metadata server ─────────────────────────────────────────────────────────

const METADATA_PORT = 3333;
const METADATA_DIR = path.join(__dirname, "..", "local-metadata");

function startMetadataServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Content-Type", "application/json");
      const filePath = path.join(METADATA_DIR, req.url);
      if (fs.existsSync(filePath)) {
        res.writeHead(200);
        res.end(fs.readFileSync(filePath, "utf-8"));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Not found" }));
      }
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`      ✔ Metadata server already running on port ${METADATA_PORT}`);
        resolve(null);
      } else {
        throw err;
      }
    });

    server.listen(METADATA_PORT, () => {
      console.log(`      ✔ Metadata server: http://localhost:${METADATA_PORT}/`);
      resolve(server);
    });
  });
}

// ─── Random helpers ───────────────────────────────────────────────────────────

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Listing prices now in GOLD tokens (whole numbers)
const GOLD_PRICES = ["10", "25", "50", "100", "150", "200"];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const signers = await ethers.getSigners();
  const [admin, player1, player2, player3] = signers;
  const players = [player1, player2, player3];
  const playerNames = ["Player 1", "Player 2", "Player 3"];
  const BASE_URI = `http://localhost:${METADATA_PORT}/`;
  const ALL_TOKEN_IDS = [1, 2, 3, 4, 5, 6];

  console.log("\n══════════════════════════════════════");
  console.log("  EAI PROJECT — RANDOM LOCAL DEPLOY");
  console.log("  (GOLD Token Economy + NFT Relics)");
  console.log("══════════════════════════════════════");
  console.log(`Admin    : ${admin.address}`);
  players.forEach((p, i) => console.log(`${playerNames[i]} : ${p.address}`));

  // ── 1. Metadata server ──────────────────────────────────────────────────────
  console.log("\n[1/9] Starting metadata server...");
  await startMetadataServer();

  // ── 2. Deploy EAIGold (ERC-20) ──────────────────────────────────────────────
  console.log("\n[2/9] Deploying EAIGold (ERC-20)...");
  const EAIGold = await ethers.getContractFactory("EAIGold");
  const goldContract = await EAIGold.deploy(admin.address);
  await goldContract.waitForDeployment();
  const goldAddress = await goldContract.getAddress();
  console.log(`      ✔ EAIGold deployed to: ${goldAddress}`);

  // ── 3. Deploy EAIProject (ERC-1155) ─────────────────────────────────────────
  console.log("\n[3/9] Deploying EAIProject (ERC-1155)...");
  const EAIProject = await ethers.getContractFactory("EAIProject");
  const contract = await EAIProject.deploy(admin.address, goldAddress);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`      ✔ EAIProject deployed to: ${contractAddress}`);

  // ── 4. Deploy EAINFT (ERC-721) ──────────────────────────────────────────────
  console.log("\n[4/9] Deploying EAINFT (ERC-721)...");
  const EAINFT = await ethers.getContractFactory("EAINFT");
  const nftContract = await EAINFT.deploy(admin.address, goldAddress);
  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();
  console.log(`      ✔ EAINFT deployed to: ${nftAddress}`);

  // ── 5. Mint RANDOM tokens (ERC-1155) ────────────────────────────────────────
  console.log("\n[5/9] Minting random inventories (ERC-1155)...");

  // Each player gets 2-4 random token types, each with 1-15 units
  const mintPlan = []; // { playerIdx, tokenId, amount }

  for (let pIdx = 0; pIdx < 3; pIdx++) {
    const numTypes = randInt(2, 4);
    const tokenIds = shuffle(ALL_TOKEN_IDS).slice(0, numTypes);

    for (const tokenId of tokenIds) {
      const amount = randInt(1, 15);
      mintPlan.push({ playerIdx: pIdx, tokenId, amount });
    }
  }

  for (const mint of mintPlan) {
    const tokenURI = `${BASE_URI}${mint.tokenId}.json`;
    await contract.connect(admin).mint(
      players[mint.playerIdx].address,
      mint.tokenId,
      mint.amount,
      tokenURI,
      "0x"
    );
    console.log(`      ✔ ${playerNames[mint.playerIdx]}: Token #${mint.tokenId} ×${mint.amount}`);
  }

  // ── 6. Mint NFT Relics (ERC-721) ────────────────────────────────────────────
  console.log("\n[6/9] Minting NFT relics (ERC-721)...");
  const nftMetadata = [
    { file: "nft-100.json", name: "Stellar Core Fragment / Crown of the Ancients" },
    { file: "nft-101.json", name: "Void Engine Shard / Scepter of Eternal Flame" },
    { file: "nft-102.json", name: "Nebula Heart Crystal / Orb of the Dragon King" },
  ];

  for (let i = 0; i < 3; i++) {
    const tokenURI = `${BASE_URI}${nftMetadata[i].file}`;
    const tx = await nftContract.connect(admin).mintRelic(players[i].address, tokenURI);
    const receipt = await tx.wait();
    console.log(`      ✔ ${playerNames[i]}: NFT #${100 + i} — ${nftMetadata[i].name}`);
  }

  // ── 7. Approve marketplace ──────────────────────────────────────────────────
  console.log("\n[7/9] Approving marketplace...");
  for (let i = 0; i < 3; i++) {
    // Approve ERC-1155 marketplace
    await contract.connect(players[i]).setApprovalForAll(contractAddress, true);
    // Approve ERC-721 marketplace (approveForAll for the NFT contract)
    await nftContract.connect(players[i]).setApprovalForAll(nftAddress, true);
    console.log(`      ✔ ${playerNames[i]} approved (ERC-1155 + ERC-721)`);
  }

  // ── 8. GOLD balances / ETH setup ────────────────────────────────────────────
  console.log("\n[8/9] Setting player ETH balances to 1 ETH...");
  const TARGET_ETH = ethers.parseEther("1");
  for (let i = 0; i < 3; i++) {
    const currentBalance = await ethers.provider.getBalance(players[i].address);
    const excess = currentBalance - TARGET_ETH;
    if (excess > 0n) {
      const tx = await players[i].sendTransaction({
        to: admin.address,
        value: excess - ethers.parseEther("0.001"), // tiny buffer for gas
      });
      await tx.wait();
    }
    const finalBalance = await ethers.provider.getBalance(players[i].address);
    const goldBal = await goldContract.balanceOf(players[i].address);
    console.log(`      ✔ ${playerNames[i]}: ${ethers.formatEther(finalBalance).slice(0, 6)} ETH | ${parseFloat(ethers.formatEther(goldBal)).toFixed(2)} GOLD`);
  }

  // ── 9. Random listings (priced in GOLD) ─────────────────────────────────────
  console.log("\n[9/9] Creating random listings (GOLD prices)...");

  // Each player randomly lists 1-2 of their ERC-1155 items
  for (let pIdx = 0; pIdx < 3; pIdx++) {
    const playerMints = mintPlan.filter(m => m.playerIdx === pIdx);
    const numListings = Math.min(randInt(1, 2), playerMints.length);
    const toList = shuffle(playerMints).slice(0, numListings);

    for (const item of toList) {
      const listAmount = randInt(1, Math.max(1, Math.floor(item.amount / 2)));
      const price = GOLD_PRICES[randInt(0, GOLD_PRICES.length - 1)];
      const priceWei = ethers.parseEther(price); // GOLD has 18 decimals like ETH

      await contract.connect(players[pIdx]).listForSale(item.tokenId, listAmount, priceWei);
      console.log(`      ✔ ${playerNames[pIdx]}: Token #${item.tokenId} ×${listAmount} @ ${price} GOLD`);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("══════════════════════════════════════");
  console.log(`EAIGold Address  : ${goldAddress}`);
  console.log(`EAIProject Addr  : ${contractAddress}`);
  console.log(`EAINFT Address   : ${nftAddress}`);
  console.log(`Metadata Server  : ${BASE_URI}`);
  console.log("");

  for (let pIdx = 0; pIdx < 3; pIdx++) {
    const items = mintPlan.filter(m => m.playerIdx === pIdx)
      .map(m => `#${m.tokenId}(×${m.amount})`)
      .join(", ");
    const ethBal = ethers.formatEther(await ethers.provider.getBalance(players[pIdx].address));
    const goldBal = ethers.formatEther(await goldContract.balanceOf(players[pIdx].address));
    console.log(`  ${playerNames[pIdx]}: ${items} + NFT#${100 + pIdx} | ${ethBal.slice(0, 6)} ETH | ${parseFloat(goldBal).toFixed(2)} GOLD`);
  }

  console.log("");
  console.log(`>>> Actualiza en ambos app.js:`);
  console.log(`    contractAddress:     "${contractAddress}"`);
  console.log(`    goldContractAddress: "${goldAddress}"`);
  console.log(`    nftContractAddress:  "${nftAddress}"`);
  console.log(">>> NO cierres esta terminal — el metadata server debe seguir corriendo.");
  console.log("══════════════════════════════════════\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
