/**
 * Game B — Fantasy Realm
 * Auto-wallet login + inventory grid + friend trading.
 * Same wallet accounts as Game A but rendered with fantasy theme.
 * Economy powered by GOLD (ERC-20) token.
 * Supports ERC-1155 (shared items) + ERC-721 (unique NFT relics).
 */

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  goldContractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  nftContractAddress: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  rpcUrl: "http://127.0.0.1:8545",
  metadataBase: "http://localhost:3333/",
  maxTokenId: 6,
  gameKey: "b",
  goldRate: 0.00058, // 1 GOLD = 0.00058 ETH
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
  "function buyItem(address seller, uint256 tokenId, uint256 amount)",
  "function getAllActiveListings() view returns (tuple(address seller, uint256 tokenId, uint256 amount, uint256 pricePerUnit)[])"
];

const GOLD_ABI = [
  "function mintGold() payable",
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

const NFT_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function getAllMintedIds() view returns (uint256[])",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function listNFTForSale(uint256 tokenId, uint256 price)",
  "function buyNFT(uint256 tokenId)",
  "function cancelNFTListing(uint256 tokenId)",
  "function nftListings(uint256 tokenId) view returns (uint256 price, address seller, bool active)",
  "function getAllActiveNFTListings() view returns (uint256[] tokenIds, address[] sellers, uint256[] prices)"
];

// ─── State ────────────────────────────────────────────────────────────────────

let provider = null;
let wallet = null;
let contract = null;
let goldContract = null;
let nftContract = null;
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
    goldContract = new ethers.Contract(CONFIG.goldContractAddress, GOLD_ABI, wallet);
    nftContract = new ethers.Contract(CONFIG.nftContractAddress, NFT_ABI, wallet);

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

    // NFT events
    nftContract.removeAllListeners();
    nftContract.on("NFTListedForSale", (seller) => {
      loadGlobalMarket();
      if (seller !== currentPlayer.address) {
        showToast("🔥 A legendary artifact appeared in the bazaar!");
      }
    });
    nftContract.on("NFTSold", () => { updateBalance(); loadInventory(); loadGlobalMarket(); });
    nftContract.on("NFTListingCancelled", () => { loadGlobalMarket(); });

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
  if (nftContract) nftContract.removeAllListeners();
  hide("game-screen");
  show("login-screen");
  currentPlayer = null;
  wallet = null;
  contract = null;
  goldContract = null;
  nftContract = null;
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
    // GOLD balance (primary)
    const goldBal = await goldContract.balanceOf(currentPlayer.address);
    const goldVal = ethers.formatEther(goldBal);
    $("user-balance").textContent = `${parseFloat(goldVal).toFixed(2)} GOLD`;

    // ETH balance (secondary)
    const ethBal = await provider.getBalance(currentPlayer.address);
    const ethVal = ethers.formatEther(ethBal);
    $("user-balance-eth").textContent = `${ethVal.slice(0, 6)} ETH`;
  } catch (err) {
    console.error("Failed to update balance:", err);
  }
}

// ─── GOLD Conversion Popup ──────────────────────────────────────────────────

$("buy-gold-btn").addEventListener("click", () => {
  show("gold-modal");
  updateGoldPreview();
});

$("close-gold-modal").addEventListener("click", () => {
  hide("gold-modal");
});

$("gold-modal").addEventListener("click", (e) => {
  if (e.target.id === "gold-modal") hide("gold-modal");
});

$("gold-eth-input").addEventListener("input", updateGoldPreview);

function updateGoldPreview() {
  const ethAmount = parseFloat($("gold-eth-input").value) || 0;
  const goldAmount = ethAmount / CONFIG.goldRate;
  $("gold-preview").textContent = `≈ ${goldAmount.toFixed(2)} GOLD`;
}

$("convert-gold-btn").addEventListener("click", async () => {
  if (!goldContract || !currentPlayer) return;
  const ethAmount = parseFloat($("gold-eth-input").value);
  if (!ethAmount || ethAmount <= 0) {
    setStatus("Enter a valid ETH amount.", true);
    return;
  }

  try {
    setStatus("Converting ETH to GOLD...");
    const tx = await goldContract.mintGold({ value: ethers.parseEther(String(ethAmount)) });
    await tx.wait();
    await updateBalance();
    hide("gold-modal");
    setStatus(`Converted ${ethAmount} ETH to GOLD!`);
    showToast(`💰 Converted ${ethAmount} ETH to GOLD!`);
  } catch (err) {
    setStatus(`Conversion failed: ${err.message}`, true);
  }
});

// ─── Inventory loading ────────────────────────────────────────────────────────

async function loadInventory() {
  if (!contract || !currentPlayer) return;

  inventoryCache = [];
  const grid = $("inventory-grid");
  grid.innerHTML = "";
  let itemCount = 0;

  // Load ERC-1155 items
  for (let tokenId = 1; tokenId <= CONFIG.maxTokenId; tokenId++) {
    try {
      const balance = await contract.balanceOf(currentPlayer.address, tokenId);
      if (balance > 0n) {
        const metadata = await fetchMetadata(tokenId);
        if (metadata) {
          const item = { tokenId, metadata, balance: Number(balance), isNFT: false };
          inventoryCache.push(item);
          grid.appendChild(createItemCell(item));
          itemCount++;
        }
      }
    } catch { /* skip */ }
  }

  // Load ERC-721 NFTs
  try {
    const allNftIds = await nftContract.getAllMintedIds();
    for (const nftId of allNftIds) {
      try {
        const owner = await nftContract.ownerOf(nftId);
        if (owner.toLowerCase() === currentPlayer.address.toLowerCase()) {
          const metadata = await fetchNFTMetadata(Number(nftId));
          if (metadata) {
            const item = { tokenId: Number(nftId), metadata, balance: 1, isNFT: true };
            inventoryCache.push(item);
            grid.appendChild(createItemCell(item));
            itemCount++;
          }
        }
      } catch { /* skip */ }
    }
  } catch (err) {
    console.error("Failed to load NFTs:", err);
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

async function fetchNFTMetadata(tokenId) {
  try {
    let url;
    try {
      const uri = await nftContract.tokenURI(tokenId);
      url = uri.startsWith("ipfs://") ? CONFIG.metadataBase + `nft-${tokenId}.json` : uri;
    } catch {
      url = CONFIG.metadataBase + `nft-${tokenId}.json`;
    }
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

function hasGlow(meta) {
  const g = (meta.attributes || []).find(a => a.trait_type === "glow");
  return g && g.value === "orange";
}

// ─── Item cell rendering ──────────────────────────────────────────────────────

function createItemCell(item, isMarket = false, sellerAddr = null) {
  const { tokenId, metadata, balance } = item;
  const name = getThemedName(metadata);
  const icon = getThemedIcon(metadata);
  const rarity = getRarity(metadata);

  const cell = document.createElement("div");
  cell.className = `item-cell rarity-${rarity.toLowerCase()}`;
  if (item.isNFT || hasGlow(metadata)) {
    cell.classList.add("nft-relic");
  }
  cell.dataset.tokenId = tokenId;

  let extra = "";
  if (isMarket && item.listing) {
    const priceGold = ethers.formatEther(item.listing.price || item.listing.pricePerUnit);
    extra = `<span class="item-price">${priceGold} GOLD</span>`;
    if (item.isNFT) {
      extra += `<button class="btn-buy" data-seller="${sellerAddr}" data-token="${tokenId}">Buy NFT</button>`;
    } else {
      extra += `<button class="btn-buy" data-seller="${sellerAddr}" data-token="${tokenId}">Buy</button>`;
    }
  }

  const nftBadge = item.isNFT ? `<span class="nft-badge">NFT</span>` : "";

  cell.innerHTML = `
    <span class="item-icon">${icon}</span>
    ${nftBadge}
    <span class="item-name">${name}</span>
    <span class="item-qty">×${balance}</span>
    <span class="item-rarity-label ${rarity.toLowerCase()}">${rarity}</span>
    ${extra}
  `;

  if (!isMarket) cell.addEventListener("click", () => openDetailPanel(item));

  if (isMarket && item.listing) {
    cell.querySelector(".btn-buy")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (item.isNFT) {
        buyNFTItem(tokenId, item.listing.price);
      } else {
        buyMarketItem(sellerAddr, tokenId, item.listing.pricePerUnit);
      }
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
  attrs.filter(a => a.immutable && a.trait_type !== "rarity" && a.trait_type !== "glow").forEach(attr => {
    const s = document.createElement("div");
    s.className = "stat";
    s.innerHTML = `<span class="stat-label">${attr.trait_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                   <span class="stat-value">${attr.value}${attr.max_value ? ` / ${attr.max_value}` : ""}</span>`;
    statsEl.appendChild(s);
  });

  // Adjust sell form for NFT vs ERC-1155
  const sellAmountInput = $("sell-amount");
  if (item.isNFT) {
    sellAmountInput.value = 1;
    sellAmountInput.max = 1;
    sellAmountInput.disabled = true;
  } else {
    sellAmountInput.value = 1;
    sellAmountInput.max = balance;
    sellAmountInput.disabled = false;
  }

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
    if (selectedItem.isNFT) {
      // List NFT for sale
      setStatus("Listing artifact for sale...");
      const approved = await nftContract.isApprovedForAll(currentPlayer.address, CONFIG.nftContractAddress);
      if (!approved) {
        const tx0 = await nftContract.setApprovalForAll(CONFIG.nftContractAddress, true);
        await tx0.wait();
      }
      const tx = await nftContract.listNFTForSale(selectedItem.tokenId, ethers.parseEther(priceStr));
      await tx.wait();
      setStatus(`Listed artifact at ${priceStr} GOLD!`);
    } else {
      // List ERC-1155 for sale
      setStatus("Listing relic for sale...");
      const approved = await contract.isApprovedForAll(currentPlayer.address, CONFIG.contractAddress);
      if (!approved) {
        const tx0 = await contract.setApprovalForAll(CONFIG.contractAddress, true);
        await tx0.wait();
      }
      const tx = await contract.listForSale(selectedItem.tokenId, amount, ethers.parseEther(priceStr));
      await tx.wait();
      setStatus(`Listed ${amount} relic(s) at ${priceStr} GOLD each!`);
    }
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
    // Load ERC-1155 listings
    const activeListings = await contract.getAllActiveListings();

    for (const listing of activeListings) {
      if (listing.seller === currentPlayer.address) continue;

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
      const pricePerUnitGold = parseFloat(ethers.formatEther(pricePerUnitWei));
      const totalPrice = (amount * pricePerUnitGold).toFixed(2);

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
            <span class="market-price-label">Price (GOLD)</span>
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

    // Load ERC-721 NFT listings
    const [nftTokenIds, nftSellers, nftPrices] = await nftContract.getAllActiveNFTListings();

    for (let i = 0; i < nftTokenIds.length; i++) {
      const tokenId = Number(nftTokenIds[i]);
      const seller = nftSellers[i];
      const price = nftPrices[i];

      if (seller.toLowerCase() === currentPlayer.address.toLowerCase()) continue;

      const metadata = await fetchNFTMetadata(tokenId);
      if (!metadata) continue;

      const sellerObj = PLAYERS.find(p => p.address === seller) || {
        name: "Unknown Trader",
        avatar: "👤",
        address: seller
      };

      const priceGold = parseFloat(ethers.formatEther(price));

      const card = document.createElement("div");
      card.className = "market-card nft-relic-card";
      card.innerHTML = `
        <div class="market-seller-info">
          <span class="market-seller-avatar">${sellerObj.avatar}</span>
          <span class="market-seller-name">${sellerObj.name}</span>
        </div>
        <div class="market-item-info">
          <div class="market-item-icon">${getThemedIcon(metadata)}</div>
          <div class="market-item-details">
            <div class="market-item-name">${getThemedName(metadata)} <span class="nft-badge">NFT</span></div>
            <div class="market-item-pack">Unique Artifact</div>
            <div class="item-rarity-label legendary">Legendary</div>
          </div>
        </div>
        <div class="market-price-row">
          <div>
            <span class="market-price-label">Price (GOLD)</span>
            <span class="market-price-value">${priceGold.toFixed(2)}</span>
          </div>
          <button class="btn-action btn-buy btn-buy-nft" onclick="buyNFTFromMarket(${tokenId}, '${price.toString()}')">
            🔥 Buy Artifact
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
  if (!contract || !provider || !currentPlayer || !goldContract) return;
  try {
    const pricePerUnit = BigInt(pricePerUnitWei);
    const totalCost = pricePerUnit * BigInt(packAmount);

    // Check GOLD balance
    const goldBal = await goldContract.balanceOf(currentPlayer.address);
    if (goldBal < totalCost) {
      alert("Not enough gold! You do not have enough GOLD to purchase this pack. Use 'Buy GOLD' to convert ETH.");
      setStatus("Purchase cancelled: Insufficient GOLD.", true);
      return;
    }

    // Check and request GOLD allowance for the EAI contract
    const currentAllowance = await goldContract.allowance(currentPlayer.address, CONFIG.contractAddress);
    if (currentAllowance < totalCost) {
      setStatus("Approving GOLD spend...");
      const approveTx = await goldContract.approve(CONFIG.contractAddress, totalCost);
      await approveTx.wait();
    }

    setStatus("Preparing gold for purchase...");
    const tx = await contract.buyItem(seller, tokenId, packAmount);
    await tx.wait();

    setStatus(`Purchase successful! Pack of ${packAmount} added to vault.`);
    await updateBalance();
    await loadInventory();
    loadGlobalMarket();
  } catch (err) {
    setStatus(`Purchase failed: ${err.message}`, true);
  }
}

// Buy NFT from market
window.buyNFTFromMarket = async function (tokenId, priceWei) {
  if (!nftContract || !provider || !currentPlayer || !goldContract) return;
  try {
    const price = BigInt(priceWei);

    // Check GOLD balance
    const goldBal = await goldContract.balanceOf(currentPlayer.address);
    if (goldBal < price) {
      alert("Not enough gold! You do not have enough GOLD to purchase this artifact. Use 'Buy GOLD' to convert ETH.");
      setStatus("Purchase cancelled: Insufficient GOLD.", true);
      return;
    }

    // Check and request GOLD allowance for the NFT contract
    const currentAllowance = await goldContract.allowance(currentPlayer.address, CONFIG.nftContractAddress);
    if (currentAllowance < price) {
      setStatus("Approving GOLD spend for artifact...");
      const approveTx = await goldContract.approve(CONFIG.nftContractAddress, price);
      await approveTx.wait();
    }

    setStatus("Acquiring legendary artifact...");
    const tx = await nftContract.buyNFT(tokenId);
    await tx.wait();

    setStatus(`Artifact acquired! NFT #${tokenId} is now yours.`);
    showToast(`🔥 Legendary artifact NFT #${tokenId} acquired!`);
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
