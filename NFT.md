# NFTs en el Proyecto EAI
## Las Reliquias Únicas: ERC-721 en Acción

> **Asignatura:** Computación distribuida para la gestión de datos a gran escala
> **Módulo:** 1 — Blockchain

---

## Índice

1. [La Respuesta Directa: Sí, Hay NFTs](#1-la-respuesta-directa-sí-hay-nfts)
2. [Qué es Realmente un NFT](#2-qué-es-realmente-un-nft)
3. [Los Tres Estándares del Proyecto: ERC-20, ERC-721 y ERC-1155](#3-los-tres-estándares-del-proyecto-erc-20-erc-721-y-erc-1155)
4. [El Contrato EAINFT: Las Reliquias del Ecosistema](#4-el-contrato-eainft-las-reliquias-del-ecosistema)
5. [Las Tres Reliquias: Los NFTs del Sistema](#5-las-tres-reliquias-los-nfts-del-sistema)
6. [Cómo Funciona el Mercado de NFTs](#6-cómo-funciona-el-mercado-de-nfts)
7. [La Diferencia Fundamental: NFTs vs. Tokens Semi-Fungibles](#7-la-diferencia-fundamental-nfts-vs-tokens-semi-fungibles)
8. [Cómo Coexisten los Tres Estándares en los Juegos](#8-cómo-coexisten-los-tres-estándares-en-los-juegos)
9. [Por Qué Cada Estándar Tiene su Rol](#9-por-qué-cada-estándar-tiene-su-rol)
10. [Conclusión: Un Ecosistema de Tres Capas](#10-conclusión-un-ecosistema-de-tres-capas)

---

## 1. La Respuesta Directa: Sí, Hay NFTs

**Sí. El proyecto EAI contiene NFTs auténticos.**

El proyecto implementa un tercer contrato inteligente llamado **EAINFT**, que sigue el estándar ERC-721: el estándar técnico oficial de los tokens no fungibles. Cada NFT de este contrato es un objeto único, con un ID irrepetible en toda la blockchain, que solo puede pertenecer a un único jugador en cada momento.

Estos NFTs son las **Reliquias del ecosistema**: artefactos únicos que representan los objetos más poderosos y exclusivos del mundo de EAI. A diferencia de los activos del inventario normal (espadas, escudos, arcos), de los que puede haber docenas de unidades repartidas entre los jugadores, una reliquia es absolutamente única. Si un jugador tiene la "Stellar Core Fragment", ningún otro jugador puede tenerla al mismo tiempo. Si la vende, la pierde. Si la compra otro jugador, ese otro pasa a ser su único propietario.

El proyecto EAI utiliza **tres estándares de tokens distintos**, cada uno con un propósito específico:

- **ERC-20 (EAIGold):** La moneda del ecosistema. Tokens GOLD fungibles, la divisa con la que se paga todo.
- **ERC-721 (EAINFT):** Las reliquias únicas. NFTs irrepetibles que solo puede tener una persona a la vez.
- **ERC-1155 (EAIProject):** Los activos del inventario. Tokens semi-fungibles de los que existen múltiples copias.

Esta combinación de tres estándares trabajando juntos es uno de los aspectos más ricos del proyecto y merece una explicación detallada.

---

## 2. Qué es Realmente un NFT

### La Definición Técnica

NFT son las siglas de **Non-Fungible Token**, que en español significa Token No Fungible. Para entender qué significa "no fungible" hay que entender primero qué significa "fungible".

Un bien **fungible** es aquel donde cada unidad es idéntica e intercambiable con cualquier otra unidad del mismo tipo. Un euro es fungible: tu euro y mi euro valen exactamente lo mismo y pueden intercambiarse sin que nadie pierda o gane nada. Un litro de gasolina del mismo octanaje es fungible. Una acción de una empresa en bolsa es fungible.

Un bien **no fungible** es aquel donde cada unidad es única e irrepetible. Una pintura original de Velázquez no es fungible: no hay otra igual en el mundo. El asiento 14B de un vuelo concreto no es fungible: es ese asiento específico en ese vuelo específico.

Un NFT lleva este concepto al mundo digital: es un token en blockchain donde **existe exactamente una unidad** y esa unidad tiene una identidad única e irrepetible que la distingue de cualquier otro token en toda la blockchain.

### El Estándar Técnico: ERC-721

Los NFTs en el ecosistema Ethereum utilizan el estándar **ERC-721**, definido en 2018. Este estándar establece que cada token tiene un ID único y que de ese ID existe exactamente una unidad. Si el Token #100 existe, solo puede haber un Token #100 en todo el contrato, y ese token pertenece a exactamente una dirección.

Esto es lo que hizo famosos a los NFTs de arte digital, los CryptoPunks, los Bored Apes y colecciones similares: cada pieza es un objeto digital único que solo puede pertenecer a una persona a la vez.

### La Propiedad Clave: Supply de 1

La característica definitoria de un NFT es que su **supply total es siempre 1**. No puede haber dos personas con el mismo NFT porque solo existe uno. Cuando alguien lo compra, el anterior propietario lo pierde. No se pueden tener "5 copias" del mismo NFT porque la unicidad está garantizada por el estándar.

El contrato EAINFT del proyecto hace exactamente esto: cada `mintRelic()` crea un nuevo token con un ID auto-incremental (100, 101, 102...) que nunca se repite, y ese token pertenece a exactamente una persona en todo momento.

---

## 3. Los Tres Estándares del Proyecto: ERC-20, ERC-721 y ERC-1155

El proyecto EAI combina los tres estándares de tokens más importantes de Ethereum, y cada uno cumple una función que los demás no pueden cumplir:

### ERC-20: Token Puramente Fungible — EAIGold ✅

Es el estándar original para tokens fungibles. Todos los tokens son idénticos e intercambiables. Diseñado para monedas y activos financieros.

**En EAI:** Es el contrato **EAIGold**. El token GOLD es un ERC-20: todos los GOLD son idénticos, intercambiables perfectamente, y representan la moneda del ecosistema. Los jugadores los obtienen convirtiendo ETH a través de `mintGold()` a un tipo de cambio fijo de 1 GOLD = 0,00058 ETH. Con GOLD se pagan **todos** los activos del marketplace, tanto los tokens ERC-1155 como las reliquias ERC-721.

### ERC-721: Token Puramente No Fungible (NFT) — EAINFT ✅

Cada token tiene un ID único y existe exactamente una unidad. Cada token puede tener sus propios metadatos distintos. No hay dos tokens iguales dentro de un contrato ERC-721. Diseñado para coleccionables, arte digital, certificados únicos.

**En EAI:** Es el contrato **EAINFT**. Las tres reliquias del ecosistema (IDs 100, 101 y 102) son tokens ERC-721 auténticos: objetos digitales únicos e irrepetibles. Cada jugador recibe exactamente una reliquia al inicio. Solo puede haber un propietario de cada reliquia en cada momento.

### ERC-1155: Token Semi-Fungible — EAIProject ✅

Puede gestionar múltiples tipos de tokens en un solo contrato. Cada tipo (ID) puede tener cualquier número de unidades en circulación. Las unidades del mismo tipo son perfectamente intercambiables entre sí. Diseñado específicamente para videojuegos e inventarios digitales.

**En EAI:** Es el contrato **EAIProject**. Los 6 tipos de activos (IDs del 1 al 6) son tokens semi-fungibles: pueden existir múltiples copias de cada uno repartidas entre los jugadores. Sus precios en el marketplace se expresan en GOLD (ERC-20).

| Característica | ERC-20 (EAIGold ✅) | ERC-721 (EAINFT ✅) | ERC-1155 (EAIProject ✅) |
|---|---|---|---|
| Tipos distintos | Solo 1 (GOLD) | Ilimitados (cada token es un tipo) | Ilimitados (6 activos) |
| Unidades por tipo | Ilimitadas | Exactamente 1 | Ilimitadas |
| Fungibilidad | Total | Ninguna | Por tipo |
| Coste de transferencia múltiple | Bajo | 1 tx por token | Bajo (batch) |
| Metadatos | No | Por token individual | Por tipo |
| Uso en el proyecto | Moneda GOLD del marketplace | Reliquias únicas únicas | Inventario de activos del juego |
| Uso ideal general | Monedas | Coleccionables únicos | Inventarios de juego |

---

## 4. El Contrato EAINFT: Las Reliquias del Ecosistema

### Qué Hace Este Contrato

EAINFT es el tercer contrato inteligente del proyecto. Hereda del estándar ERC-721 de OpenZeppelin, añade una extensión que permite almacenar una URI de metadatos por cada token individual, e incorpora su propio marketplace integrado donde los NFTs se compran y venden en tokens GOLD.

La diferencia más importante respecto al contrato de activos EAIProject (ERC-1155) es que aquí no existe el concepto de "cantidad". Cada token es uno y es único. No se puede tener "3 reliquias del tipo 100": hay exactamente un token con el ID 100 en toda la blockchain.

### Cómo se Crean los NFTs

Solo el administrador del contrato puede crear nuevas reliquias, mediante la función `mintRelic`. Cuando se invoca, el contrato asigna automáticamente el siguiente ID disponible (la numeración empieza en 100 para no colisionar con los IDs 1-6 del contrato ERC-1155), registra la URI de los metadatos de esa reliquia específica, y transfiere el token a la dirección del destinatario.

Esto es diferente al mint del contrato ERC-1155, donde se especifica cuántas unidades crear. Aquí cada llamada crea exactamente un objeto único, con su ID propio y sus metadatos propios.

Al inicio del sistema, el script de despliegue llama a `mintRelic` tres veces: una para cada jugador, creando los IDs 100, 101 y 102. Desde ese momento, esos tres tokens existen en la blockchain y no pueden ser duplicados.

### Cómo Guarda la Información

El contrato guarda en la blockchain:

**El registro de propietarios (heredado de ERC-721):** Un mapa que relaciona cada ID de token con su propietario actual. Es la fuente de verdad sobre quién posee cada reliquia. Cada vez que una reliquia cambia de manos, este mapa se actualiza.

**Las URIs de metadatos (ERC721URIStorage):** A diferencia de los tokens ERC-1155 donde todos los tokens del mismo tipo comparten metadatos, aquí cada token tiene su propia URI individual. Esto significa que el token #100 puede tener una imagen, un nombre y unos atributos completamente distintos al token #101, aunque estén en el mismo contrato.

**El registro del marketplace de NFTs:** Para cada token que ha sido listado alguna vez, el contrato guarda si el listado está activo, quién es el vendedor y cuál es el precio en GOLD. Este marketplace está completamente separado del marketplace de EAIProject.

**Las comisiones acumuladas en GOLD:** Al igual que EAIProject, este contrato retiene el 2,5% de cada venta en GOLD. Solo el administrador puede retirarlas.

### Los Eventos del Contrato

El contrato emite eventos blockchain en los momentos clave de su ciclo de vida:

- **RelicMinted:** Se acuña una nueva reliquia. Los frontends pueden mostrar una notificación al jugador que la recibe.
- **NFTListedForSale:** Un propietario pone su reliquia a la venta. El marketplace de NFTs se actualiza en todos los juegos conectados.
- **NFTSold:** Una reliquia cambia de manos. El inventario del comprador se actualiza y el vendedor ve su GOLD aumentar.
- **NFTListingCancelled:** El propietario retira su oferta de venta.
- **FeesWithdrawn:** El administrador extrae las comisiones acumuladas.

Estos eventos permiten que los frontends sean reactivos: en lugar de preguntar repetidamente al contrato "¿ha cambiado algo?", simplemente escuchan y reaccionan cuando el contrato les avisa.

---

## 5. Las Tres Reliquias: Los NFTs del Sistema

En el despliegue inicial del ecosistema, se crean exactamente tres reliquias: una para cada jugador. Cada una es un objeto único con dos nombres (uno para cada juego temático) y sus propios metadatos en el servidor de metadatos local (archivos `nft-100.json`, `nft-101.json` y `nft-102.json`).

### Reliquia #100: El Artefacto del Espacio y la Corona

En el universo espacial de Game A se llama **"Stellar Core Fragment"**, un fragmento del núcleo de una estrella, un objeto imposible de replicar. En el mundo de fantasía de Game B se llama **"Crown of the Ancients"**, la corona de los reyes ancestrales, de la que existe un único ejemplar en toda la historia del mundo.

Este NFT se asigna al primer jugador al inicio del sistema.

### Reliquia #101: El Motor del Vacío y el Cetro Llameante

En Game A es el **"Void Engine Shard"**, un fragmento del motor que consume el vacío entre galaxias. En Game B es el **"Scepter of Eternal Flame"**, el cetro de la llama eterna, forjado una sola vez en los albores del mundo.

Este NFT se asigna al segundo jugador.

### Reliquia #102: El Cristal de la Nebulosa y el Orbe del Rey Dragón

En Game A es el **"Nebula Heart Crystal"**, el cristal formado en el corazón de una nebulosa durante millones de años. En Game B es el **"Orb of the Dragon King"**, el orbe que concedió poder absoluto al rey de los dragones, y del que no existe ninguna copia.

Este NFT se asigna al tercer jugador.

### Por Qué Tienen Nombres Duales

Al igual que los activos del inventario ERC-1155, las reliquias tienen una doble identidad visual: el mismo token blockchain se muestra con diferentes nombres e imágenes según el juego que lo renderice. Esto demuestra la interoperabilidad en acción: el mismo objeto único existe en dos mundos simultáneamente, pero siempre con un único dueño.

La propiedad `glow: "orange"` en sus metadatos hace que ambos juegos muestren un efecto de brillo dorado alrededor de las reliquias, distinguiéndolas visualmente de los activos comunes del inventario ERC-1155.

---

## 6. Cómo Funciona el Mercado de NFTs

### Listar una Reliquia

El propietario de una reliquia puede ponerla a la venta en cualquier momento. Para hacerlo, selecciona la reliquia en su inventario, indica el precio en tokens GOLD que quiere recibir, y el contrato EAINFT registra el listado. El contrato verifica antes que el vendedor sea realmente el dueño del token y que haya dado permiso al contrato para transferirlo en su nombre.

Nótese que el token no se mueve al hacer el listado: la reliquia sigue en el inventario del propietario mientras está listada. Solo cuando se produce la compra el token cambia de manos. Esto es importante: si el propietario cancela el listado, no necesita "recuperar" el token porque nunca lo entregó.

### Comprar una Reliquia

La compra es el momento central del ciclo de vida de un NFT. Cuando un jugador quiere comprar una reliquia del marketplace, el contrato EAINFT ejecuta en un único paso atómico:

1. Verifica que el listado está activo y que la reliquia sigue perteneciendo al vendedor listado.
2. Verifica que el comprador no es el mismo que el vendedor (no puedes comprar tu propio NFT).
3. Desactiva el listado (antes de cualquier transferencia, para evitar ataques de reentrada).
4. Calcula la comisión del 2,5% sobre el precio total en GOLD.
5. Transfiere el 97,5% del GOLD del comprador directamente al vendedor.
6. Transfiere el 2,5% restante en GOLD al propio contrato como comisión acumulada.
7. Transfiere la propiedad del NFT del vendedor al comprador.

Si cualquiera de estos pasos falla, toda la operación se revierte: ni el GOLD sale ni el NFT cambia de manos. Es imposible pagar sin recibir el NFT, o recibir el NFT sin pagar.

Para que la compra funcione, el comprador debe haber aprobado previamente al contrato EAINFT para gastar la cantidad de GOLD necesaria en su nombre. Los frontends verifican este allowance antes de intentar la compra y solicitan la aprobación si es necesario.

### Cancelar un Listado

El propietario puede retirar su reliquia del mercado en cualquier momento, siempre que nadie la haya comprado aún. El contrato verifica que quien cancela es el propietario actual del token, marca el listado como inactivo, y el NFT sigue en el inventario de su dueño como si nunca hubiera estado listado.

### Ver los NFTs en el Mercado

Cualquier jugador puede consultar el marketplace de reliquias: el contrato tiene una función que devuelve todos los listados activos de NFTs con sus IDs, vendedores y precios. Los frontends llaman a esta función al cargarse y la actualizan cuando reciben un evento de nueva venta o nuevo listado.

---

## 7. La Diferencia Fundamental: NFTs vs. Tokens Semi-Fungibles

Ahora que el proyecto tiene los dos tipos de tokens (ERC-721 y ERC-1155), es importante entender la diferencia que en la práctica se observa en el ecosistema.

### Analogía 1: El Cuadro Original vs. Las Postales

El Token #4 del inventario (Void Blade / Shadow Dagger) en ERC-1155 es como una postal del cuadro de la Mona Lisa: puede haber 50 copias en circulación, cada una es idéntica a las demás, y cualquier jugador con suficiente GOLD puede comprar una. Cuando alguien vende 2 unidades, ambas partes siguen teniendo copias; solo cambia la distribución.

La Reliquia #100 (Stellar Core Fragment / Crown of the Ancients) en ERC-721 es como el original de la Mona Lisa: existe exactamente una. Solo un jugador en todo el ecosistema puede tenerla en cada momento. Si la vende, la pierde completamente. Si alguien la compra, se convierte en el único propietario.

### Analogía 2: La Rareza Verificable

En los activos ERC-1155, la rareza es una propiedad declarada en los metadatos: el Token #4 tiene `"rarity": "Legendary"` porque así está escrito en el JSON. Pero en principio, el administrador podría acuñar miles de unidades de ese token. La escasez es relativa y gestionada.

En los NFTs ERC-721, la rareza es objetivamente verificable en la blockchain. `getAllMintedIds()` devuelve exactamente los IDs que existen: 100, 101 y 102. Hay tres reliquias en todo el ecosistema y no puede haber más a menos que el administrador llame a `mintRelic()` de nuevo. La escasez es absoluta y verificable por cualquier persona.

### Analogía 3: El Inventario vs. La Colección

Cuando un jugador gestiona sus activos ERC-1155, piensa en términos de **cantidad**: "tengo 10 Plasma Rifles, venderé 3". No importa cuáles 3 exactamente: todos son intercambiables.

Cuando gestiona sus reliquias ERC-721, piensa en términos de **identidad**: "tengo la Reliquia #100". No hay "cuántas" porque siempre es exactamente una. No hay copias intercambiables; solo hay ese objeto único.

### Qué Ocurre en el Inventario de los Juegos

Los frontends distinguen visualmente entre los dos tipos:

- Los activos ERC-1155 muestran un número de unidades ("×10") y permiten especificar cuántas unidades listar o comprar.
- Las reliquias ERC-721 muestran un badge "NFT" especial y un efecto de brillo dorado (`glow: orange`). No tienen campo de cantidad porque siempre son exactamente una. El botón de compra dice "Buy Artifact" en lugar de "Buy Item". No se puede comprar "2 reliquias" porque cada reliquia es un objeto distinto con su ID único.

---

## 8. Cómo Coexisten los Tres Estándares en los Juegos

La implementación en los frontends es elegante: cada juego combina los tres estándares en una experiencia coherente para el jugador.

### La Carga del Inventario

Cuando un jugador abre el juego, el frontend realiza dos consultas paralelas a la blockchain:

**Para los activos ERC-1155:** Consulta el contrato EAIProject preguntando cuántas unidades de cada uno de los 6 tokens (IDs 1-6) tiene el jugador. Por cada tipo con saldo positivo, descarga los metadatos del servidor local y muestra el activo con el nombre e icono del juego correspondiente.

**Para las reliquias ERC-721:** Consulta el contrato EAINFT pidiendo todos los IDs que han sido acuñados, luego verifica cuáles pertenecen al jugador mediante `ownerOf()`. Por cada reliquia de ese jugador, descarga los metadatos específicos de esa reliquia (el archivo `nft-{id}.json`) y la muestra en el inventario con el badge NFT y el efecto dorado.

El resultado es un inventario unificado que mezcla los dos tipos de activos, distinguiéndolos visualmente pero mostrándolos en el mismo panel.

### El Marketplace Global

El marketplace de cada juego también combina los dos tipos de activos:

**Sección de Items (ERC-1155):** Lista todas las ofertas activas del contrato EAIProject, donde los vendedores han puesto a la venta cierto número de unidades de tokens semi-fungibles. Cada oferta muestra la cantidad disponible y el precio por unidad en GOLD.

**Sección de Artefactos Únicos (ERC-721):** Lista todas las reliquias del contrato EAINFT que están en venta. Cada oferta es para un objeto específico e identificable (no hay cantidad, siempre es 1). El precio es la cantidad de GOLD que el vendedor pide por esa reliquia concreta.

### El Balance de GOLD Unificado

Ambas operaciones —comprar activos semi-fungibles y comprar reliquias NFT— consumen tokens GOLD del mismo contrato EAIGold. El jugador tiene un único saldo GOLD que puede usar indistintamente para cualquier compra en ambos marketplaces.

---

## 9. Por Qué Cada Estándar Tiene su Rol

### ERC-20 para la Moneda: La Uniformidad es un Requisito

Una moneda de intercambio no puede ser no fungible. Si cada token GOLD fuera distinto (como un NFT), no habría forma de saber cuánto "vale" cada GOLD o de calcular precios. La fungibilidad total del ERC-20 es exactamente lo que hace funcionar a GOLD como moneda: todos los GOLD son equivalentes y se pueden sumar, restar y comparar sin ambigüedad.

### ERC-1155 para el Inventario: La Semi-Fungibilidad es lo Correcto para un Juego

Los objetos de un videojuego son naturalmente replicables. Una poción de curación, un escudo, una espada: estos objetos existen en múltiples ejemplares porque el mundo del juego los genera continuamente. Modelarlos como NFTs únicos sería artificialmente restrictivo: ¿qué sentido tiene que en todo el universo del juego solo exista una Plasma Rifle? ERC-1155 refleja la naturaleza real de los objetos de inventario: múltiples copias, libremente intercambiables, agrupadas eficientemente en una única transacción.

### ERC-721 para las Reliquias: La Unicidad es la Propuesta de Valor

Las reliquias son conceptualmente distintas a los objetos del inventario. Son artefactos legendarios, únicos en la historia del ecosistema, con una narrativa propia. Su valor proviene precisamente de que no hay otro igual. Si hubiera 50 copias de la "Stellar Core Fragment", su significado como objeto único y poderoso se diluiría.

ERC-721 hace que la unicidad no sea una promesa del desarrollador sino una garantía matemática inscrita en la blockchain. Cualquier persona puede verificar que existe exactamente un token con el ID 100, que pertenece a una única dirección, y que no puede existir otro token #100 en ese contrato.

### La Interacción entre los Tres

Lo más notable del proyecto es cómo los tres estándares **trabajan en conjunto en cada transacción**:

- **Compra de un ítem ERC-1155:** EAIProject ordena a EAIGold que mueva GOLD del comprador al vendedor y al fondo de comisiones, mientras simultáneamente transfiere las unidades de token del vendedor al comprador.
- **Compra de una reliquia ERC-721:** EAINFT ordena a EAIGold que mueva GOLD del comprador al vendedor y al fondo de comisiones, mientras simultáneamente transfiere la propiedad del NFT del vendedor al comprador.

En ambos casos, una sola transacción blockchain hace que todo ocurra de forma atómica: o todo se ejecuta correctamente o nada ocurre. No puede salir el GOLD sin que llegue el activo, y no puede llegar el activo sin que salga el GOLD.

---

## 10. Conclusión: Un Ecosistema de Tres Capas

### La Arquitectura Definitiva del Proyecto

El proyecto EAI ha evolucionado hasta implementar una arquitectura de tokens de tres capas que refleja exactamente la naturaleza de cada tipo de activo en un ecosistema de gaming blockchain:

**Capa 1 — La Economía:** El token GOLD (ERC-20) es la moneda universal del ecosistema. Fungible, intercambiable, mensurable. Los jugadores lo obtienen convirtiendo ETH y lo gastan en comprar cualquier tipo de activo. Es el aceite que hace funcionar el motor económico.

**Capa 2 — El Inventario:** Los tokens de activos (ERC-1155) son los objetos del juego cotidiano: armas, armaduras, consumibles. Semi-fungibles, en múltiples copias, gestionados eficientemente. Representan los recursos que los jugadores acumulan, comercian y usan en su aventura diaria.

**Capa 3 — Las Reliquias:** Los tokens únicos (ERC-721) son los objetos más especiales del ecosistema: artefactos irrepetibles, únicos en toda la blockchain, con un solo propietario en cada momento. Representan los logros máximos, los objetos de mayor valor y la cúspide del sistema de juego.

### El Valor de la Distinción

Esta distinción de tres niveles no es arbitraria: responde a la naturaleza real de los activos en un ecosistema de gaming. Usar un solo estándar para todo significaría un compromiso que empeoraría cada categoría: los activos de inventario serían demasiado costosos si fueran NFTs únicos; las reliquias perderían su exclusividad si fueran tokens semi-fungibles; y la moneda no funcionaría si tuviera tipos distintos como ERC-1155.

Cada estándar es la herramienta correcta para su propósito, y el proyecto EAI los combina de una manera que demuestra cómo puede construirse un ecosistema de gaming blockchain completo y sofisticado sobre principios técnicos sólidos.

---

*Informe elaborado para el Módulo 1 de Blockchain — Computación distribuida para la gestión de datos a gran escala*
