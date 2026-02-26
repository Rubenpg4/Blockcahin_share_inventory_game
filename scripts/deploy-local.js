/**
 * deploy-local.js — Despliegue + Seed ALEATORIO en Hardhat Network local
 *
 * Uso:
 *   1. Terminal A: npx hardhat node
 *   2. Terminal B: npx hardhat run scripts/deploy-local.js --network localhost
 *
 * Cada vez que lo ejecutas, genera un inventario ALEATORIO para 3 jugadores
 * y crea listings de venta al azar. Incluye metadata server en puerto 3333.
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

const PRICES = ["0.005", "0.01", "0.02", "0.05", "0.08", "0.1"];

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
  console.log("══════════════════════════════════════");
  console.log(`Admin    : ${admin.address}`);
  players.forEach((p, i) => console.log(`${playerNames[i]} : ${p.address}`));

  // ── 1. Metadata server ──────────────────────────────────────────────────────
  console.log("\n[1/5] Starting metadata server...");
  await startMetadataServer();

  // ── 2. Deploy ───────────────────────────────────────────────────────────────
  console.log("\n[2/5] Deploying EAIProject...");
  const EAIProject = await ethers.getContractFactory("EAIProject");
  const contract = await EAIProject.deploy(admin.address);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`      ✔ Deployed to: ${contractAddress}`);

  // ── 3. Mint RANDOM tokens ───────────────────────────────────────────────────
  console.log("\n[3/5] Minting random inventories...");

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

  // ── 4. Approve marketplace ──────────────────────────────────────────────────
  console.log("\n[4/5] Approving marketplace...");
  for (let i = 0; i < 3; i++) {
    await contract.connect(players[i]).setApprovalForAll(contractAddress, true);
    console.log(`      ✔ ${playerNames[i]} approved`);
  }

  // ── 5. Random listings ──────────────────────────────────────────────────────
  console.log("\n[5/5] Creating random listings...");

  // Each player randomly lists 1-2 of their items
  for (let pIdx = 0; pIdx < 3; pIdx++) {
    const playerMints = mintPlan.filter(m => m.playerIdx === pIdx);
    const numListings = Math.min(randInt(1, 2), playerMints.length);
    const toList = shuffle(playerMints).slice(0, numListings);

    for (const item of toList) {
      const listAmount = randInt(1, Math.max(1, Math.floor(item.amount / 2)));
      const price = PRICES[randInt(0, PRICES.length - 1)];
      const priceWei = ethers.parseEther(price);

      await contract.connect(players[pIdx]).listForSale(item.tokenId, listAmount, priceWei);
      console.log(`      ✔ ${playerNames[pIdx]}: Token #${item.tokenId} ×${listAmount} @ ${price} ETH`);
    }
  }

  // ── 6. Set realistic ETH balances ───────────────────────────────────────────
  console.log("\n[6/6] Setting realistic ETH balances...");

  const TARGET_BALANCES = [
    ethers.parseEther(String(randInt(1, 5))),  // Player 1: 1-5 ETH
    ethers.parseEther(String(randInt(1, 5))),  // Player 2: 1-5 ETH
    ethers.parseEther(String(randInt(1, 5))),  // Player 3: 1-5 ETH
  ];

  for (let i = 0; i < 3; i++) {
    const currentBalance = await ethers.provider.getBalance(players[i].address);
    const excess = currentBalance - TARGET_BALANCES[i];
    if (excess > 0n) {
      // Send excess ETH back to admin to drain it
      const tx = await players[i].sendTransaction({
        to: admin.address,
        value: excess - ethers.parseEther("0.01"), // keep tiny buffer for gas
      });
      await tx.wait();
    }
    const finalBalance = await ethers.provider.getBalance(players[i].address);
    console.log(`      ✔ ${playerNames[i]}: ${ethers.formatEther(finalBalance).slice(0, 6)} ETH`);
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("══════════════════════════════════════");
  console.log(`Contract Address : ${contractAddress}`);
  console.log(`Metadata Server  : ${BASE_URI}`);
  console.log("");

  for (let pIdx = 0; pIdx < 3; pIdx++) {
    const items = mintPlan.filter(m => m.playerIdx === pIdx)
      .map(m => `#${m.tokenId}(×${m.amount})`)
      .join(", ");
    const bal = ethers.formatEther(await ethers.provider.getBalance(players[pIdx].address));
    console.log(`  ${playerNames[pIdx]}: ${items} | ${bal.slice(0, 6)} ETH`);
  }

  console.log("");
  console.log(`>>> Actualiza contractAddress en ambos app.js a: "${contractAddress}"`);
  console.log(">>> NO cierres esta terminal — el metadata server debe seguir corriendo.");
  console.log("══════════════════════════════════════\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
