// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EAIProject — Ecosistema de Activos Interoperables
 * @notice Contrato ERC-1155 con mercado integrado y soporte para metadatos IPFS.
 *         Múltiples juegos pueden compartir el mismo TokenID y renderizar el activo
 *         de forma diferente según su contexto.
 */
contract EAIProject is ERC1155, ERC1155Supply, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Nombre del ecosistema
    string public name = "EAI Project";

    /// @notice Símbolo del ecosistema
    string public symbol = "EAI";

    /// @dev URI individual por tokenId (apunta a IPFS)
    mapping(uint256 => string) private _tokenURIs;

    /// @dev Listados activos en el mercado: seller => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    /// @dev Porcentaje de comisión del mercado en puntos básicos (250 = 2.5%)
    uint256 public marketFee = 250;

    /// @dev Acumulado de comisiones disponibles para retirar
    uint256 public accumulatedFees;

    struct Listing {
        uint256 amount;
        uint256 pricePerUnit; // en wei
        bool active;
    }

    struct ListingKey {
        address seller;
        uint256 tokenId;
    }

    struct GlobalListing {
        address seller;
        uint256 tokenId;
        uint256 amount;
        uint256 pricePerUnit;
    }

    ListingKey[] public allListingKeys;
    mapping(address => mapping(uint256 => bool)) public hasEverListed;

    // ─── Eventos ────────────────────────────────────────────────────────────────

    event TokenMinted(address indexed to, uint256 indexed tokenId, uint256 amount, string uri);
    event ItemListed(address indexed seller, uint256 indexed tokenId, uint256 amount, uint256 pricePerUnit);
    event ItemSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 amount, uint256 totalPrice);
    event ListingCancelled(address indexed seller, uint256 indexed tokenId);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // ─── Constructor ─────────────────────────────────────────────────────────────

    constructor(address admin) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    // ─── Mint ────────────────────────────────────────────────────────────────────

    /**
     * @notice Acuña nuevos tokens de un determinado ID.
     * @param to       Dirección receptora.
     * @param id       Identificador del token.
     * @param amount   Cantidad a acuñar.
     * @param tokenURI URI IPFS de los metadatos (ej. ipfs://<CID>/metadata.json).
     * @param data     Datos adicionales (puede ser bytes vacíos).
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        string memory tokenURI,
        bytes memory data
    ) external onlyRole(MINTER_ROLE) {
        _tokenURIs[id] = tokenURI;
        _mint(to, id, amount, data);
        emit TokenMinted(to, id, amount, tokenURI);
    }

    /**
     * @notice Acuña múltiples tipos de tokens en una sola transacción.
     * @param to       Dirección receptora.
     * @param ids      Array de identificadores de token.
     * @param amounts  Array de cantidades correspondientes.
     * @param uris     Array de URIs IPFS correspondientes.
     * @param data     Datos adicionales.
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        string[] memory uris,
        bytes memory data
    ) external onlyRole(MINTER_ROLE) {
        require(ids.length == uris.length, "EAIProject: ids and uris length mismatch");
        for (uint256 i = 0; i < ids.length; i++) {
            _tokenURIs[ids[i]] = uris[i];
        }
        _mintBatch(to, ids, amounts, data);
    }

    // ─── URI ─────────────────────────────────────────────────────────────────────

    /**
     * @notice Devuelve la URI de metadatos para un tokenId específico.
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenUri = _tokenURIs[tokenId];
        return bytes(tokenUri).length > 0 ? tokenUri : super.uri(tokenId);
    }

    // ─── Mercado ─────────────────────────────────────────────────────────────────

    /**
     * @notice Lista una cantidad de tokens a la venta.
     * @param tokenId      ID del token a listar.
     * @param amount       Cantidad de unidades a listar.
     * @param pricePerUnit Precio por unidad en wei.
     */
    function listForSale(
        uint256 tokenId,
        uint256 amount,
        uint256 pricePerUnit
    ) external {
        require(amount > 0, "EAIProject: amount must be greater than zero");
        require(pricePerUnit > 0, "EAIProject: price must be greater than zero");
        require(balanceOf(msg.sender, tokenId) >= amount, "EAIProject: insufficient token balance");
        require(
            isApprovedForAll(msg.sender, address(this)),
            "EAIProject: contract not approved to manage tokens"
        );

        listings[msg.sender][tokenId] = Listing({
            amount: amount,
            pricePerUnit: pricePerUnit,
            active: true
        });

        if (!hasEverListed[msg.sender][tokenId]) {
            hasEverListed[msg.sender][tokenId] = true;
            allListingKeys.push(ListingKey({
                seller: msg.sender,
                tokenId: tokenId
            }));
        }

        emit ItemListed(msg.sender, tokenId, amount, pricePerUnit);
    }

    /**
     * @notice Devuelve todas las ofertas activas en el mercado global.
     */
    function getAllActiveListings() external view returns (GlobalListing[] memory) {
        uint256 activeCount = 0;
        uint256 total = allListingKeys.length;

        for (uint256 i = 0; i < total; i++) {
            ListingKey memory key = allListingKeys[i];
            Listing storage l = listings[key.seller][key.tokenId];
            if (l.active && l.amount > 0) {
                activeCount++;
            }
        }

        GlobalListing[] memory result = new GlobalListing[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < total; i++) {
            ListingKey memory key = allListingKeys[i];
            Listing storage l = listings[key.seller][key.tokenId];
            if (l.active && l.amount > 0) {
                result[currentIndex] = GlobalListing({
                    seller: key.seller,
                    tokenId: key.tokenId,
                    amount: l.amount,
                    pricePerUnit: l.pricePerUnit
                });
                currentIndex++;
            }
        }

        return result;
    }

    /**
     * @notice Cancela un listado activo del sender.
     * @param tokenId ID del token cuyo listado se cancela.
     */
    function cancelListing(uint256 tokenId) external {
        require(listings[msg.sender][tokenId].active, "EAIProject: no active listing");
        listings[msg.sender][tokenId].active = false;
        emit ListingCancelled(msg.sender, tokenId);
    }

    /**
     * @notice Compra tokens listados por un vendedor.
     * @param seller  Dirección del vendedor.
     * @param tokenId ID del token a comprar.
     * @param amount  Cantidad de unidades a comprar.
     */
    function buyItem(
        address seller,
        uint256 tokenId,
        uint256 amount
    ) external payable nonReentrant {
        Listing storage listing = listings[seller][tokenId];

        require(listing.active, "EAIProject: listing not active");
        require(amount > 0, "EAIProject: amount must be greater than zero");
        require(listing.amount >= amount, "EAIProject: insufficient listed amount");

        uint256 totalPrice = listing.pricePerUnit * amount;
        require(msg.value == totalPrice, "EAIProject: incorrect ether amount");

        // Actualiza el listado antes de transferir (checks-effects-interactions)
        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.active = false;
        }

        // Calcula y acumula la comisión del mercado
        uint256 fee = (totalPrice * marketFee) / 10000;
        uint256 sellerProceeds = totalPrice - fee;
        accumulatedFees += fee;

        // Transfiere los tokens al comprador usando la función interna
        // para evitar la doble verificación de operador (el contrato ya
        // gestiona el acceso mediante el sistema de listings).
        _safeTransferFrom(seller, msg.sender, tokenId, amount, "");

        // Transfiere los fondos al vendedor
        (bool sent, ) = payable(seller).call{value: sellerProceeds}("");
        require(sent, "EAIProject: ether transfer to seller failed");

        emit ItemSold(seller, msg.sender, tokenId, amount, totalPrice);
    }

    /**
     * @notice Retira las comisiones acumuladas. Solo el admin puede hacerlo.
     * @param to Dirección receptora de las comisiones.
     */
    function withdrawFees(address to) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        uint256 amount = accumulatedFees;
        require(amount > 0, "EAIProject: no fees to withdraw");
        accumulatedFees = 0;
        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "EAIProject: ether transfer failed");
        emit FeesWithdrawn(to, amount);
    }

    /**
     * @notice Actualiza la comisión del mercado. Solo el admin puede hacerlo.
     * @param newFee Nuevo porcentaje en puntos básicos (máx. 1000 = 10%).
     */
    function setMarketFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFee <= 1000, "EAIProject: fee cannot exceed 10%");
        marketFee = newFee;
    }

    // ─── Overrides requeridos por Solidity ───────────────────────────────────────

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
