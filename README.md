# Ecosistema de Activos Interoperables (EAI) — Blockchain

Un ecosistema de activos digitales interoperables basado en la blockchain de Polygon, donde múltiples juegos comparten un mismo contrato ERC-1155 y cada frontend renderiza los activos según su contexto.

---

## Arquitectura General

```
Blockcahin_share_inventory_game/
├── contracts/
│   └── EAIProject.sol          # Contrato ERC-1155 con mercado integrado
├── scripts/
│   └── deploy.js               # Script de despliegue con Hardhat
├── test/
│   └── EAIProject.test.js      # Tests del contrato
├── game-a-space/               # Frontend — Juego Espacial
│   ├── index.html
│   ├── app.js                  # Integración Ethers.js
│   └── styles.css
├── game-b-fantasy/             # Frontend — Juego de Fantasía
│   ├── index.html
│   ├── app.js                  # Integración Ethers.js
│   └── styles.css
├── metadata/
│   └── metadata.json           # Esquema de metadatos IPFS
├── hardhat.config.js
├── package.json
└── README.md
```

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Smart Contract | Solidity 0.8.x + OpenZeppelin ERC-1155 |
| Entorno de desarrollo | Hardhat |
| Red de despliegue | Polygon Amoy Testnet |
| Almacenamiento de metadatos | IPFS (via Pinata / nft.storage) |
| Integración frontend | Ethers.js v6 |

---

## Contrato Inteligente — `EAIProject.sol`

El contrato implementa el estándar **ERC-1155** de OpenZeppelin e incorpora:

- **Mint de activos** con URI apuntando a IPFS.
- **Mercado integrado**: las funciones `listForSale` y `buyItem` permiten listar y comprar ítems directamente en el contrato.
- **Roles de acceso**: `MINTER_ROLE` para controlar quién puede acuñar nuevos tokens.

### Funciones principales

```solidity
// Acuña nuevos tokens
function mint(address to, uint256 id, uint256 amount, string memory tokenURI) external;

// Lista un ítem a la venta
function listForSale(uint256 tokenId, uint256 amount, uint256 price) external;

// Compra un ítem listado
function buyItem(address seller, uint256 tokenId, uint256 amount) external payable;
```

---

## Frontends Interoperables

Ambos frontends leen el **mismo TokenID** desde el contrato pero renderizan el activo de forma diferente:

- **`/game-a-space`** — Temática espacial: el ítem se muestra como una nave o equipamiento futurista.
- **`/game-b-fantasy`** — Temática de fantasía: el mismo ítem se transforma en espada, armadura o artefacto mágico.

La clave de la interoperabilidad está en los metadatos IPFS, que incluyen atributos inmutables (ej. `power`, `rarity`) que cada juego interpreta visualmente de forma independiente.

---

## Esquema de Metadatos (IPFS)

```json
{
  "name": "Espada Cósmica / Cosmic Blade",
  "description": "Activo interoperable compartido entre Game A y Game B.",
  "image": "ipfs://<CID>/image.png",
  "attributes": [
    { "trait_type": "power",       "value": 85,       "immutable": true },
    { "trait_type": "rarity",      "value": "Epic",   "immutable": true },
    { "trait_type": "durability",  "value": 100,      "immutable": true },
    { "trait_type": "element",     "value": "Void",   "immutable": true },
    { "trait_type": "game_a_skin", "value": "Plasma Rifle" },
    { "trait_type": "game_b_skin", "value": "Enchanted Sword" }
  ]
}
```

---

## Configuración y Despliegue

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=tu_clave_privada_aqui
POLYGONSCAN_API_KEY=tu_api_key_aqui
```

### 3. Compilar contratos

```bash
npx hardhat compile
```

### 4. Ejecutar tests

```bash
npx hardhat test
```

### 5. Desplegar en Polygon Amoy Testnet

```bash
npx hardhat run scripts/deploy.js --network polygonAmoy
```

### 6. Lanzar frontend (Game A)

```bash
cd game-a-space
npx serve .
```

### 7. Lanzar frontend (Game B)

```bash
cd game-b-fantasy
npx serve .
```

---

## Flujo de Interoperabilidad

```
Usuario mintea un activo en EAIProject.sol (Polygon)
          │
          ▼
   Metadatos almacenados en IPFS
          │
     ┌────┴────┐
     ▼         ▼
Game A Space  Game B Fantasy
(nave/arma)   (espada/armadura)
  Ethers.js     Ethers.js
  lee tokenId   lee tokenId
  → render A    → render B
```

---

## Licencia

MIT