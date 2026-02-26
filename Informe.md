# Informe Técnico: Ecosistema de Activos Interoperables (EAI)

> **Asignatura:** Computación distribuida para la gestión de datos a gran escala
> **Módulo:** 1 — Blockchain
> **Proyecto:** Blockchain Share Inventory Game

---

## Índice

1. [Introducción y Propósito](#1-introducción-y-propósito)
2. [El Concepto Central: Interoperabilidad de Activos](#2-el-concepto-central-interoperabilidad-de-activos)
3. [Visión General de la Arquitectura](#3-visión-general-de-la-arquitectura)
4. [Capas del Sistema](#4-capas-del-sistema)
5. [Los Smart Contracts: El Motor del Sistema](#5-los-smart-contracts-el-motor-del-sistema)
6. [Los Activos Digitales: Metadatos e Interoperabilidad](#6-los-activos-digitales-metadatos-e-interoperabilidad)
7. [Los Juegos: Dos Ventanas al Mismo Mundo](#7-los-juegos-dos-ventanas-al-mismo-mundo)
8. [El Marketplace Descentralizado](#8-el-marketplace-descentralizado)
9. [Flujo Completo de Uso: Del Despliegue al Gameplay](#9-flujo-completo-de-uso-del-despliegue-al-gameplay)
10. [Scripts de Despliegue](#10-scripts-de-despliegue)
11. [Pruebas del Sistema](#11-pruebas-del-sistema)
12. [Seguridad](#12-seguridad)
13. [Estado Actual y Consideraciones Futuras](#13-estado-actual-y-consideraciones-futuras)
14. [Conclusiones](#14-conclusiones)

---

## 1. Introducción y Propósito

El **Ecosistema de Activos Interoperables (EAI)** es un proyecto blockchain que resuelve uno de los problemas más habituales en los videojuegos: la falta de portabilidad de los activos entre diferentes juegos o plataformas. Habitualmente, cuando un jugador compra un objeto en un videojuego, ese objeto solo existe en ese juego concreto. Si el juego cierra o el jugador quiere usarlo en otro juego, el objeto simplemente desaparece o no puede transferirse.

EAI propone una solución basada en blockchain: los activos (armas, armaduras, objetos) existen de forma independiente en la cadena de bloques y pueden ser utilizados por cualquier juego que implemente el protocolo. Cada juego puede mostrar el mismo activo con una apariencia visual completamente diferente, adaptada a su temática, pero debajo de la superficie el activo es el mismo objeto con las mismas estadísticas.

El proyecto se materializa en dos juegos de demostración:
- **Space Arsenal** — Un juego de temática espacial y futurista.
- **Fantasy Realm** — Un juego de temática medieval y de fantasía.

Ambos juegos comparten exactamente el mismo inventario en blockchain. Un jugador que tiene una espada en Fantasy Realm tiene automáticamente ese mismo activo como un rifle en Space Arsenal, porque son el mismo token blockchain representado visualmente de dos formas distintas.

---

## 2. El Concepto Central: Interoperabilidad de Activos

### El Problema que Resuelve

En los videojuegos tradicionales, los objetos son registros en una base de datos centralizada propiedad del desarrollador. El jugador no posee realmente nada: si el servidor cierra, los objetos desaparecen. Además, los objetos no pueden salir de ese ecosistema cerrado.

### La Solución Blockchain

Con blockchain, los activos son tokens que pertenecen a la dirección (cartera) del jugador. Nadie puede quitárselos ni hacerlos desaparecer mientras exista la red blockchain. El jugador es el verdadero propietario.

### La Clave de la Interoperabilidad: Los Metadatos Duales

Cada activo del proyecto tiene dos identidades simultáneas definidas en sus metadatos:

```
Token #1 en la blockchain:
  ├── Identidad Space:   "Plasma Rifle" 🔫
  └── Identidad Fantasy: "Enchanted Bow" 🏹

Atributos compartidos (iguales en ambos juegos):
  ├── Poder: 75
  ├── Rareza: Rare
  ├── Durabilidad: 80
  └── Elemento: Plasma
```

Las estadísticas de juego son inmutables e iguales en todos los juegos. Solo cambia la representación visual y el nombre. Esto garantiza que un activo poderoso en un juego sea igualmente poderoso en otro.

---

## 3. Visión General de la Arquitectura

El sistema se compone de seis grandes bloques que trabajan juntos:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                               │
│              Abre un juego en su navegador                          │
└─────────────────────┬───────────────────────┬───────────────────────┘
                      │                       │
         ┌────────────▼──────────┐  ┌─────────▼──────────┐
         │   GAME A: Space       │  │  GAME B: Fantasy    │
         │   Arsenal             │  │  Realm              │
         │   (Navegador web)     │  │  (Navegador web)    │
         └────────────┬──────────┘  └─────────┬──────────┘
                      │                       │
                      └───────────┬───────────┘
                                  │ Ambos juegos hablan con
                                  │ los TRES contratos en blockchain
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
┌────────▼────────┐    ┌──────────▼──────────┐  ┌─────────▼──────────┐
│  EAIGold.sol    │◄───┤  EAIProject.sol     │  │  EAINFT.sol        │
│  (ERC-20)       │    │  (ERC-1155)         │  │  (ERC-721)         │
│  (Blockchain)   │◄───┤  (Blockchain)       │  │  (Blockchain)      │
│                 │    │                     │  │                    │
│  • Moneda GOLD  │    │  • Inventarios      │  │  • Reliquias únicas│
│  • Mint con ETH │    │  • Marketplace GOLD │  │  • NFTs irrepetib. │
│  • 1 GOLD=      │    │  • Comisiones GOLD  │  │  • Marketplace NFT │
│    0.00058 ETH  │    │                     │  │  • Comisiones GOLD │
└─────────────────┘    └──────────┬──────────┘  └─────────┬──────────┘
                                  │                        │
                       Al mostrar un activo o reliquia,
                       el juego consulta metadatos
                                  └──────────┬─────────────┘
                                  ┌──────────▼──────────────┐
                                  │   SERVIDOR IPFS          │
                                  │   (Metadatos)            │
                                  │                          │
                                  │  1.json  → Token #1      │
                                  │  2.json  → Token #2      │
                                  │  ...                     │
                                  │  nft-100.json → NFT #100 │
                                  │  nft-101.json → NFT #101 │
                                  │  nft-102.json → NFT #102 │
                                  └──────────────────────────┘
```

### Tecnologías Utilizadas

| Componente | Tecnología | Para qué sirve |
|---|---|---|
| Contrato de activos | Solidity 0.8.24 — ERC-1155 (OpenZeppelin) | Inventarios, marketplace de ítems, comisiones |
| Contrato de moneda | Solidity 0.8.24 — ERC-20 (OpenZeppelin) | Token GOLD: moneda del ecosistema |
| Contrato de NFTs | Solidity 0.8.24 — ERC-721 (OpenZeppelin) | Reliquias únicas, marketplace de NFTs |
| Red blockchain (desarrollo) | Hardhat local | Simular blockchain sin coste |
| Red blockchain (producción) | Polygon Amoy Testnet | Red de pruebas pública |
| Interacción blockchain | Ethers.js v6 | Comunicar el navegador con la blockchain |
| Metadatos | JSON + IPFS | Almacenar descripción de activos y reliquias |
| Herramienta de desarrollo | Hardhat | Compilar, desplegar y testear contratos |

---

## 4. Capas del Sistema

El sistema se organiza en cuatro capas claramente diferenciadas:

### Capa 1 — Datos (Blockchain)
Es la capa más fundamental. Aquí se registra quién posee qué y en qué cantidad. Esta información es inmutable, transparente y no puede ser manipulada por ninguna autoridad central. Cada vez que alguien compra, vende o recibe un activo, esta capa se actualiza.

### Capa 2 — Lógica de Negocio (Smart Contracts)
El proyecto tiene **tres contratos inteligentes** que trabajan juntos. El contrato **EAIGold** gestiona la moneda del ecosistema: los jugadores convierten ETH en tokens GOLD, que es la divisa con la que se realizan todas las compras y ventas. El contrato **EAIProject** gestiona los activos semi-fungibles del juego: quién posee qué cantidad, cómo se compran y venden usando tokens GOLD, y qué comisión se cobra. El contrato **EAINFT** gestiona las reliquias únicas del ecosistema: objetos NFT irrepetibles donde solo puede haber un propietario en cada momento, también con su propio marketplace en GOLD. Los tres contratos actúan como intermediarios neutrales y automáticos que ejecutan las reglas sin necesidad de confiar en ninguna empresa o persona.

### Capa 3 — Descripción de Activos (Metadatos)
Los metadatos son archivos JSON almacenados en IPFS que describen cada activo: su nombre en cada juego, sus estadísticas, sus iconos. La blockchain no almacena esta información directamente (sería muy costoso); en cambio, almacena una referencia (URL) a donde están los metadatos.

### Capa 4 — Experiencia de Usuario (Frontends)
Son las interfaces web que el jugador ve y usa. Cada juego es un frontend diferente que se conecta a la misma blockchain. El frontend se encarga de mostrar los activos con la temática propia del juego, gestionar la interacción del usuario y comunicarse con el contrato para ejecutar acciones.

---

## 5. Los Smart Contracts: El Motor del Sistema

### Qué es un Smart Contract

Un smart contract es un programa que vive en la blockchain. Una vez desplegado, nadie puede modificarlo ni detenerlo. Ejecuta sus funciones exactamente como están programadas, sin excepciones ni favoritismos. Esto es lo que le da confianza al sistema: las reglas son transparentes y automáticas.

El proyecto EAI tiene **tres smart contracts** que trabajan conjuntamente y se complementan: EAIGold (la moneda del ecosistema), EAIProject (el gestor de activos del inventario y su marketplace), y EAINFT (el gestor de reliquias únicas y su marketplace).

---

### Contrato 1: EAIGold — La Moneda del Ecosistema

EAIGold es un token ERC-20, es decir, una moneda digital fungible propia del ecosistema EAI. Su nombre completo es "EAI Gold" y su símbolo es **GOLD**. Con esta moneda se realizan todas las transacciones del marketplace: comprar activos, pagar comisiones y retirar beneficios.

**¿Por qué una moneda propia en lugar de usar ETH directamente?**
Usar ETH directamente en el marketplace vincula el precio de los activos de juego a la volatilidad del mercado de criptomonedas. Si ETH dobla su precio en un día, todos los activos del juego se vuelven el doble de caros en términos reales. Crear una moneda intermedia (GOLD) permite que la economía del juego sea más estable e independiente de las fluctuaciones externas. Es el mismo principio que los juegos móviles usan con sus monedas de oro o gemas.

**Cómo se obtiene GOLD:**
Los jugadores envían ETH al contrato EAIGold y reciben GOLD instantáneamente a un tipo de cambio fijo de **1 GOLD = 0,00058 ETH**. Esta operación se llama `mintGold` y es el único mecanismo para crear tokens GOLD: el contrato los genera en el momento de la compra y los deposita directamente en la cartera del comprador. No existe ningún almacén previo de GOLD; los tokens se crean bajo demanda cuando alguien los paga con ETH.

**Cómo funciona en los frontends:**
Ambos juegos incluyen un botón "Buy GOLD" que abre una ventana emergente. El jugador introduce cuánto ETH quiere convertir, el juego le muestra en tiempo real cuántos GOLD recibirá, y al confirmar la transacción el contrato EAIGold ejecuta la conversión al instante. El saldo GOLD del jugador aparece como balance principal en la interfaz, con el saldo ETH restante visible como información secundaria.

**El ETH acumulado:**
Cada vez que alguien compra GOLD, el ETH enviado queda almacenado en el propio contrato EAIGold. El propietario del contrato (el administrador del sistema) puede retirarlo en cualquier momento mediante la función `withdrawETH`. Esto representa los ingresos reales del operador del ecosistema por la venta de moneda del juego.

---

### Contrato 2: EAIProject — Los Activos y el Marketplace

El contrato EAIProject gestiona todo lo relacionado con los activos del juego. Tiene tres responsabilidades simultáneas:

**1. Actúa como registro de propiedad**
Sabe exactamente cuántas unidades de cada activo tiene cada dirección (cartera) en todo momento. Si el jugador A tiene 5 unidades del Token #1, el contrato lo registra y nadie puede alterar ese dato fraudulentamente.

**2. Actúa como marketplace descentralizado con economía GOLD**
Los jugadores pueden poner sus activos a la venta indicando un precio en tokens GOLD. Cuando alguien compra, el contrato orquesta dos transferencias simultáneas: los tokens GOLD van del comprador al vendedor (menos comisión), y los activos ERC-1155 van del vendedor al comprador. Todo ocurre en un único paso atómico; o todo se ejecuta correctamente o nada ocurre.

**3. Actúa como caja recaudadora en GOLD**
Por cada venta, el contrato retiene automáticamente una comisión del 2,5% en tokens GOLD. Esta comisión se acumula en el contrato y solo puede ser retirada por el administrador en forma de GOLD, no de ETH.

**La relación entre los dos contratos:**
EAIProject conoce la dirección de EAIGold desde su despliegue. Cuando un comprador ejecuta una compra, EAIProject llama al contrato EAIGold para mover los tokens GOLD del comprador al vendedor y al contrato. Esto es posible porque el comprador previamente ha dado permiso (allowance) al contrato EAIProject para gestionar sus tokens GOLD en su nombre, de forma similar a como se autoriza a un banco a realizar cargos automáticos.

### Quiénes Pueden Hacer Qué (Sistema de Roles en EAIProject)

- **Administrador (DEFAULT_ADMIN_ROLE):** Puede retirar las comisiones acumuladas en GOLD, cambiar el porcentaje de comisión del marketplace (con un máximo del 10%), y gestionar otros roles.

- **Acuñador (MINTER_ROLE):** Puede crear nuevos tokens de activos y asignarlos a jugadores. Este rol lo tiene el propio administrador, lo que permite que el script de despliegue cree los inventarios iniciales.

- **Cualquier jugador:** Puede listar sus activos a la venta en GOLD, cancelar sus listados, comprar activos de otros jugadores con GOLD, y gestionar los permisos necesarios sobre sus tokens.

### Las Acciones Principales de EAIProject

**Creación de activos (Mint)**
Cuando se crean nuevos activos, el contrato registra su existencia y los asigna a una dirección. En este momento también se vincula el activo con sus metadatos mediante una URL que apunta al servidor IPFS.

**Poner a la venta (List for Sale)**
Un jugador puede indicar que quiere vender cierta cantidad de un activo a un precio determinado en GOLD. Para poder listar, debe haber dado previamente permiso al contrato para manejar sus tokens ERC-1155. El listado queda registrado en la blockchain y es visible para todos.

**Comprar (Buy Item)**
Cuando un jugador compra, el contrato verifica que el listado está activo, que el comprador tiene suficiente GOLD y que ha aprobado al contrato para gastarlo. Si todo es correcto, transfiere los activos al comprador, envía el GOLD al vendedor (menos comisión) y acumula la comisión.

**Cancelar listado (Cancel Listing)**
El vendedor puede cancelar su oferta en cualquier momento antes de que alguien la compre.

**Ver todos los listados (Get All Active Listings)**
Devuelve una lista de todas las ofertas activas en el marketplace con sus precios en GOLD. Los frontends usan esta función para mostrar el mercado global.

### Los Estándares de Token Utilizados

El proyecto usa **tres estándares de tokens de OpenZeppelin**, cada uno elegido para el tipo de activo que mejor representa:

- **ERC-20** (en EAIGold): El estándar para monedas digitales fungibles. Todos los tokens GOLD son idénticos e intercambiables. Es la divisa del ecosistema con la que se paga absolutamente todo.

- **ERC-1155** (en EAIProject): El estándar diseñado específicamente para videojuegos. Permite gestionar múltiples tipos de activos (los 6 tokens del juego) en un único contrato, con soporte para tener varias unidades de cada tipo. Ideal para ítems de inventario que existen en múltiples copias.

- **ERC-721** (en EAINFT): El estándar de los NFTs auténticos. Cada token tiene un ID único y solo puede existir exactamente una unidad de él. Ideal para las reliquias del ecosistema: artefactos irrepetibles que solo puede poseer un jugador en cada momento.

---

### Contrato 3: EAINFT — Las Reliquias Únicas del Ecosistema

EAINFT es el tercer contrato inteligente del proyecto y el más reciente en incorporarse. Implementa el estándar ERC-721 (NFTs) para crear reliquias absolutamente únicas en el ecosistema: objetos cuya propiedad exclusiva es garantizada matemáticamente por la blockchain.

**La naturaleza de las reliquias:**
A diferencia de los activos del inventario ERC-1155, de los que pueden existir decenas de unidades repartidas entre los jugadores, una reliquia es única en toda la blockchain. Si existe el token #100, solo hay un token #100, y pertenece a exactamente una dirección. No hay copias, no hay cantidades: solo el objeto y su propietario.

**Cómo se crean:**
Solo el administrador puede crear nuevas reliquias mediante la función `mintRelic`. Cada llamada genera exactamente un nuevo token con un ID auto-incremental (comenzando en 100 para no colisionar con los IDs 1-6 del contrato ERC-1155). Al desplegar el sistema, se crean tres reliquias: una para cada jugador.

Las tres reliquias iniciales son:
- **NFT #100:** "Stellar Core Fragment" (Game A) / "Crown of the Ancients" (Game B) — para el primer jugador
- **NFT #101:** "Void Engine Shard" (Game A) / "Scepter of Eternal Flame" (Game B) — para el segundo jugador
- **NFT #102:** "Nebula Heart Crystal" (Game A) / "Orb of the Dragon King" (Game B) — para el tercer jugador

**El marketplace de reliquias:**
EAINFT tiene su propio marketplace integrado, funcionalmente similar al de EAIProject pero adaptado a la naturaleza única de los NFTs. Un propietario puede listar su reliquia a un precio en GOLD; cuando alguien la compra, el contrato transfiere el GOLD del comprador al vendedor (menos el 2,5% de comisión) y transfiere simultáneamente la propiedad del NFT al comprador. Todo en un único paso atómico: o todo ocurre correctamente o nada ocurre.

**La doble identidad visual:**
Al igual que los activos ERC-1155, cada reliquia tiene dos nombres: uno para el universo espacial de Game A y otro para el mundo de fantasía de Game B. Ambos juegos muestran las reliquias con un badge "NFT" especial y un efecto de brillo dorado para distinguirlas visualmente de los ítems comunes del inventario.

**La comisión también en GOLD:**
Las comisiones del marketplace de reliquias también se acumulan en tokens GOLD dentro del contrato EAINFT. Solo el administrador puede retirarlas. Esta coherencia económica (todo en GOLD) hace que la gestión del ecosistema sea sencilla: un único tipo de moneda para todas las transacciones.

**Qué ocurre en los frontends:**
Cuando un jugador abre el juego, el frontend realiza dos consultas paralelas: una al contrato EAIProject para cargar los ítems del inventario ERC-1155, y otra al contrato EAINFT para cargar las reliquias ERC-721 que pertenecen a ese jugador. Ambos tipos de activos aparecen en el mismo panel de inventario, diferenciados visualmente. El marketplace también muestra ambos tipos de activos: los ítems semi-fungibles (con cantidad) y las reliquias únicas (sin cantidad, siempre exactamente una).

---

## 6. Los Activos Digitales: Metadatos e Interoperabilidad

### Qué son los Metadatos

Cada activo en la blockchain es simplemente un número (ID de token) y una cantidad. La blockchain no almacena imágenes ni descripciones, ya que hacerlo sería extremadamente caro. En cambio, cada token apunta a un archivo JSON externo que contiene toda la información descriptiva: el nombre, la descripción, las estadísticas y los iconos.

### Los 6 Activos del Proyecto

El proyecto incluye 6 activos interoperables, cada uno con una doble identidad:

| Token | Identidad Space | Identidad Fantasy | Poder | Rareza | Tipo |
|-------|----------------|-------------------|-------|--------|------|
| #1 | Plasma Rifle 🔫 | Enchanted Bow 🏹 | 75 | Rare | Arma |
| #2 | Quantum Shield 🛡️ | Dragon Scale Armor 🐉 | 60 | Epic | Armadura |
| #3 | Nebula Core 🔮 | Phoenix Feather 🪶 | 40 | Common | Consumible |
| #4 | Void Blade ⚔️ | Shadow Dagger 🗡️ | 92 | Legendary | Arma |
| #5 | Gravity Boots 👢 | Elven Greaves 🥾 | 55 | Rare | Armadura |
| #6 | Stellar Helm ⛑️ | Crown of Thorns 👑 | 88 | Legendary | Casco |

### Estructura de un Metadato

Cada archivo JSON de metadatos tiene dos categorías de atributos:

**Atributos Inmutables** (nunca cambian, son la esencia del activo):
- **Poder (Power):** Qué tan fuerte es el activo en combate (escala 0-100)
- **Rareza (Rarity):** Common, Rare, Epic o Legendary
- **Durabilidad (Durability):** Qué tan resistente es (escala 0-100)
- **Elemento (Element):** El tipo de energía o magia del activo (Plasma, Void, Fire, etc.)
- **Tipo de Activo (Asset Type):** Weapon, Armor, Consumable, Helmet

**Atributos por Juego** (la representación visual en cada contexto):
- **Nombre en Game A / Nombre en Game B:** Cómo se llama en cada juego
- **Icono en Game A / Icono en Game B:** El emoji que lo representa en cada juego

### El Servidor de Metadatos

En el entorno local de desarrollo, los metadatos se sirven desde un pequeño servidor HTTP que se lanza automáticamente al desplegar el contrato. Este servidor escucha en el puerto 3333 y responde con el archivo JSON correspondiente cuando un frontend pide los datos del Token #1 (consulta `http://localhost:3333/1.json`), del Token #2 (consulta `http://localhost:3333/2.json`), y así sucesivamente.

En un entorno de producción real, estos archivos estarían almacenados en IPFS, una red descentralizada de almacenamiento de archivos donde los datos son accesibles mientras exista al menos un nodo que los tenga.

### El Schema de Metadatos

El proyecto incluye un esquema JSON formal (`metadata/metadata.json`) que define exactamente qué campos son obligatorios, qué tipos de datos acepta cada campo y cómo deben estructurarse los atributos. Este esquema sirve como contrato de interoperabilidad: cualquier juego futuro que quiera unirse al ecosistema debe respetar este formato para que sus activos sean reconocidos correctamente por los frontends existentes.

---

## 7. Los Juegos: Dos Ventanas al Mismo Mundo

### Filosofía de Diseño

Los dos juegos son la demostración práctica de la interoperabilidad. Están construidos con la misma arquitectura y la misma lógica de código, pero presentan una experiencia visual completamente diferente. La clave es que ninguno de los dos juegos almacena datos propios: todo lo que muestran viene de la blockchain y los metadatos.

### Game A: Space Arsenal

**Temática:** Ciencia ficción espacial. El jugador es un piloto espacial que gestiona su arsenal de armas y equipamiento de alta tecnología.

**Identidad visual:** Fondo negro con estrellas animadas, tipografía futurista (Orbitron), colores cian y azul, efectos de brillo y bordes tecnológicos.

**Los Jugadores:**
- **Pilot Alpha** 👨‍🚀 — Piloto principal
- **Pilot Bravo** 👩‍🚀 — Segunda piloto
- **Pilot Charlie** 🧑‍🚀 — Tercer piloto

**Terminología:**
- El inventario se llama "YOUR INVENTORY" y los objetos son "Items"
- El marketplace se llama "GLOBAL MARKET"
- Los objetos se listan como equipamiento tecnológico

### Game B: Fantasy Realm

**Temática:** Fantasía épica medieval. El jugador es un héroe que colecciona reliquias mágicas y comercia en el Gran Bazar.

**Identidad visual:** Tonos marrones y dorados, tipografía con serifa (Cinzel), ambiente cálido y mágico, efectos de pergamino antiguo.

**Los Jugadores:**
- **Knight Aldric** 🛡️ — Caballero
- **Mage Elara** 🧙 — Maga
- **Ranger Fenn** 🏹 — Explorador

**Terminología:**
- El inventario se llama "YOUR INVENTORY" y los objetos son "Relics"
- El marketplace se llama "THE GRAND BAZAAR"
- Los objetos se listan como reliquias ancestrales

### La Correspondencia de Identidades

Un aspecto fundamental es que los jugadores de Game A y Game B comparten las mismas carteras blockchain. Es decir, **Pilot Alpha y Knight Aldric son la misma persona**: tienen la misma dirección, las mismas claves y, por tanto, el mismo inventario en blockchain. La diferencia es solo cómo se llaman y cómo se presentan en cada juego.

```
Dirección blockchain: 0x70997970...

En Game A:    Pilot Alpha 👨‍🚀 — Ve "Plasma Rifle" con 10 unidades
En Game B:  Knight Aldric 🛡️ — Ve "Enchanted Bow" con 10 unidades

Son exactamente los mismos 10 tokens del Token #1.
```

### Cómo Funciona el Frontend Técnicamente

Aunque el usuario no lo percibe, cuando abre uno de los juegos en el navegador ocurre lo siguiente:

1. **El jugador selecciona su personaje** en la pantalla de login. No es necesario MetaMask ni ninguna extensión de navegador: el juego se conecta directamente al nodo blockchain usando la clave privada almacenada en el código (esto es válido para un entorno de pruebas local).

2. **El juego se conecta a la blockchain** y establece una conexión permanente para escuchar eventos en tiempo real.

3. **Se carga el inventario:** El frontend pregunta al contrato cuántas unidades de cada token tiene el jugador. Por cada token con saldo positivo, descarga los metadatos del servidor IPFS y muestra el activo con la apariencia correspondiente a ese juego.

4. **Se carga el marketplace:** El frontend pide al contrato la lista de todos los activos en venta. Para cada activo listado, obtiene los metadatos y muestra el nombre e icono del juego correspondiente.

5. **Actualizaciones en tiempo real:** El frontend está suscrito a eventos de la blockchain (nueva venta, nueva compra, nuevo listado). Cuando ocurre cualquiera de estos eventos, la UI se actualiza automáticamente sin necesidad de recargar la página.

---

## 8. El Marketplace Descentralizado

### Qué es y Por Qué es Relevante

El marketplace integrado permite que los jugadores compren y vendan activos entre sí sin necesidad de una plataforma centralizada. No hay un servidor de la empresa que procese las transacciones ni una empresa que pueda bloquear cuentas. Las reglas son las del smart contract, y estas son iguales para todos.

### Flujo de una Venta Completa

**Paso 0 — El comprador obtiene GOLD (si no tiene):**
Antes de poder comprar, el jugador necesita tener tokens GOLD. En la interfaz de cualquier juego hay un botón "Buy GOLD". El jugador indica cuánto ETH quiere convertir, ve la cantidad equivalente en GOLD que recibirá (a razón de 1 GOLD = 0,00058 ETH) y confirma. El contrato EAIGold ejecuta la conversión al instante: crea los tokens GOLD y los deposita en la cartera del jugador.

**Paso 1 — El vendedor lista su activo:**
El jugador selecciona un activo de su inventario, indica cuántas unidades quiere vender y a qué precio en GOLD por unidad. Antes de poder listar, debe dar permiso al contrato EAIProject para mover sus tokens ERC-1155. Una vez aprobado, el listado queda registrado en la blockchain y es visible para todos.

**Paso 2 — El comprador ve el activo en el mercado:**
Cualquier jugador conectado, en cualquiera de los dos juegos, verá el activo listado con el precio en GOLD. Importante: aunque el vendedor haya listado desde Game A como "Plasma Rifle", el comprador en Game B lo verá como "Enchanted Bow", porque el frontend aplica su propia renderización sobre el mismo token.

**Paso 3 — El comprador aprueba el gasto de GOLD:**
Antes de ejecutar la compra, el frontend verifica si el contrato EAIProject ya tiene permiso para mover los tokens GOLD del comprador (allowance). Si no lo tiene o si el allowance es insuficiente para el precio total, el frontend solicita primero una transacción de aprobación al contrato EAIGold. Esta es una medida de seguridad estándar del protocolo ERC-20.

**Paso 4 — El comprador ejecuta la compra:**
El comprador hace clic en "Buy". El frontend envía la transacción a EAIProject. El contrato verifica que el listado está activo, que el comprador tiene suficiente GOLD y que el allowance es suficiente.

**Paso 5 — El contrato ejecuta la transacción:**
Si todo está bien, en un solo paso atómico:
- Transfiere los tokens ERC-1155 del vendedor al comprador.
- Calcula la comisión del 2,5% sobre el precio total en GOLD.
- Mueve el 97,5% del GOLD del comprador al vendedor (vía EAIGold.transferFrom).
- Mueve el 2,5% de GOLD del comprador al propio contrato EAIProject como comisión acumulada.
- Actualiza el listado (reduciendo unidades disponibles o desactivándolo si se agotó).

**Paso 6 — Ambos frontends se actualizan:**
Los event listeners detectan el evento de venta y actualizan el inventario y el marketplace en tiempo real, tanto en la pantalla del comprador como en la del vendedor.

### La Comisión del Marketplace

Cada transacción genera una comisión del 2,5% en tokens GOLD que se acumula en el contrato EAIProject. Esta comisión solo puede ser retirada por el administrador del sistema, que la recibe en forma de GOLD. El porcentaje puede ser modificado por el administrador, pero tiene un límite máximo del 10%. Esta mecánica simula el modelo de negocio de plataformas como OpenSea.

---

## 9. Flujo Completo de Uso: Del Despliegue al Gameplay

Esta sección describe paso a paso todo lo que ocurre desde que se lanza el proyecto hasta que dos jugadores realizan una transacción entre sí.

### Fase 1: Puesta en Marcha del Entorno

**Paso 1 — Lanzar la blockchain local:**
Se inicia un nodo de blockchain Hardhat en el ordenador. Este nodo simula una blockchain completa con 20 cuentas de prueba, cada una con 10.000 ETH de prueba. Es completamente local y gratuito.

**Paso 2 — Desplegar y poblar los contratos:**
Se ejecuta el script de despliegue local que hace **nueve pasos** en secuencia:
1. Lanza el servidor de metadatos en el puerto 3333
2. Despliega el contrato **EAIGold** (ERC-20) en la blockchain local
3. Despliega el contrato **EAIProject** (ERC-1155) pasándole la dirección de EAIGold
4. Despliega el contrato **EAINFT** (ERC-721) también pasándole la dirección de EAIGold
5. Crea inventarios aleatorios para tres jugadores: cada uno recibe entre 2 y 4 tipos de tokens ERC-1155 distintos, con cantidades aleatorias entre 1 y 15 unidades
6. Acuña las tres reliquias ERC-721 (NFTs #100, #101, #102), una para cada jugador
7. Aprueba automáticamente los contratos EAIProject (ERC-1155) y EAINFT (ERC-721) para gestionar los activos de cada jugador
8. Ajusta los balances ETH de los jugadores a exactamente 1 ETH cada uno
9. Crea listados de venta aleatorios en GOLD (precios entre 10 y 200 GOLD) para simular un marketplace activo desde el inicio

Al terminar, el script muestra las tres direcciones de contrato: EAIGold, EAIProject y EAINFT, las tres necesarias para configurar los frontends.

**Paso 3 — Configurar los frontends:**
En los archivos `app.js` de ambos juegos, se actualizan tres direcciones: `contractAddress` (EAIProject), `goldContractAddress` (EAIGold) y `nftContractAddress` (EAINFT).

### Fase 2: Sesión de Juego

**Paso 4 — El jugador abre un juego:**
Abre `game-a-space/index.html` o `game-b-fantasy/index.html` directamente en el navegador (no hace falta servidor web). Aparece la pantalla de login con los personajes disponibles.

**Paso 5 — Login:**
El jugador hace clic en su personaje. El frontend se conecta automáticamente a la blockchain local usando las credenciales de ese personaje y carga el inventario y el marketplace.

**Paso 6 — Explorar el inventario:**
El jugador ve sus activos representados con la temática del juego que ha abierto. El balance que ve como primario es su saldo en **GOLD**; el ETH disponible aparece como información secundaria.

**Paso 6b — Obtener GOLD (si es necesario):**
Si el jugador quiere comprar activos pero no tiene GOLD, hace clic en "Buy GOLD". Introduce cuánto ETH quiere convertir, ve la previsión de GOLD que recibirá y confirma. El contrato EAIGold realiza la conversión al instante.

**Paso 7 — Listar un activo a la venta:**
Desde el panel de detalles de un activo, el jugador indica cuántas unidades quiere vender y a qué precio en GOLD. El sistema comprueba si el contrato tiene permiso para gestionar sus tokens ERC-1155 (si no, solicita aprobación primero) y luego registra el listado con precio en GOLD.

**Paso 8 — Comprar desde el otro juego:**
Un segundo jugador abre el otro juego. En el marketplace ve el activo listado con su precio en GOLD (con la temática de su propio juego). Hace clic en "Buy"; el frontend verifica que tiene GOLD suficiente y que el allowance está aprobado para EAIProject. La transacción se ejecuta: el activo llega al inventario del comprador y el GOLD llega al vendedor.

### Diagrama del Flujo

```
VENDEDOR (Game A)                      COMPRADOR (Game B)
─────────────────────                  ─────────────────────
1. Abre game-a-space
2. Login como Pilot Alpha
3. Balance: 0 GOLD / 1 ETH

4. Convierte 0.1 ETH → GOLD
   Recibe ≈172 GOLD
   (vía EAIGold.mintGold)

5. Ve inventario:
   🔫 Plasma Rifle ×10

6. Lista 3 unidades a
   50 GOLD c/u
        │
        │  → Blockchain registra listing ←
        │                                 │
        │                        7. Ve en Grand Bazaar:
        │                           🏹 Enchanted Bow ×3
        │                           Vendido por Knight Aldric
        │                           Precio: 50 GOLD c/u
        │                                 │
        │                        8. Aprueba GOLD allowance
        │                           para EAIProject (si no lo tiene)
        │                                 │
        │  ← Blockchain ejecuta compra ←  │
        │                        9. Compra 1 unidad (50 GOLD)
        │
10. Recibe 48.75 GOLD            10. Inventario crece:
    (2.5% de comisión a               🏹 Enchanted Bow ×1
    EAIProject = 1.25 GOLD)           Saldo: -50 GOLD
```

---

## 10. Scripts de Despliegue

El proyecto incluye dos scripts de despliegue para dos situaciones diferentes.

### Script de Desarrollo Local (`deploy-local.js`)

Este script está diseñado para facilitar el desarrollo y las pruebas. Despliega los **tres contratos** (EAIGold, EAIProject y EAINFT) y genera automáticamente un estado inicial con datos aleatorios y reliquias únicas para que haya algo que ver y probar desde el primer momento.

Sus características principales son:
- Lanza un servidor de metadatos integrado para no necesitar IPFS real. Sirve tanto los metadatos de ítems ERC-1155 (archivos `1.json`–`6.json`) como los metadatos de reliquias NFT (archivos `nft-100.json`–`nft-102.json`).
- Despliega EAIGold (ERC-20), luego EAIProject (ERC-1155) pasándole la dirección de EAIGold, y finalmente EAINFT (ERC-721) también pasándole la dirección de EAIGold.
- Crea inventarios variados para tres jugadores con cantidades aleatorias (1-15 unidades de 2-4 tipos de tokens ERC-1155 por jugador).
- Acuña exactamente una reliquia ERC-721 para cada jugador (NFTs #100, #101 y #102).
- Aprueba tanto el contrato EAIProject (para tokens ERC-1155) como el contrato EAINFT (para reliquias ERC-721) para gestionar los activos de cada jugador.
- Los jugadores parten con 0 GOLD: deben convertir ETH en el juego usando el botón "Buy GOLD".
- Ajusta los balances ETH a exactamente 1 ETH por jugador para simular un entorno realista.
- Genera listados de venta activos con precios en GOLD (entre 10 y 200 GOLD) para poblar el marketplace de ítems.
- Al finalizar muestra en consola las **tres** direcciones de contrato para copiarlas en los frontends.

La aleatoriedad es importante: cada ejecución genera un estado diferente para los ítems ERC-1155, permitiendo probar el sistema en distintas condiciones. Las reliquias NFT son siempre las mismas tres (IDs 100, 101, 102) pero asignadas a los mismos jugadores.

### Script de Producción (`deploy.js`)

Este script es más simple y está pensado para desplegar en redes reales (Polygon Amoy Testnet). Solo despliega el contrato sin crear datos de prueba. Requiere un archivo `.env` con:
- La URL del nodo RPC de Polygon Amoy
- La clave privada de la cuenta que pagará el despliegue (necesita fondos reales de testnet)
- La clave de la API de PolygonScan para verificar el contrato públicamente

La verificación del contrato es importante en producción: permite que cualquier persona compruebe en PolygonScan que el código del contrato es exactamente el que dice ser, aumentando la confianza en el sistema.

---

## 11. Pruebas del Sistema

### Qué se Prueba y Por Qué

El proyecto incluye una suite completa de tests automatizados que verifican que el contrato funciona exactamente como se espera. Estos tests son fundamentales en blockchain porque una vez desplegado el contrato, no se puede modificar. Un error no detectado en los tests podría quedar permanentemente en la blockchain.

Los tests se ejecutan en una blockchain simulada en memoria, lo que los hace muy rápidos (segundos) y completamente aislados de cualquier estado externo.

### Casos de Prueba Implementados

**Pruebas de Creación de Activos (Mint)**
- Verificar que los tokens se crean correctamente y se asignan a la dirección correcta.
- Verificar que los metadatos (URI) se almacenan correctamente vinculados al token.
- Verificar que se emite el evento de aviso correspondiente.
- Verificar que alguien sin el rol de acuñador no puede crear tokens.

**Pruebas de Listado (List for Sale)**
- Verificar que el listado se crea correctamente con el precio y cantidad indicados.
- Verificar que se emite el evento de aviso al listar.
- Verificar que no se puede listar con cantidad cero.
- Verificar que no se puede listar con precio cero.
- Verificar que no se puede listar más cantidad de la que se tiene.
- Verificar que no se puede listar sin haber dado permiso al contrato.

**Pruebas de Cancelación**
- Verificar que el listado queda inactivo al cancelar.
- Verificar que se emite el evento correspondiente.
- Verificar que no se puede cancelar algo que no está listado.

**Pruebas de Compra (Buy Item)**
- Verificar que los tokens llegan correctamente al comprador.
- Verificar que los tokens se descuentan correctamente del vendedor.
- Verificar que el evento de venta se emite correctamente.
- Verificar que la comisión se acumula en el contrato (2,5% del precio).
- Verificar que no se puede comprar un listado inactivo.
- Verificar que no se puede comprar enviando el dinero incorrecto.
- Verificar que el listado se desactiva automáticamente cuando se agotan las unidades.

**Pruebas de Comisiones**
- Verificar que el administrador puede retirar las comisiones acumuladas.
- Verificar que no se puede retirar si no hay comisiones acumuladas.

**Pruebas de Interfaces**
- Verificar que el contrato declara correctamente que implementa el estándar ERC-1155.
- Verificar que el contrato declara correctamente que implementa el sistema de control de acceso.

### Cómo Ejecutar los Tests

```bash
npx hardhat test
```

El resultado muestra cada test con un indicador de éxito o fallo, y al final un resumen del total de tests pasados y fallidos.

---

## 12. Seguridad

La seguridad en smart contracts es crítica. A diferencia del software tradicional, los errores no se pueden parchear fácilmente: el contrato está desplegado en la blockchain para siempre. El proyecto implementa varias medidas de seguridad estándar de la industria.

### Protección contra Reentrada (Reentrancy Guard)

Uno de los ataques más famosos en blockchain (el hack de The DAO en 2016 costó 60 millones de dólares) consiste en llamar recursivamente a una función de pago antes de que el contrato actualice su estado interno. El contrato usa la protección de OpenZeppelin que bloquea cualquier llamada re-entrante, haciendo este ataque imposible.

### Verificación Antes de Ejecución

El contrato siempre verifica que todas las condiciones son válidas antes de ejecutar ninguna acción. Si alguna condición falla, la transacción completa se revierte como si nunca hubiera ocurrido. Esto garantiza que el estado del contrato nunca quede en un estado inconsistente.

### Control de Acceso Basado en Roles

No todo el mundo puede hacer todo. Crear tokens requiere el rol de acuñador. Retirar comisiones requiere ser administrador. Esto evita que usuarios maliciosos puedan crear tokens de la nada o vaciar las comisiones del sistema.

### Límite Máximo de Comisión

El administrador puede cambiar la comisión del marketplace, pero hay un límite máximo del 10% codificado en el contrato. Esto protege a los usuarios frente a posibles abusos por parte del administrador.

### Uso de Librerías Auditadas

En lugar de implementar la lógica de tokens desde cero, el proyecto usa OpenZeppelin, una librería de contratos que ha sido auditada múltiples veces por empresas de seguridad especializadas y es usada por miles de proyectos con miles de millones de dólares en valor bloqueado.

---

## 13. Estado Actual y Consideraciones Futuras

### Estado del Proyecto

El proyecto está **completamente funcional** para su propósito demostrativo:

- ✅ Tres smart contracts desplegados: EAIGold (ERC-20) + EAIProject (ERC-1155) + EAINFT (ERC-721)
- ✅ Economía basada en token GOLD con conversión ETH → GOLD desde el frontend
- ✅ Marketplace de ítems semi-fungibles que usa GOLD como moneda (comisiones en GOLD)
- ✅ Marketplace de reliquias únicas NFT que también usa GOLD como moneda
- ✅ Tres reliquias ERC-721 únicas (NFTs #100, #101, #102) asignadas a los jugadores al inicio
- ✅ Dos frontends temáticos funcionales con interoperabilidad demostrada
- ✅ Marketplaces en tiempo real con eventos reactivos (para ítems y para NFTs)
- ✅ Despliegue local automatizado con datos de prueba y reliquias únicas
- ✅ Compatibilidad con Polygon Amoy Testnet para demostración pública
- ✅ Sistema de metadatos con 6 activos interoperables + 3 metadatos de reliquias NFT

### Limitaciones Actuales

**Marketplace completamente on-chain:** Toda la información de los listados se guarda en la blockchain. Esto es funcional pero costoso en términos de gas. En plataformas de producción reales como OpenSea, los listados se gestionan off-chain (en servidores tradicionales) y solo el momento de la compra-venta real ocurre on-chain. Esto reduce enormemente los costes.

**Sin autenticación con MetaMask:** Los frontends actuales usan claves privadas hardcodeadas en el código, lo cual es válido para pruebas pero no para producción. En un entorno real, el usuario conectaría su propia cartera (MetaMask u otra) y firmaría las transacciones él mismo.

**Metadatos locales:** El servidor de metadatos es un servidor HTTP local. En producción habría que migrar a IPFS real o a un servicio de almacenamiento descentralizado para garantizar la persistencia.

**Solo dos juegos:** La arquitectura está diseñada para soportar N juegos, pero actualmente solo hay dos implementados. Escalar a más juegos solo requeriría añadir más campos de skin en los metadatos y crear nuevos frontends que los lean.

### Posibles Extensiones

- Añadir más juegos con otras temáticas (deportes, cyberpunk, western...) sin modificar el contrato.
- Implementar un sistema de crafting donde combinar activos genere nuevos activos.
- Añadir rareza dinámica donde las estadísticas de los activos cambien con el uso.
- Migrar el order book al patrón off-chain + on-chain settlement para mayor eficiencia.
- Implementar torneos o eventos especiales donde los activos del inventario den ventajas.

---

## 14. Conclusiones

El **Ecosistema de Activos Interoperables (EAI)** demuestra de forma práctica cómo blockchain puede cambiar fundamentalmente la relación entre jugadores y activos digitales.

El concepto más valioso que ilustra el proyecto es que **la propiedad real de activos digitales es posible**. Los tokens existen en la blockchain independientemente de cualquier empresa o servidor. Ningún desarrollador puede quitarle sus activos a un jugador, y los activos pueden cruzar fronteras entre juegos porque no le pertenecen al juego, sino al jugador.

La implementación técnica combina tres estándares de forma coherente: el estándar ERC-20 proporciona la moneda GOLD del ecosistema, el estándar ERC-1155 gestiona los activos de inventario semi-fungibles con su marketplace, y el estándar ERC-721 garantiza la unicidad absoluta de las reliquias NFT. El sistema de metadatos duales resuelve elegantemente el problema de la representación visual por juego sin duplicar activos en la blockchain, y los marketplaces integrados eliminan la necesidad de plataformas intermediarias.

La distinción más instructiva del proyecto es la diferencia entre los ítems de inventario (muchos jugadores pueden tener el mismo tipo de ítem, en múltiples copias) y las reliquias NFT (solo un jugador puede poseer cada reliquia en cada momento, garantizado matemáticamente). Esta distinción refleja perfectamente la naturaleza real de los objetos en un ecosistema de gaming: los recursos son replicables, los artefactos legendarios son únicos.

Desde el punto de vista académico, el proyecto pone en práctica conceptos fundamentales de la computación distribuida: consenso descentralizado, inmutabilidad de datos, ejecución de lógica de negocio sin intermediarios, y la separación entre estado (blockchain) y presentación (frontend). La blockchain actúa exactamente como lo que es: una base de datos distribuida donde los registros de propiedad son seguros, transparentes y auditables por cualquier persona.

---

*Informe generado para el Módulo 1 de Blockchain — Computación distribuida para la gestión de datos a gran escala*
