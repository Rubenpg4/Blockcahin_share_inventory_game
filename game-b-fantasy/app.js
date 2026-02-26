/**
 * Game B — Fantasy Realm
 * Auto-wallet login + inventory grid + friend trading.
 * Same wallet accounts as Game A but rendered with fantasy theme.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  rpcUrl: "http://127.0.0.1:8545",
  metadataBase: "http://localhost:3333/",
  maxTokenId: 6,
  gameKey: "b",
};

// Same Hardhat accounts — different character names for fantasy
const PLAYERS = [
  {
    id: 1,
    name: "Knight Aldric",
    avatar: "🛡️",
    hint: "Master of arms",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  },
  {
    id: 2,
    name: "Mage Elara",
    avatar: "🧙",
    hint: "Arcane seeker",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  },
  {
    id: 3,
    name: "Ranger Fenn",
    avatar: "🏹",
    hint: "Relic hunter",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  },
];

const EAI_ABI = [
  "function uri(uint256 tokenId) view returns (string)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function totalSupply(uint256 id) view returns (uint256)",
  "function listings(address seller, uint256 tokenId) view returns (uint256 amount, uint256 pricePerUnit, bool active)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
  "function listForSale(uint256 tokenId, uint256 amount, uint256 pricePerUnit)",
  "function cancelListing(uint256 tokenId)",
  "function buyItem(address seller, uint256 tokenId, uint256 amount) payable",
  "function getAllActiveListings() view returns (tuple(address seller, uint256 tokenId, uint256 amount, uint256 pricePerUnit)[])"
];

// ─── State ────────────────────────────────────────────────────────────────────

let provider = null;
let wallet = null;
let contract = null;
let currentPlayer = null;
let inventoryCache = [];
let selectedItem = null;

// ─── DOM helpers ──────────────────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);
const show = (el) => { if (typeof el === "string") el = $(el); el.classList.remove("hidden"); };
const hide = (el) => { if (typeof el === "string") el = $(el); el.classList.add("hidden"); };

const setStatus = (msg, isError = false) => {
  const el = $("status-msg");
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? "#c9392f" : "";
  const dot = $("status-indicator");
  if (dot) {
    dot.style.background = isError ? "#c9392f" : "#d4a639";
    dot.style.boxShadow = `0 0 6px ${isError ? "#c9392f" : "#d4a639"}`;
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

document.querySelectorAll(".player-card").forEach((card) => {
  card.addEventListener("click", () => {
    const playerId = parseInt(card.dataset.player);
    loginAsPlayer(playerId);
  });
});

async function loginAsPlayer(playerId) {
  currentPlayer = PLAYERS.find((p) => p.id === playerId);
  if (!currentPlayer) return;

  try {
    provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    wallet = new ethers.Wallet(currentPlayer.privateKey, provider);
    contract = new ethers.Contract(CONFIG.contractAddress, EAI_ABI, wallet);

    // Listen to blockchain events for reactive UI
    contract.removeAllListeners();
    contract.on("ItemListed", (seller) => {
      loadGlobalMarket();
      loadInventory();
      if (seller !== currentPlayer.address) {
        showToast("New relic found in the grand bazaar!");
      }
    });
    contract.on("ItemSold", () => { updateBalance(); loadInventory(); loadGlobalMarket(); });
    contract.on("ListingCancelled", () => { loadGlobalMarket(); });

    hide("login-screen");
    show("game-screen");

    $("user-avatar").textContent = currentPlayer.avatar;
    $("user-name").textContent = currentPlayer.name;
    $("user-addr").textContent = `${currentPlayer.address.slice(0, 6)}···${currentPlayer.address.slice(-4)}`;

    setStatus("Portal opened. Revealing relics...");
    await updateBalance();
    await loadInventory();
    loadGlobalMarket();
    setStatus("Your relics have been revealed.");
  } catch (err) {
    alert(`Connection failed: ${err.message}\n\nMake sure the Hardhat node is running (npx hardhat node)`);
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

$("logout-btn").addEventListener("click", () => {
  if (contract) contract.removeAllListeners();
  hide("game-screen");
  show("login-screen");
  currentPlayer = null;
  wallet = null;
  contract = null;
  inventoryCache = [];
  selectedItem = null;
  const panel = $("detail-panel");
  panel.classList.remove("visible");
  panel.classList.add("hidden");
});

$("refresh-all-btn").addEventListener("click", async () => {
  if (!contract || !currentPlayer) return;
  const btn = $("refresh-all-btn");
  btn.disabled = true;
  btn.textContent = "Refreshing...";

  try {
    await updateBalance();
    await loadInventory();
    await loadGlobalMarket();
    setStatus("Realms synchronized.");
  } catch (err) {
    setStatus(`Sync failed: ${err.message}`, true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Refresh";
  }
});

// ─── Balance Checking ───────────────────────────────────────────────────────────

async function updateBalance() {
  if (!provider || !currentPlayer) return;
  try {
    const bal = await provider.getBalance(currentPlayer.address);
    const ethVal = ethers.formatEther(bal);
    $("user-balance").textContent = `${ethVal.slice(0, 6)} ETH`;
  } catch (err) {
    console.error("Failed to update balance:", err);
  }
}

// ─── Inventory loading ────────────────────────────────────────────────────────

async function loadInventory() {
  if (!contract || !currentPlayer) return;

  inventoryCache = [];
  const grid = $("inventory-grid");
  grid.innerHTML = "";
  let itemCount = 0;

  for (let tokenId = 1; tokenId <= CONFIG.maxTokenId; tokenId++) {
    try {
      const balance = await contract.balanceOf(currentPlayer.address, tokenId);
      if (balance > 0n) {
        const metadata = await fetchMetadata(tokenId);
        if (metadata) {
          const item = { tokenId, metadata, balance: Number(balance) };
          inventoryCache.push(item);
          grid.appendChild(createItemCell(item));
          itemCount++;
        }
      }
    } catch { /* skip */ }
  }

  if (itemCount === 0) {
    grid.innerHTML = `<div class="empty-inventory"><p>No relics found in your vault</p></div>`;
  }

  $("inventory-count").textContent = `${itemCount} relic${itemCount !== 1 ? "s" : ""}`;
}

async function fetchMetadata(tokenId) {
  try {
    let url;
    try {
      const uri = await contract.uri(tokenId);
      url = uri.startsWith("ipfs://") ? CONFIG.metadataBase + tokenId + ".json" : uri;
    } catch { url = CONFIG.metadataBase + tokenId + ".json"; }
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch { return null; }
}

// ─── Theme helpers (Fantasy) ──────────────────────────────────────────────────

function getThemedName(meta) {
  if (meta.name && meta.name.includes(" / ")) return meta.name.split(" / ")[1].trim();
  const s = (meta.attributes || []).find(a => a.trait_type === "game_b_skin");
  return s ? s.value : meta.name || "Unknown Relic";
}

function getThemedIcon(meta) {
  const i = (meta.attributes || []).find(a => a.trait_type === "game_b_icon");
  return i ? i.value : "📦";
}

function getRarity(meta) {
  const a = (meta.attributes || []).find(a => a.trait_type === "rarity");
  return a ? a.value : "Common";
}

// ─── Item cell rendering ──────────────────────────────────────────────────────

function createItemCell(item, isMarket = false, sellerAddr = null) {
  const { tokenId, metadata, balance } = item;
  const name = getThemedName(metadata);
  const icon = getThemedIcon(metadata);
  const rarity = getRarity(metadata);

  const cell = document.createElement("div");
  cell.className = `item-cell rarity-${rarity.toLowerCase()}`;
  cell.dataset.tokenId = tokenId;

  let extra = "";
  if (isMarket && item.listing) {
    const priceEth = ethers.formatEther(item.listing.pricePerUnit);
    extra = `<span class="item-price">${priceEth} ETH</span>
             <button class="btn-buy" data-seller="${sellerAddr}" data-token="${tokenId}">Buy</button>`;
  }

  cell.innerHTML = `
    <span class="item-icon">${icon}</span>
    <span class="item-name">${name}</span>
    <span class="item-qty">×${balance}</span>
    <span class="item-rarity-label ${rarity.toLowerCase()}">${rarity}</span>
    ${extra}
  `;

  if (!isMarket) cell.addEventListener("click", () => openDetailPanel(item));

  if (isMarket && item.listing) {
    cell.querySelector(".btn-buy")?.addEventListener("click", (e) => {
      e.stopPropagation();
      buyMarketItem(sellerAddr, tokenId, item.listing.pricePerUnit);
    });
  }

  return cell;
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function openDetailPanel(item) {
  const { tokenId, metadata, balance } = item;
  const attrs = metadata.attributes || [];
  const rarity = getRarity(metadata);

  document.querySelectorAll(".item-cell.selected").forEach(c => c.classList.remove("selected"));
  selectedItem = item;

  $("detail-icon").textContent = getThemedIcon(metadata);
  $("detail-name").textContent = getThemedName(metadata);
  $("detail-description").textContent = metadata.description || "";
  $("detail-balance").textContent = balance;

  const rarityEl = $("detail-rarity");
  rarityEl.textContent = rarity;
  rarityEl.className = `detail-rarity ${rarity.toLowerCase()}`;

  const skin = attrs.find(a => a.trait_type === "game_b_skin");
  $("detail-skin").textContent = skin ? skin.value : "—";

  const statsEl = $("detail-stats");
  statsEl.innerHTML = "";
  attrs.filter(a => a.immutable && a.trait_type !== "rarity").forEach(attr => {
    const s = document.createElement("div");
    s.className = "stat";
    s.innerHTML = `<span class="stat-label">${attr.trait_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                   <span class="stat-value">${attr.value}${attr.max_value ? ` / ${attr.max_value}` : ""}</span>`;
    statsEl.appendChild(s);
  });

  $("sell-amount").value = 1;
  $("sell-amount").max = balance;

  const panel = $("detail-panel");
  panel.classList.remove("hidden");
  void panel.offsetWidth;
  panel.classList.add("visible");
}

$("close-detail").addEventListener("click", () => {
  $("detail-panel").classList.remove("visible");
  setTimeout(() => $("detail-panel").classList.add("hidden"), 350);
  selectedItem = null;
});

// ─── List for Sale ────────────────────────────────────────────────────────────

$("list-btn").addEventListener("click", async () => {
  if (!contract || !selectedItem) return;
  const amount = parseInt($("sell-amount").value);
  const priceStr = $("sell-price").value;
  if (!amount || amount < 1 || !priceStr || parseFloat(priceStr) <= 0) {
    setStatus("Enter valid amount and price.", true); return;
  }
  try {
    setStatus("Listing relic for sale...");
    const approved = await contract.isApprovedForAll(currentPlayer.address, CONFIG.contractAddress);
    if (!approved) {
      const tx0 = await contract.setApprovalForAll(CONFIG.contractAddress, true);
      await tx0.wait();
    }
    const tx = await contract.listForSale(selectedItem.tokenId, amount, ethers.parseEther(priceStr));
    await tx.wait();
    setStatus(`Listed ${amount} relic(s) at ${priceStr} ETH each!`);
    await updateBalance();
    await loadInventory();
  } catch (err) { setStatus(`Listing failed: ${err.message}`, true); }
});

// ─── Global Market System ───────────────────────────────────────────────────

async function loadGlobalMarket() {
  if (!contract || !currentPlayer) return;

  const grid = $("global-market-grid");
  grid.innerHTML = "";

  let found = 0;

  try {
    const activeListings = await contract.getAllActiveListings();

    for (const listing of activeListings) {
      if (listing.seller === currentPlayer.address) continue; // Skip own listings

      const tokenId = Number(listing.tokenId);
      const metadata = await fetchMetadata(tokenId);
      if (!metadata) continue;

      const sellerObj = PLAYERS.find(p => p.address === listing.seller) || {
        name: "Unknown Trader",
        avatar: "👤",
        address: listing.seller
      };

      const amount = Number(listing.amount);
      const pricePerUnitWei = listing.pricePerUnit;
      const pricePerUnitEther = parseFloat(ethers.formatEther(pricePerUnitWei));
      const totalPrice = (amount * pricePerUnitEther).toFixed(3);

      const card = document.createElement("div");
      card.className = "market-card";
      card.innerHTML = `
        <div class="market-seller-info">
          <span class="market-seller-avatar">${sellerObj.avatar}</span>
          <span class="market-seller-name">${sellerObj.name}</span>
        </div>
        <div class="market-item-info">
          <div class="market-item-icon">${getThemedIcon(metadata)}</div>
          <div class="market-item-details">
            <div class="market-item-name">${getThemedName(metadata)}</div>
            <div class="market-item-pack">Pack of ${amount}</div>
            <div class="item-rarity-label ${getRarity(metadata).toLowerCase()}">${getRarity(metadata)}</div>
          </div>
        </div>
        <div class="market-price-row">
          <div>
            <span class="market-price-label">Price (ETH)</span>
            <span class="market-price-value">${totalPrice}</span>
          </div>
          <!-- Call the global window purchase function -->
          <button class="btn-action btn-buy" onclick="buyMarketPack('${listing.seller}', ${tokenId}, ${amount}, '${pricePerUnitWei.toString()}')">
            ${getThemedIcon(metadata)} Buy
          </button>
        </div>
      `;
      grid.appendChild(card);
      found++;
    }
  } catch (err) {
    console.error("Failed to load global market:", err);
    grid.innerHTML = `<div class="empty-inventory"><p style="color:red">Error loading market: ${err.message}</p></div>`;
    return;
  }

  if (found === 0) {
    grid.innerHTML = `<div class="empty-inventory"><p>Scouring the realms... No active listings found.</p></div>`;
  }
}

// Ensure buyMarketPack is exposed globally so inline onclick works
window.buyMarketPack = async function (seller, tokenId, packAmount, pricePerUnitWei) {
  if (!contract || !provider || !currentPlayer) return;
  try {
    const pricePerUnit = BigInt(pricePerUnitWei);
    const totalCost = pricePerUnit * BigInt(packAmount);

    const bal = await provider.getBalance(currentPlayer.address);
    if (bal < totalCost) {
      alert("Not enough gold! You do not have enough ETH to purchase this pack.");
      setStatus("Purchase cancelled: Insufficient funds.", true);
      return;
    }

    setStatus("Preparing gold for purchase...");
    const tx = await contract.buyItem(seller, tokenId, packAmount, { value: totalCost });
    await tx.wait();

    setStatus(`Purchase successful! Pack of ${packAmount} added to vault.`);
    await updateBalance();
    await loadInventory();
    loadGlobalMarket();
  } catch (err) {
    setStatus(`Purchase failed: ${err.message}`, true);
  }
}

// ─── Toasts ──────────────────────────────────────────────────────────────────

function showToast(message) {
  let toastContainer = $("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.position = "fixed";
    toastContainer.style.bottom = "20px";
    toastContainer.style.right = "20px";
    toastContainer.style.zIndex = "9999";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.style.background = "rgba(212, 166, 57, 0.9)";
  toast.style.color = "#0b0c10";
  toast.style.padding = "12px 20px";
  toast.style.marginBottom = "10px";
  toast.style.borderRadius = "4px";
  toast.style.boxShadow = "0 4px 12px rgba(212, 166, 57, 0.4)";
  toast.style.fontFamily = "'Cinzel', serif";
  toast.style.fontWeight = "bold";
  toast.style.animation = "fade-in-up 0.3s ease forwards";
  toast.innerText = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fade-out-down 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
