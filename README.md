# Ecosistema de Activos Interoperables (EAI) — Blockchain

Un ecosistema de activos digitales interoperables basado en la blockchain de Polygon, donde múltiples juegos comparten un mismo contrato ERC-1155 y cada frontend renderiza los activos según su contexto.

---

## Arquitectura General

```
Blockcahin_share_inventory_game/
├── contracts/
│   └── EAIProject.sol          # Contrato ERC-1155 con mercado integrado
├── scripts/
│   ├── deploy.js               # Script de despliegue en Polygon Amoy
│   └── deploy-local.js         # Script de despliegue + seed local (sin gas)
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

### 2. Compilar contratos

```bash
npx hardhat compile
```

### 3. Ejecutar tests

```bash
npx hardhat test
```

---

## ▶️ Ejecución Local (Recomendada — sin gas real)

Hardhat incluye una blockchain local que genera automáticamente **20 cuentas con 10.000 ETH** cada una. No necesitas fondos reales ni faucets.

#### PASO 1 — Arranca el nodo (Terminal A, déjala abierta)

```bash
npx hardhat node
```

#### PASO 2 — Despliega y siembra datos de prueba (Terminal B)

```bash
npx hardhat run scripts/deploy-local.js --network localhost
```

El script realizará automáticamente:
- ✅ Deploy del contrato
- ✅ Mint de 10 tokens (Token ID `1`) a la cuenta Seller
- ✅ Aprobación del marketplace
- ✅ Listado de 5 unidades a 0.01 ETH

La salida mostrará la **Contract Address** y la **Seller Address**. Cópialas.

#### PASO 3 — Actualiza los frontends

En `game-a-space/app.js` **y** `game-b-fantasy/app.js`, pega tu `Contract Address`:

```js
const CONFIG = {
  contractAddress: "0xTU_CONTRACT_ADDRESS_AQUI",  // ← pegar aquí
  chainId: 31337,
  ...
};
```

#### PASO 4 — Configura MetaMask para Hardhat Local

**4.1 — Añadir la red Hardhat Local**

En MetaMask: `··· → Configuración → Redes → Añadir red → Añadir red manualmente`

| Campo | Valor |
|---|---|
| Nombre de la red | `Hardhat Local` |
| URL RPC nueva | `http://127.0.0.1:8545` |
| ID de cadena | `31337` |
| Símbolo de moneda | `ETH` |
| URL explorador | *(dejar vacío)* |

**4.2 — Importar la cuenta Seller** (la que tiene los tokens y el listado activo)

En MetaMask: `Icono cuenta → Añadir cuenta → Importar cuenta → Clave privada`

```
Clave privada: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Dirección:     0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

> Estas claves son públicas y conocidas — solo funcionan en la red local de Hardhat.

**4.3 — (Opcional) Importar cuenta Buyer** para probar la compra desde otra cuenta

```
Clave privada: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Dirección:     0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

> ⚠️ **Si reinicias el nodo y las transacciones fallan:** ve a MetaMask → Configuración → Avanzado → **Limpiar datos de actividad** para resetear el nonce.

#### PASO 5 — Lanza los frontends en dos pestañas

```bash
# Pestaña 1 — Juego Espacial
cd game-a-space && npx serve .

# Pestaña 2 — Juego de Fantasía
cd game-b-fantasy && npx serve .
```

Conecta MetaMask → introduce Token ID `1` → observa la interoperabilidad en tiempo real.

> ⚠️ **Nota:** Cada vez que reinicias `npx hardhat node`, se genera una blockchain nueva. Repite los pasos 2 y 3 para obtener la nueva dirección del contrato.

---

## 🌐 Despliegue en Polygon Amoy Testnet (Opcional)

Requiere saldo de prueba (POL). Consíguelo en [alchemy.com/faucets/polygon-amoy](https://www.alchemy.com/faucets/polygon-amoy).

### Configurar `.env`

```env
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=tu_clave_privada_aqui
POLYGONSCAN_API_KEY=tu_api_key_aqui
```

### Desplegar

```bash
npx hardhat run scripts/deploy.js --network polygonAmoy
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