/**
 * Game A — Space Edition
 * Ethers.js integration for the EAI interoperable asset ecosystem.
 * Reads the same TokenID from the EAIProject contract as Game B,
 * but renders the asset with a space-themed context.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  // Replace with deployed contract address after running: npx hardhat run scripts/deploy.js
  contractAddress: "0x0000000000000000000000000000000000000000",
  networkName: "Polygon Amoy Testnet",
  chainId: 80002,
  ipfsGateway: "https://ipfs.io/ipfs/",
};

// Minimal ABI — only the functions we need in the frontend
const EAI_ABI = [
  "function uri(uint256 tokenId) view returns (string)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function listings(address seller, uint256 tokenId) view returns (uint256 amount, uint256 pricePerUnit, bool active)",
  "function setApprovalForAll(address operator, bool approved)",
  "function buyItem(address seller, uint256 tokenId, uint256 amount) payable",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
];

// ─── State ────────────────────────────────────────────────────────────────────

let provider = null;
let signer = null;
let contract = null;
let currentTokenId = null;
let currentMetadata = null;
let currentSeller = null;

// ─── DOM helpers ─────────────────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);
const show = (id) => $(id).classList.remove("hidden");
const hide = (id) => $(id).classList.add("hidden");
const setStatus = (msg, isError = false) => {
  const el = $("status-msg");
  el.textContent = msg;
  el.style.color = isError ? "#ff4c4c" : "#7effd4";
};

// ─── Wallet connection ────────────────────────────────────────────────────────

$("connect-btn").addEventListener("click", connectWallet);

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    setStatus("MetaMask not detected. Please install MetaMask.", true);
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const address = await signer.getAddress();

    contract = new ethers.Contract(CONFIG.contractAddress, EAI_ABI, signer);

    $("wallet-address").textContent = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
    show("wallet-address");
    $("connect-btn").textContent = "Wallet Connected ✓";
    $("connect-btn").disabled = true;

    setStatus("Wallet connected. Enter a Token ID to load an asset.");
  } catch (err) {
    setStatus(`Connection failed: ${err.message}`, true);
  }
}

// ─── Asset loading ────────────────────────────────────────────────────────────

$("load-asset-btn").addEventListener("click", loadAsset);

async function loadAsset() {
  if (!contract) {
    setStatus("Please connect your wallet first.", true);
    return;
  }

  const tokenId = parseInt($("token-id-input").value);
  if (!tokenId || tokenId < 1) {
    setStatus("Please enter a valid Token ID.", true);
    return;
  }

  try {
    setStatus("Loading asset from blockchain...");
    currentTokenId = tokenId;

    const rawUri = await contract.uri(tokenId);
    const metadataUri = resolveIPFS(rawUri);

    const response = await fetch(metadataUri);
    if (!response.ok) throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    currentMetadata = await response.json();

    renderAsset(currentMetadata);
    await loadListing(tokenId);
    setStatus("Asset loaded successfully.");
  } catch (err) {
    setStatus(`Error loading asset: ${err.message}`, true);
  }
}

function resolveIPFS(uri) {
  if (uri.startsWith("ipfs://")) {
    return CONFIG.ipfsGateway + uri.slice(7);
  }
  return uri;
}

// ─── Asset rendering (Space theme) ───────────────────────────────────────────

function renderAsset(metadata) {
  // Name
  $("asset-name").textContent = getSpaceName(metadata.name);

  // Description
  $("asset-description").textContent = metadata.description || "";

  // Image
  const imgEl = $("asset-image");
  if (metadata.image) {
    imgEl.src = resolveIPFS(metadata.image);
    imgEl.alt = metadata.name;
  }

  // Attributes
  const attrs = metadata.attributes || [];
  const rarity = attrs.find((a) => a.trait_type === "rarity")?.value || "";
  const gameSkin = attrs.find((a) => a.trait_type === "game_a_skin")?.value || metadata.name;

  $("card-rarity").textContent = rarity;
  $("game-skin").textContent = gameSkin;

  // Stats grid — only show immutable technical attributes
  const statsEl = $("asset-stats");
  statsEl.innerHTML = "";
  const immutableAttrs = attrs.filter((a) => a.immutable && a.trait_type !== "rarity");
  immutableAttrs.forEach((attr) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `<span class="stat-label">${formatLabel(attr.trait_type)}</span>
                      <span class="stat-value">${attr.value}${attr.max_value ? ` / ${attr.max_value}` : ""}</span>`;
    statsEl.appendChild(stat);
  });

  show("asset-card");
}

function getSpaceName(rawName) {
  // If the name contains " / ", take the first part (space theme)
  if (rawName && rawName.includes(" / ")) return rawName.split(" / ")[0].trim();
  return rawName || "Unknown Asset";
}

function formatLabel(str) {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

async function loadListing(tokenId) {
  if (!signer) return;
  try {
    const userAddress = await signer.getAddress();
    const listing = await contract.listings(userAddress, tokenId);

    if (listing.active) {
      currentSeller = userAddress;
      $("listing-amount").textContent = listing.amount.toString();
      $("listing-price").textContent = ethers.formatEther(listing.pricePerUnit);
      show("listing-info");
      hide("no-listing-msg");
    } else {
      hide("listing-info");
      show("no-listing-msg");
    }
    show("market-section");
  } catch {
    hide("market-section");
  }
}

$("buy-btn").addEventListener("click", buyItem);

async function buyItem() {
  if (!contract || !currentTokenId || !currentSeller) return;

  const amount = parseInt($("buy-amount").value);
  if (!amount || amount < 1) {
    setStatus("Enter a valid amount to buy.", true);
    return;
  }

  try {
    setStatus("Initiating purchase...");
    const listing = await contract.listings(currentSeller, currentTokenId);
    const totalPrice = listing.pricePerUnit * BigInt(amount);

    const tx = await contract.buyItem(currentSeller, currentTokenId, amount, { value: totalPrice });
    setStatus("Transaction submitted. Waiting for confirmation...");
    await tx.wait();

    setStatus(`Purchase successful! You acquired ${amount} unit(s) of this space asset.`);
    await loadListing(currentTokenId);
  } catch (err) {
    setStatus(`Purchase failed: ${err.message}`, true);
  }
}
