// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EAINFT — Reliquias Únicas del Ecosistema de Activos Interoperables
 * @notice Contrato ERC-721 para NFTs irrepetibles con mercado integrado.
 *         Cada reliquia tiene un ID único auto-incremental.
 *         Las ventas se pagan en GOLD (ERC-20) con comisión ≥ 2.5%.
 *         Todos los metadatos incluyen la propiedad visual "glow: orange".
 */
contract EAINFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    // ─── Estado ──────────────────────────────────────────────────────────────────

    /// @notice Siguiente ID a acuñar (empieza en 100 para evitar colisión con ERC-1155)
    uint256 private _nextTokenId = 100;

    /// @notice Referencia al token ERC-20 GOLD utilizado como moneda del mercado
    IERC20 public goldToken;

    /// @dev Porcentaje de comisión del mercado en puntos básicos (250 = 2.5%)
    uint256 public marketFee = 250;

    /// @dev Acumulado de comisiones disponibles para retirar (en GOLD tokens)
    uint256 public accumulatedFees;

    /// @notice Listados activos de NFTs en el mercado
    struct NFTListing {
        uint256 price; // en GOLD tokens (18 decimales)
        address seller;
        bool active;
    }

    /// @dev tokenId => NFTListing
    mapping(uint256 => NFTListing) public nftListings;

    /// @dev Array de tokenIds que han sido listados alguna vez
    uint256[] public allListedTokenIds;
    mapping(uint256 => bool) public hasEverBeenListed;

    /// @dev Tracking de todos los IDs acuñados para consultar inventario
    uint256[] public allMintedIds;

    // ─── Eventos ─────────────────────────────────────────────────────────────────

    event RelicMinted(address indexed to, uint256 indexed tokenId, string uri);
    event NFTListedForSale(
        address indexed seller,
        uint256 indexed tokenId,
        uint256 price
    );
    event NFTSold(
        address indexed seller,
        address indexed buyer,
        uint256 indexed tokenId,
        uint256 price
    );
    event NFTListingCancelled(address indexed seller, uint256 indexed tokenId);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // ─── Constructor ─────────────────────────────────────────────────────────────

    constructor(
        address initialOwner,
        address goldTokenAddress
    ) ERC721("EAI Relics", "RELIC") Ownable(initialOwner) {
        goldToken = IERC20(goldTokenAddress);
    }

    // ─── Mint ────────────────────────────────────────────────────────────────────

    /**
     * @notice Acuña una nueva reliquia con ID único auto-incremental.
     * @param to       Dirección receptora.
     * @param _tokenURI URI de los metadatos (debe incluir glow: orange).
     * @return tokenId El ID asignado al nuevo NFT.
     */
    function mintRelic(
        address to,
        string memory _tokenURI
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        allMintedIds.push(tokenId);

        emit RelicMinted(to, tokenId, _tokenURI);
        return tokenId;
    }

    /**
     * @notice Devuelve todos los IDs de NFTs acuñados.
     */
    function getAllMintedIds() external view returns (uint256[] memory) {
        return allMintedIds;
    }

    // ─── Mercado ─────────────────────────────────────────────────────────────────

    /**
     * @notice Lista un NFT a la venta por un precio en GOLD.
     * @param tokenId ID del NFT a listar.
     * @param price   Precio en GOLD tokens (18 decimales).
     */
    function listNFTForSale(uint256 tokenId, uint256 price) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "EAINFT: caller is not the owner"
        );
        require(price > 0, "EAINFT: price must be greater than zero");
        require(
            getApproved(tokenId) == address(this) ||
                isApprovedForAll(msg.sender, address(this)),
            "EAINFT: contract not approved to transfer NFT"
        );

        nftListings[tokenId] = NFTListing({
            price: price,
            seller: msg.sender,
            active: true
        });

        if (!hasEverBeenListed[tokenId]) {
            hasEverBeenListed[tokenId] = true;
            allListedTokenIds.push(tokenId);
        }

        emit NFTListedForSale(msg.sender, tokenId, price);
    }

    /**
     * @notice Compra un NFT listado pagando en GOLD.
     * @param tokenId ID del NFT a comprar.
     */
    function buyNFT(uint256 tokenId) external nonReentrant {
        NFTListing storage listing = nftListings[tokenId];

        require(listing.active, "EAINFT: listing not active");
        require(
            ownerOf(tokenId) == listing.seller,
            "EAINFT: seller no longer owns this NFT"
        );
        require(
            msg.sender != listing.seller,
            "EAINFT: cannot buy your own NFT"
        );

        uint256 totalPrice = listing.price;

        // Desactiva el listado antes de transferir (checks-effects-interactions)
        listing.active = false;

        // Calcula y acumula la comisión del mercado (en GOLD)
        uint256 fee = (totalPrice * marketFee) / 10000;
        uint256 sellerProceeds = totalPrice - fee;
        accumulatedFees += fee;

        // Transfiere GOLD del comprador al vendedor
        require(
            goldToken.transferFrom(msg.sender, listing.seller, sellerProceeds),
            "EAINFT: GOLD transfer to seller failed"
        );

        // Transfiere la comisión en GOLD al contrato
        require(
            goldToken.transferFrom(msg.sender, address(this), fee),
            "EAINFT: GOLD fee transfer failed"
        );

        // Transfiere el NFT al comprador
        _transfer(listing.seller, msg.sender, tokenId);

        emit NFTSold(listing.seller, msg.sender, tokenId, totalPrice);
    }

    /**
     * @notice Cancela un listado activo de NFT.
     * @param tokenId ID del NFT cuyo listado se cancela.
     */
    function cancelNFTListing(uint256 tokenId) external {
        NFTListing storage listing = nftListings[tokenId];
        require(listing.active, "EAINFT: no active listing");
        require(
            ownerOf(tokenId) == msg.sender,
            "EAINFT: caller is not the owner"
        );

        listing.active = false;
        emit NFTListingCancelled(msg.sender, tokenId);
    }

    /**
     * @notice Devuelve todas las ofertas activas de NFTs en el mercado.
     */
    function getAllActiveNFTListings()
        external
        view
        returns (
            uint256[] memory tokenIds,
            address[] memory sellers,
            uint256[] memory prices
        )
    {
        uint256 activeCount = 0;
        uint256 total = allListedTokenIds.length;

        for (uint256 i = 0; i < total; i++) {
            uint256 tid = allListedTokenIds[i];
            if (nftListings[tid].active) {
                activeCount++;
            }
        }

        tokenIds = new uint256[](activeCount);
        sellers = new address[](activeCount);
        prices = new uint256[](activeCount);
        uint256 idx = 0;

        for (uint256 i = 0; i < total; i++) {
            uint256 tid = allListedTokenIds[i];
            NFTListing storage l = nftListings[tid];
            if (l.active) {
                tokenIds[idx] = tid;
                sellers[idx] = l.seller;
                prices[idx] = l.price;
                idx++;
            }
        }
    }

    // ─── Comisiones ──────────────────────────────────────────────────────────────

    /**
     * @notice Retira las comisiones acumuladas. Solo el owner.
     * @param to Dirección receptora de las comisiones.
     */
    function withdrawFees(address to) external onlyOwner nonReentrant {
        uint256 amount = accumulatedFees;
        require(amount > 0, "EAINFT: no fees to withdraw");
        accumulatedFees = 0;
        require(goldToken.transfer(to, amount), "EAINFT: GOLD transfer failed");
        emit FeesWithdrawn(to, amount);
    }

    /**
     * @notice Actualiza la comisión del mercado. Solo el owner.
     * @param newFee Nuevo porcentaje en puntos básicos (mín. 250 = 2.5%, máx. 1000 = 10%).
     */
    function setMarketFee(uint256 newFee) external onlyOwner {
        require(newFee >= 250, "EAINFT: fee cannot be less than 2.5%");
        require(newFee <= 1000, "EAINFT: fee cannot exceed 10%");
        marketFee = newFee;
    }

    // ─── Overrides requeridos por Solidity ────────────────────────────────────────

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
