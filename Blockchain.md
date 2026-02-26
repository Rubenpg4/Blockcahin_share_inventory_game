# Blockchain en el Ecosistema de Activos Interoperables (EAI)
## Informe Exhaustivo: Uso, Valor y Smart Contracts

> **Asignatura:** Computación distribuida para la gestión de datos a gran escala
> **Módulo:** 1 — Blockchain

---

## Índice

1. [Qué es Blockchain y Por Qué Importa Aquí](#1-qué-es-blockchain-y-por-qué-importa-aquí)
2. [Cómo Interviene Blockchain en Cada Parte del Proyecto](#2-cómo-interviene-blockchain-en-cada-parte-del-proyecto)
3. [Los Smart Contracts: El Corazón de Todo](#3-los-smart-contracts-el-corazón-de-todo)
4. [Profundidad en el Contrato EAIProject](#4-profundidad-en-el-contrato-eaiproject)
5. [Posibilidades que Abren los Smart Contracts](#5-posibilidades-que-abren-los-smart-contracts)
6. [El Estándar ERC-1155: Por Qué se Eligió Este y No Otro](#6-el-estándar-erc-1155-por-qué-se-eligió-este-y-no-otro)
7. [El Valor Real que Aporta Blockchain al Proyecto](#7-el-valor-real-que-aporta-blockchain-al-proyecto)
8. [El Proyecto Sin Blockchain: Una Comparativa Exhaustiva](#8-el-proyecto-sin-blockchain-una-comparativa-exhaustiva)
9. [Desventajas y Desafíos de Usar Blockchain](#9-desventajas-y-desafíos-de-usar-blockchain)
10. [Blockchain como Infraestructura de Confianza](#10-blockchain-como-infraestructura-de-confianza)
11. [Conclusiones: El Verdadero Aporte de Blockchain](#11-conclusiones-el-verdadero-aporte-de-blockchain)

---

## 1. Qué es Blockchain y Por Qué Importa Aquí

### La Naturaleza de Blockchain

Una blockchain es, en su esencia más básica, una base de datos. Pero una base de datos con propiedades radicalmente distintas a cualquier otra que conozcamos. En una base de datos tradicional —ya sea MySQL, PostgreSQL o MongoDB— los datos viven en un servidor controlado por alguien: una empresa, una persona, una institución. Ese controlador tiene poder absoluto sobre los datos: puede modificarlos, borrarlos, mentir sobre ellos o simplemente apagar el servidor.

Una blockchain, en cambio, es una base de datos que vive simultáneamente en miles de ordenadores repartidos por todo el mundo. Para que un dato sea registrado o modificado, la mayoría de esos ordenadores deben ponerse de acuerdo en que el cambio es legítimo. Nadie por sí solo puede alterar los datos. Y una vez que algo es registrado, permanece para siempre: no se puede borrar, no se puede modificar retroactivamente, no puede desaparecer.

### Por Qué Esto Transforma los Videojuegos

Los videojuegos siempre han tenido un problema estructural de propiedad: **el jugador no posee nada**. Cuando compras una espada en World of Warcraft, no tienes ningún contrato, ningún título de propiedad, ningún registro que diga "esta espada es tuya". Tienes permiso de Blizzard para usar esa espada mientras Blizzard decida mantener el servidor. El día que el servidor cierre, la espada desaparece. El día que Blizzard decida banearte, la espada desaparece. El día que Blizzard decida que esa espada ya no existe, desaparece.

Blockchain invierte completamente esta dinámica. Un activo en blockchain es un registro en esa base de datos distribuida que dice: "Esta cantidad de este token pertenece a esta dirección". Ese registro existe independientemente de cualquier empresa o servidor. Nadie puede borrarlo. El jugador es, por primera vez en la historia de los videojuegos, el verdadero propietario de sus activos digitales.

### La Apuesta Concreta de Este Proyecto

El proyecto EAI no usa blockchain como elemento decorativo o de marketing. Lo usa como la **única fuente de verdad** del sistema. La blockchain es la respuesta definitiva a cualquier pregunta sobre el inventario:

- ¿Cuántas unidades del Token #1 tiene el Jugador A? → La blockchain responde.
- ¿Está disponible para compra el activo X del Vendedor B? → La blockchain responde.
- ¿Cuánto ETH tiene el jugador en su cartera? → La blockchain responde.

Los juegos (Game A y Game B) son simplemente ventanas que muestran lo que hay en la blockchain, con diferentes vestuarios visuales. La realidad está en la cadena.

---

## 2. Cómo Interviene Blockchain en Cada Parte del Proyecto

### En el Sistema de Inventario

El inventario de cada jugador no existe en ninguna base de datos del juego. No hay un servidor de EAI que guarde una tabla con "Jugador A tiene 5 espadas". Esa información vive en la blockchain y solo en la blockchain.

Cuando un jugador abre el juego, el frontend no consulta una API propia del proyecto: consulta directamente el nodo blockchain, preguntando al contrato cuántos tokens de cada tipo tiene esa dirección. La blockchain devuelve los números y el frontend los muestra con los colores y nombres del juego correspondiente.

Esto tiene una implicación enorme: si el proyecto EAI cerrara mañana, si los servidores del juego apagaran, si los desarrolladores desaparecieran, **los inventarios seguirían existiendo en la blockchain**. Cualquier otro juego o plataforma podría leer esos balances y mostrarlos. Los jugadores no perderían nada.

### En el Sistema de Propiedad

Cuando decimos que un jugador "tiene" un activo, en blockchain eso significa que su dirección (su cartera criptográfica) está vinculada a ese activo en el registro inmutable de la cadena. Este vínculo no lo creó el juego; lo creó una transacción blockchain firmada criptográficamente.

Cada cartera está protegida por un par de claves criptográficas: una pública (la dirección, que todos pueden ver) y una privada (que solo el jugador conoce). Para mover un activo de una cartera a otra, se necesita la firma de la clave privada del propietario. Físicamente es imposible mover los tokens de alguien sin su consentimiento criptográfico, sin importar quién seas o qué autoridad tengas.

### En el Sistema de Transacciones

Cada compra, cada venta, cada transferencia de activos es una **transacción blockchain**. No es un registro en una base de datos de una empresa: es un evento permanente e irreversible grabado en la cadena. Una vez que la transacción se confirma, no hay chargebacks, no hay cancelaciones unilaterales, no hay disputas: ocurrió y punto.

Cuando el Jugador B compra el Enchanted Bow al Jugador A, la secuencia es:
1. El Jugador B firma digitalmente una transacción con su clave privada
2. Esa transacción viaja a la red blockchain
3. Los nodos validan que la transacción es legítima (que el Jugador B tiene suficiente ETH, que el listado existe, etc.)
4. El contrato ejecuta automáticamente: transfiere tokens + transfiere ETH
5. Ese resultado queda grabado permanentemente

No hay ningún momento en que un humano revise o apruebe la transacción. No hay ninguna empresa intermediaria que pueda bloquearla. Es código ejecutándose en una máquina global sin dueño.

### En el Sistema de Pagos

El dinero del marketplace tampoco pasa por ninguna cuenta bancaria ni pasarela de pago tradicional. Los ETH van directamente de la cartera del comprador al contrato, y del contrato a la cartera del vendedor, en un único movimiento atómico. O todo ocurre correctamente o nada ocurre: no puede darse el caso de que el dinero salga del comprador pero no llegue al vendedor.

La comisión del 2,5% que retiene el contrato tampoco pasa por ninguna cuenta bancaria del equipo de EAI. Se acumula en el propio contrato, en la blockchain, y solo puede extraerse mediante una transacción firmada por el administrador. Esta transparencia es posible porque cualquier persona puede ver el saldo del contrato en cualquier momento; es información pública.

---

## 3. Los Smart Contracts: El Corazón de Todo

### Qué es Exactamente un Smart Contract

El término "smart contract" (contrato inteligente) puede ser confuso. No es inteligente en el sentido de inteligencia artificial, y es un contrato solo de manera metafórica. Un smart contract es, técnicamente, **un programa que vive y se ejecuta dentro de la blockchain**.

Pensemos en él como una máquina expendedora. La máquina tiene reglas claras: introduces el dinero, pulsas el botón correcto, y recibes el producto. La máquina no negocia, no tiene días malos, no acepta sobornos, no hace excepciones. Simplemente ejecuta sus reglas de forma mecánica y predecible. Y esas reglas son visibles para cualquiera que quiera inspeccionar la máquina.

Un smart contract funciona exactamente igual. Alguien lo programa con un conjunto de reglas, lo despliega en la blockchain, y a partir de ese momento ejecuta esas reglas automáticamente siempre que alguien interactúe con él. El programador original no puede forzarle a hacer algo que no está en el código. Nadie puede. Las reglas son las reglas.

### Las Cuatro Propiedades Fundamentales

**1. Inmutabilidad**
Una vez desplegado en la blockchain, el código de un smart contract no se puede modificar. Ni el creador, ni el administrador, ni nadie. Esto es una espada de doble filo: garantiza que las reglas no cambiarán sin aviso, pero también significa que un error en el código es permanente.

**2. Determinismo**
Dado el mismo estado inicial y los mismos inputs, un smart contract siempre producirá el mismo output. No hay comportamiento aleatorio, no hay dependencias externas no declaradas, no hay factores ocultos. Esto hace que el comportamiento del contrato sea completamente predecible y auditable.

**3. Transparencia**
El código de un smart contract verificado es público. Cualquier persona puede leerlo, analizarlo y entender exactamente qué hace antes de interactuar con él. En el proyecto EAI, cualquier usuario puede verificar que la comisión es realmente del 2,5% y no del 50%, que los tokens se transfieren correctamente, y que el administrador no tiene poderes ocultos para robar fondos.

**4. Ejecución Autónoma**
Un smart contract no necesita que nadie lo active o lo monitorice. Está "esperando" en la blockchain. Cuando alguien envía una transacción que llama a una de sus funciones, se ejecuta solo, sin intervención humana, en todos los nodos de la red simultáneamente.

### El Ciclo de Vida de un Smart Contract en Este Proyecto

**Fase 1 — Creación (Escritura del código):**
El contrato EAIProject se escribe en Solidity, el lenguaje de programación más popular para contratos en Ethereum. En esta fase existe solo como código en el ordenador del desarrollador.

**Fase 2 — Compilación:**
El código Solidity se compila a bytecode, que es el lenguaje máquina que entiende la Ethereum Virtual Machine (EVM). Hardhat hace esto automáticamente. El resultado es el código que realmente se ejecutará en la blockchain.

**Fase 3 — Despliegue:**
El bytecode compilado se envía a la blockchain mediante una transacción especial de creación de contrato. Una vez confirmada esa transacción, el contrato tiene una dirección propia en la blockchain (como una cuenta bancaria, pero para código). A partir de este momento está activo y recibiendo llamadas.

**Fase 4 — Operación:**
Los usuarios interactúan con el contrato enviando transacciones que invocan sus funciones. Cada interacción es una transacción blockchain: tiene coste en gas (la "gasolina" de Ethereum), queda registrada permanentemente, y su resultado modifica el estado del contrato.

**Fase 5 — ¿Fin?**
A diferencia de un servidor web, un smart contract no se "apaga". Sigue existiendo en la blockchain para siempre. Incluso si el equipo de EAI decide abandonar el proyecto, el contrato seguirá respondiendo consultas y procesando transacciones. Solo puede "desactivarse" si el propio código tiene una función de autodestrucción (que en este proyecto no existe, deliberadamente).

---

## 4. Profundidad en el Contrato EAIProject

### La Arquitectura de Herencia: Construir sobre Hombros de Gigantes

El contrato EAIProject no parte de cero. Hereda de cuatro contratos base de la librería OpenZeppelin, una de las colecciones de contratos más auditadas y utilizadas del ecosistema Ethereum. Esta herencia no es solo reutilización de código: es una declaración de que el contrato EAIProject respeta los estándares establecidos y se beneficia de años de auditorías de seguridad.

```
EAIProject
├── ERC1155          → Define qué es un token multi-tipo y cómo se transfiere
├── ERC1155Supply    → Añade seguimiento de cuántos tokens existen en total
├── AccessControl    → Añade el sistema de roles y permisos
└── ReentrancyGuard → Añade protección contra el ataque de reentrada
```

Cada uno de estos componentes aporta una capa de funcionalidad probada. El desarrollador solo necesitó añadir la lógica específica del marketplace y la gestión de metadatos.

### El Estado del Contrato: Qué Guarda en la Blockchain

El contrato mantiene varios tipos de información persistente en la blockchain. Esta información vive en la cadena para siempre y cambia con cada transacción que interactúa con el contrato.

**El Registro de Propietarios (heredado de ERC-1155):**
Un mapeo que conecta cada dirección con sus balances de cada tipo de token. Es el inventario principal del sistema. Cuando un jugador compra un activo, este registro se actualiza. Cuando vende, también. Esta información es la fuente de verdad para todos los juegos del ecosistema.

**Los URIs de Metadatos:**
Por cada tipo de token que existe, el contrato guarda una referencia (una URL) al archivo JSON que describe ese token. Esta referencia es lo que los frontends usan para saber cómo llamar al activo y qué estadísticas tiene. En producción apuntaría a IPFS; en desarrollo local apunta al servidor HTTP del puerto 3333.

**El Registro del Marketplace (Listings):**
Por cada vendedor y por cada tipo de token, el contrato guarda si hay un listado activo, cuántas unidades están a la venta y a qué precio. Este es el mercado global que todos los jugadores ven, independientemente del juego que usen.

**Las Comisiones Acumuladas:**
Un contador que va sumando la comisión del 2,5% de cada venta. Solo el administrador puede vaciarlo. Este dato es perfectamente auditado: cualquiera puede ver cuánto ha acumulado el contrato y cuánto ha retirado el administrador.

**El Índice de Listados Activos:**
Una lista de todos los pares vendedor-token que tienen o han tenido un listado. Se usa para poder devolver todos los listados activos de una sola consulta, ya que la blockchain no tiene capacidad de búsqueda como una base de datos relacional.

### Las Funciones del Contrato: Cada Acción Posible

El contrato define qué acciones están permitidas en el sistema. No existe ninguna acción que no esté explícitamente programada. Si una acción no está en el contrato, es imposible ejecutarla.

**Acuñar Tokens (Mint / MintBatch)**
Esta función crea tokens de la nada y los asigna a una dirección. Es el equivalente a "imprimir" dinero, pero controlado: solo quien tiene el rol de Acuñador puede invocarla. En el proyecto, el script de despliegue usa esta función para crear el inventario inicial de los jugadores. En un sistema de producción, esta función se usaría cuando un jugador compra un activo por primera vez o cuando el equipo lanza nuevos objetos al juego.

La versión batch (lote) permite acuñar varios tipos de tokens en una sola transacción, lo que ahorra costes de gas cuando hay que crear inventarios completos.

**Consultar URI (Uri)**
Una función de solo lectura que devuelve la URL de los metadatos de un token dado. Los frontends la usan para saber dónde descargar la descripción del activo. Es una función pública que cualquiera puede llamar sin coste (las funciones de solo lectura no consumen gas).

**Poner a la Venta (ListForSale)**
Cuando un jugador quiere vender, invoca esta función indicando qué token, cuántas unidades y a qué precio. El contrato verifica que el jugador tiene suficiente balance y que ha dado permiso al contrato para mover sus tokens. Si todo es correcto, registra el listado y emite un evento que los frontends detectarán para actualizar su UI en tiempo real.

Nótese que los tokens no se transfieren al contrato en este momento. El vendedor sigue teniendo sus tokens. Solo hay un registro de intención de venta. Esto es importante porque el vendedor puede seguir usando sus activos en los juegos mientras estén listados.

**Cancelar Listado (CancelListing)**
Permite al vendedor retirar su oferta. Solo puede cancelar sus propios listados. Una vez cancelado, el registro queda inactivo y los compradores ya no pueden comprar esas unidades.

**Comprar (BuyItem)**
Esta es la función más compleja y crítica. Cuando un comprador la invoca, debe enviar exactamente el dinero correspondiente al precio. El contrato entonces ejecuta en un solo paso atómico:
- Verifica que el listado está activo
- Verifica que hay suficientes unidades
- Verifica que el dinero enviado es exactamente el correcto
- Transfiere los tokens del vendedor al comprador
- Calcula y retiene la comisión
- Envía el dinero (menos comisión) al vendedor
- Actualiza el listado

Si cualquier verificación falla, toda la operación se revierte como si nunca hubiera pasado. No puede quedar el sistema en un estado donde el dinero haya salido pero los tokens no hayan llegado.

**Ver Todos los Listados (GetAllActiveListings)**
Una función de consulta que devuelve todos los listados activos del marketplace. Los frontends la llaman al arrancar y cada vez que reciben un evento de nueva venta o compra. Es pública y gratuita (sin gas).

**Retirar Comisiones (WithdrawFees)**
Solo el administrador puede invocarla. Transfiere el total de comisiones acumuladas a la dirección que el administrador indique. Está protegida contra ataques de reentrada.

**Cambiar Comisión (SetMarketFee)**
El administrador puede ajustar el porcentaje de comisión, pero hay un límite máximo del 10% codificado que nunca puede superarse. Esto protege a los usuarios: aunque el administrador quiera abusar, el propio contrato le impone un techo.

### Los Eventos: La Forma en que Blockchain Habla con el Mundo

Los eventos son uno de los mecanismos más importantes y elegantes de los smart contracts. Son mensajes que el contrato emite cuando ocurre algo relevante. Estos mensajes quedan grabados en la blockchain (en los logs de las transacciones) y los sistemas externos pueden suscribirse a ellos para reaccionar en tiempo real.

En el proyecto EAI, los frontends están suscritos a todos los eventos del contrato. Cuando el contrato emite un evento de "nuevo listado", todos los jugadores conectados ven aparecer automáticamente el nuevo artículo en el marketplace, sin necesidad de recargar la página. Cuando se emite un evento de "venta completada", el inventario del comprador se actualiza al instante.

Los eventos del contrato son:

- **TokenMinted:** Se acuña un nuevo token. Los frontends podrían usarlo para notificar a los jugadores que han recibido nuevos activos.
- **ItemListed:** Alguien pone algo a la venta. Todos los frontends actualizan el marketplace.
- **ItemSold:** Se completa una compra. El comprador actualiza su inventario y el vendedor ve su saldo incrementado.
- **ListingCancelled:** Se retira una oferta del mercado. El marketplace se actualiza para reflejar que ese artículo ya no está disponible.
- **FeesWithdrawn:** El administrador retira comisiones. Queda registrado permanentemente cuándo y cuánto se retiró, con total transparencia.

Esta arquitectura de eventos hace que el sistema sea **reactivo**: los juegos no necesitan preguntar constantemente al contrato "¿hay algo nuevo?" (polling). El contrato les avisa cuando hay novedades. Es más eficiente, más rápido y produce una experiencia de usuario más fluida.

---

## 5. Posibilidades que Abren los Smart Contracts

El contrato EAIProject implementa un conjunto concreto de funcionalidades, pero los smart contracts como tecnología abren un abanico de posibilidades mucho más amplio. Entender estas posibilidades ayuda a apreciar por qué el proyecto está construido sobre esta base y qué podría escalar.

### Posibilidad 1: Contratos que Interactúan con Contratos

Un smart contract puede llamar a funciones de otros smart contracts. Esto permite construir ecosistemas de contratos que se complementan entre sí, sin que ningún humano intermedie. En el contexto de EAI, esto significaría que:

- Un **contrato de torneos** podría verificar automáticamente en el contrato EAIProject si el jugador tiene el activo requerido para participar.
- Un **contrato de crafting** podría quemar (destruir) ciertos tokens del jugador en EAIProject y crear automáticamente un token nuevo más poderoso.
- Un **contrato de staking** podría "bloquear" temporalmente los activos del jugador a cambio de recompensas, todo sin intervención humana.
- Un **contrato de gobernanza** podría permitir que los jugadores voten sobre cambios en las reglas del marketplace.

### Posibilidad 2: Contratos Actualizables

Aunque los contratos son inmutables por defecto, existen patrones de diseño que permiten cierta actualización controlada. El patrón Proxy, por ejemplo, separa el almacenamiento de datos de la lógica de negocio. Los datos viven en un contrato permanente, pero la lógica puede actualizarse apuntando a una nueva implementación. Esto permite corregir errores o añadir funcionalidades sin perder el historial de datos.

### Posibilidad 3: Oráculos — Conectar Blockchain con el Mundo Real

Los smart contracts son deterministas y no pueden acceder a información externa por sí mismos. Los oráculos son servicios que inyectan datos del mundo real en la blockchain de forma verificable. En el contexto de EAI:

- Un oráculo podría alimentar el contrato con el precio actual del ETH en euros, permitiendo que los listados se expresen en euros aunque se paguen en ETH.
- Un oráculo de aleatoriedad verificable (como Chainlink VRF) podría usarse para que el contrato genere drops de activos aleatorios de forma justa e imparciable, sin que nadie pueda predecir ni manipular qué activo recibirán los jugadores.
- Un oráculo de datos de juego podría informar al contrato de los resultados de partidas, permitiendo que el propio contrato recompense a los ganadores con tokens.

### Posibilidad 4: DAOs — Gobernanza Descentralizada

Una DAO (Organización Autónoma Descentralizada) es una organización cuyas reglas están codificadas en smart contracts. Los miembros toman decisiones votando con sus tokens, y los resultados de las votaciones se ejecutan automáticamente. En el proyecto EAI, podría existir una DAO donde los jugadores con activos Legendary tuvieran derecho a votar sobre:

- El porcentaje de comisión del marketplace.
- Qué nuevos activos se añaden al ecosistema.
- Qué nuevos juegos pueden integrarse al ecosistema.
- Cómo se usan las comisiones acumuladas (¿desarrollo del juego? ¿recompensas para jugadores? ¿quemado de tokens?).

### Posibilidad 5: Tokens con Comportamiento Dinámico

Los activos de EAI tienen atributos inmutables, pero nada impide que un contrato más sofisticado implemente activos que evolucionen. Un contrato podría:

- Incrementar el "poder" de un activo después de cierto número de batallas ganadas.
- "Desgastar" la durabilidad de un activo con el uso y requerir que se "repare" pagando ETH.
- Fusionar dos activos de la misma categoría para crear uno más poderoso.
- "Evolucionar" un activo Common a Rare si se cumplen ciertas condiciones.

### Posibilidad 6: Mercados Más Sofisticados

El marketplace actual del proyecto es simple: precio fijo por unidad. Los smart contracts permiten mecanismos de mercado más complejos:

- **Subastas:** El precio sube con cada puja; quien más ofrezca en el tiempo límite se lleva el activo.
- **Subastas a la baja (Dutch auction):** El precio empieza alto y baja progresivamente hasta que alguien compra.
- **Ofertas de compra (Buy orders):** Un comprador puede depositar ETH indicando que quiere comprar X unidades del Token #Y a precio Z. Si aparece un vendedor dispuesto, el contrato ejecuta la operación automáticamente.
- **Bundling:** Vender múltiples activos distintos como un pack a precio conjunto.

### Posibilidad 7: Economías Cross-Chain

Con tecnología de bridges (puentes), los tokens de EAI podrían existir en múltiples blockchains. Un jugador podría tener sus activos en Polygon pero un juego en Ethereum podría leerlos. Las soluciones de interoperabilidad entre cadenas están madurado rápidamente y son la siguiente frontera de la interoperabilidad blockchain.

### Posibilidad 8: NFTs Dinámicos con Metadatos On-Chain

Los metadatos del proyecto están almacenados off-chain (en IPFS o en el servidor local). Una versión más avanzada podría almacenar parte de los metadatos directamente en el contrato, permitiendo que el contrato los modifique. Por ejemplo, el contrato podría actualizar el URI de los metadatos de un token cuando sus atributos cambian, garantizando que los metadatos siempre reflejan el estado actual del activo en la blockchain.

---

## 6. El Estándar ERC-1155: Por Qué se Eligió Este y No Otro

Para entender por qué ERC-1155 es la elección correcta para este proyecto, hay que entender el panorama de estándares de tokens en Ethereum y qué ofrece cada uno.

### ERC-20: El Token Fungible

ERC-20 fue el primer estándar de tokens en Ethereum y sigue siendo el más usado. Un token ERC-20 es perfectamente fungible: cada unidad es idéntica a las demás, como el dinero. Si tienes 10 ETH, da igual cuáles 10 ETH exactos tienes porque todos valen lo mismo.

Para un juego, ERC-20 podría usarse como moneda in-game (una "moneda de oro" del juego), pero no sirve para representar activos únicos o semi-únicos porque no distingue entre diferentes tipos de ítems.

**Por qué no se usó en EAI:** Un juego necesita distinguir entre diferentes tipos de activos (una espada, un escudo, una poción), lo cual ERC-20 no puede hacer por sí solo.

### ERC-721: El Token No Fungible (NFT)

ERC-721 introdujo los NFTs tal como los conocemos popularmente. Cada token ERC-721 es completamente único y tiene un ID propio que lo distingue de todos los demás. El token #1 y el token #2 son objetos completamente distintos aunque sean del mismo contrato.

Esto es ideal para coleccionables donde cada pieza es única (arte digital, certificados de propiedad inmobiliaria), pero tiene un problema grave para los videojuegos: si un jugador tiene 1.000 pociones de curación, necesitarías 1.000 tokens ERC-721 distintos, uno por cada poción. Las transacciones serían enormemente costosas y engorrosas.

**Por qué no se usó en EAI:** Los activos del juego son semi-fungibles. Todos los Token #1 (Plasma Rifle / Enchanted Bow) son idénticos entre sí, y tiene sentido que un jugador pueda tener 10 unidades. ERC-721 no maneja esto eficientemente.

### ERC-1155: El Mejor de Ambos Mundos

ERC-1155 fue diseñado específicamente para superar las limitaciones de ERC-20 y ERC-721. En un único contrato ERC-1155 pueden coexistir:

- **Tokens fungibles** (como monedas, donde todas las unidades son iguales)
- **Tokens semi-fungibles** (como los activos de EAI: múltiples unidades del mismo tipo, pero tipos distintos entre sí)
- **Tokens no fungibles** (únicos, donde existe exactamente 1 unidad)

El inventario de un jugador en EAI es exactamente esto: tiene 10 unidades del Token #1, 5 unidades del Token #4, y 1 unidad del Token #6. ERC-1155 gestiona todo esto en un único contrato con una única consulta.

**Ventajas adicionales de ERC-1155:**

**Transferencias en lote:** Se pueden transferir múltiples tipos de tokens en una sola transacción. Si un jugador quiere intercambiar 3 espadas y 2 escudos de una vez, es una sola transacción. Con ERC-721 serían 5 transacciones separadas, cinco veces más caro.

**Menor coste de despliegue:** Un solo contrato gestiona todos los tipos de activos. Con ERC-721 puro, cada tipo de activo podría requerir su propio contrato.

**Supply tracking con ERC1155Supply:** La extensión usada en el proyecto añade la capacidad de saber cuántos tokens de cada tipo existen en total. Esto es útil para crear activos con suministro limitado (por ejemplo, que solo existan 100 unidades del Token Legendary #6 en todo el ecosistema).

---

## 7. El Valor Real que Aporta Blockchain al Proyecto

Más allá de los aspectos técnicos, ¿qué valor concreto aporta blockchain a este proyecto que no podría obtenerse de otra manera?

### Valor 1: Propiedad Real y Soberanía del Usuario

Este es el valor fundamental y el que justifica toda la arquitectura. Los jugadores son los verdaderos dueños de sus activos. No es una promesa del desarrollador; está garantizado por matemáticas criptográficas y por la naturaleza distribuida de la blockchain. EAI no puede confiscar los tokens de un jugador. No puede hacerlo aunque quisiera. El contrato no tiene esa función programada.

Esto representa un cambio de paradigma en la relación entre jugadores y desarrolladores. En el modelo tradicional, el desarrollador es el señor feudal y el jugador es el vasallo: usa las tierras (el juego) por permiso del señor y puede ser expulsado en cualquier momento. En el modelo blockchain, los activos del jugador son suyos con la misma firmeza que un título de propiedad registrado en el catastro.

### Valor 2: Interoperabilidad Garantizada Técnicamente

La interoperabilidad entre juegos en el proyecto EAI no depende de que los desarrolladores de los juegos lleguen a acuerdos comerciales o firmen contratos entre sí. Está garantizada por el propio estándar técnico: cualquier aplicación que implemente el protocolo de lectura de contratos ERC-1155 puede leer los inventarios de los jugadores.

Esto abre la puerta a un ecosistema verdaderamente abierto: un desarrollador independiente podría crear un tercer juego (Game C) que use los mismos activos de EAI sin necesitar permiso del equipo original. Solo necesita conocer la dirección del contrato y el formato de los metadatos.

### Valor 3: Mercado Secundario Sin Intermediarios

El marketplace de EAI permite que los jugadores comercien entre sí directamente. No hay una empresa que gestione las transacciones, que cobre comisiones abusivas o que pueda prohibir ciertos tipos de intercambios. El código es el único árbitro.

Esto también significa que los activos tienen valor de mercado real: pueden comprarse y venderse por ETH real (en producción) cuyo precio fluctúa según oferta y demanda. Los jugadores pueden convertir sus logros en el juego en valor económico real.

### Valor 4: Historial Inmutable y Auditable

Cada transacción, cada transferencia, cada compra, cada mint queda grabada permanentemente en la blockchain. Esto crea un historial completo y verificable de la vida de cada activo:

- ¿Cuándo fue creado este token?
- ¿Quién fue su primer propietario?
- ¿Cuántas veces ha cambiado de manos?
- ¿Cuál fue el precio de cada transacción?

Este historial tiene valor en sí mismo. Un activo que ha tenido muchos propietarios y ha circulado activamente puede considerarse más "legítimo" o "raro" que uno recién creado. En juegos competitivos, el historial de un arma podría ser parte de su lore.

### Valor 5: Resistencia a la Censura y a la Quiebra

Si el equipo de EAI decide abandonar el proyecto, si la empresa quiebra, si hay un desacuerdo entre los desarrolladores: ninguno de estos eventos puede borrar los activos de los jugadores. El contrato sigue funcionando en la blockchain independientemente de lo que pase con las personas que lo crearon.

Esto es especialmente relevante en el mundo de los videojuegos, donde el cierre de servidores ha destruido colecciones de objetos que los jugadores habían invertido años en construir. Con blockchain, eso no puede ocurrir.

### Valor 6: Transparencia de las Reglas del Juego

Las reglas económicas del sistema (comisiones, límites, permisos) están en el código del contrato, que es público y verificable. Los jugadores no tienen que confiar en que el desarrollador honrará sus promesas: pueden leer el código y saber con certeza qué puede y qué no puede hacer el sistema.

---

## 8. El Proyecto Sin Blockchain: Una Comparativa Exhaustiva

Para entender el verdadero valor de blockchain en este proyecto, el ejercicio más clarificador es imaginar cómo sería el sistema si se hubiera construido con tecnología tradicional.

### Arquitectura Alternativa Clásica

Sin blockchain, el proyecto tendría esta arquitectura:

```
                    [Servidor Central]
                    Base de datos SQL
                    ┌─────────────────┐
                    │  usuarios       │
                    │  inventarios    │
                    │  transacciones  │
                    │  marketplace    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         [Game A API]   [Game B API]   [Admin Panel]
              │              │
         Game A Web      Game B Web
```

El servidor central sería el único punto de verdad. Sería una base de datos MySQL o PostgreSQL con tablas de usuarios, inventarios, transacciones y listados de venta. Una API REST serviría los datos a los frontends.

### Diferencia 1: Propiedad — Ilusión vs. Realidad

**Con arquitectura tradicional:**
El jugador tiene activos en la base de datos del servidor. El desarrollador puede:
- Borrar su cuenta y perderá todos sus activos.
- Modificar sus inventarios directamente en la base de datos.
- Cerrar el servidor y todos los activos desaparecen.
- Cambiar las reglas del marketplace en cualquier momento sin previo aviso.
- Bloquear ciertas transacciones o cuentas por cualquier razón.

El jugador no posee sus activos; tiene permiso de usarlos.

**Con blockchain:**
El jugador posee sus activos criptográficamente. Nadie puede borrarlos, modificarlos ni confiscarlos. Las reglas del sistema están en el código del contrato y no pueden cambiarse unilateralmente.

**Impacto real:** En el modelo tradicional, la propiedad es una promesa. En blockchain, es una garantía matemática.

### Diferencia 2: Interoperabilidad — Acuerdo Comercial vs. Estándar Técnico

**Con arquitectura tradicional:**
Para que Game A y Game B compartan inventarios, ambos juegos tendrían que conectarse a la misma base de datos central o a una API que los interconecte. Para que un tercer juego (Game C, creado por otra empresa) acceda a los mismos activos, necesitaría un acuerdo comercial con el equipo de EAI, acceso a su API, y dependería de que EAI mantuviera ese acceso funcionando.

La interoperabilidad sería artificial y frágil: si EAI decide revocar el acceso a Game C, los activos dejan de ser interoperables. Si EAI sube sus precios de API, Game C tiene que pagar o desconectarse.

**Con blockchain:**
La interoperabilidad está garantizada por el estándar técnico ERC-1155. Cualquiera puede leer los balances del contrato. Game C solo necesita conocer la dirección del contrato; no necesita permiso de nadie. No puede revocarse su acceso porque el contrato es público y siempre estará disponible.

**Impacto real:** En el modelo tradicional, la interoperabilidad es un servicio que se compra y se puede revocar. En blockchain, es una propiedad inherente del sistema.

### Diferencia 3: El Marketplace — Plataforma de Pago vs. Protocolo Abierto

**Con arquitectura tradicional:**
El marketplace requeriría una infraestructura compleja:
- Una pasarela de pago (Stripe, PayPal) para procesar pagos reales.
- Cumplimiento de regulaciones financieras de cada país.
- Sistemas anti-fraude.
- Gestión de disputas y chargebacks.
- Una cuenta bancaria para retener y distribuir fondos.
- Tasas de transacción de las pasarelas de pago (2-3% + tarifas fijas).
- Posibilidad de que PayPal/Stripe bloquee la cuenta del proyecto.

Y fundamentalmente: los jugadores no podrían comerciar con dinero real de forma directa. Tendrían que usar moneda del juego, que no tiene valor fuera del juego.

**Con blockchain:**
El marketplace es simplemente código en el contrato. No hay pasarela de pago, no hay intermediarios financieros, no hay cuentas bancarias. Los ETH van directamente de comprador a vendedor. El contrato toma su 2,5% automáticamente. Los activos tienen valor económico real porque se intercambian por ETH real.

**Impacto real:** En el modelo tradicional, el comercio real entre jugadores es complicado, regulado y depende de terceros. En blockchain, es nativo, automático y sin intermediarios.

### Diferencia 4: Transparencia — Opacidad vs. Verificabilidad

**Con arquitectura tradicional:**
Los jugadores deben confiar en que el desarrollador:
- No manipula el random de los drops de activos.
- No da ventajas ocultas a ciertos jugadores.
- No se queda con más comisión de la anunciada.
- No vende datos de los jugadores.
- Tiene realmente la cantidad de activos que dice tener en circulación.

No hay forma de verificar nada de esto. El servidor es una caja negra. Solo tienes la palabra del desarrollador.

**Con blockchain:**
Cualquier persona puede:
- Leer el código del contrato y verificar exactamente cómo funciona.
- Ver todas las transacciones que han ocurrido.
- Verificar cuántos tokens de cada tipo existen.
- Comprobar cuántas comisiones ha retirado el administrador y cuándo.
- Confirmar que ninguna cuenta tiene ventajas especiales no anunciadas.

La blockchain es una caja de cristal. Todo es público y verificable.

**Impacto real:** En el modelo tradicional, la confianza es la moneda que paga el jugador. En blockchain, la confianza no es necesaria porque la verificación es posible.

### Diferencia 5: Resistencia — Punto Único de Fallo vs. Resiliencia

**Con arquitectura tradicional:**
El sistema tiene múltiples puntos únicos de fallo:
- Si el servidor central cae, todos los juegos quedan inoperativos.
- Si hay un ataque DDoS, el sistema se cae.
- Si la empresa quiebra, el servidor se apaga y los activos desaparecen.
- Si el desarrollador borra la base de datos accidentalmente, todo se pierde.
- Si hay un hackeo al servidor, todos los datos pueden comprometerse.

**Con blockchain:**
El contrato vive en miles de nodos simultáneamente. Para que deje de funcionar, habría que apagar más del 51% de los nodos de Ethereum simultáneamente, lo que es prácticamente imposible. Si los juegos (los frontends) se caen, los activos siguen en la blockchain. Cualquiera puede crear un nuevo frontend que los use.

**Impacto real:** El modelo tradicional tiene fragilidad de punto único. El modelo blockchain tiene resiliencia distribuida.

### Diferencia 6: Costes de Desarrollo y Operación

Esta es la única área donde la arquitectura tradicional tiene ventaja clara.

**Con arquitectura tradicional:**
- Sin costes de gas por transacción para los usuarios.
- Sin necesidad de aprender tecnologías blockchain.
- Mayor velocidad de desarrollo inicial.
- Más fácil de corregir errores post-lanzamiento.
- Menores barreras de entrada para los usuarios (no necesitan cartera).

**Con blockchain:**
- Cada transacción tiene un coste en gas que paga el usuario.
- La curva de aprendizaje de Solidity y blockchain es empinada.
- Los errores en el contrato son permanentes e irrevocables.
- Los usuarios necesitan aprender a usar wallets.
- El desarrollo inicial es más complejo y costoso.

**Impacto real:** Blockchain añade complejidad técnica y económica. La pregunta es si los valores que aporta justifican ese coste. Para activos de valor real, sí. Para activos puramente decorativos, puede no ser necesario.

---

## 9. Desventajas y Desafíos de Usar Blockchain

Un análisis honesto requiere reconocer las limitaciones reales de blockchain en este contexto.

### Coste de Transacciones (Gas)

Cada interacción con el contrato que modifica el estado (listar, comprar, acuñar) consume gas. El gas es el coste computacional de ejecutar código en la EVM, pagado en ETH. En momentos de alta demanda de la red Ethereum, estos costes pueden ser prohibitivos.

El proyecto usa Polygon Amoy, una red de capa 2 diseñada para reducir estos costes drásticamente. Polygon ejecuta transacciones off-chain y las agrupa para anclarlas a Ethereum, reduciendo el coste por transacción en uno o dos órdenes de magnitud. Pero incluso así, hay un coste que en la arquitectura tradicional no existiría.

### Irreversibilidad

Un error en el contrato o una transacción errónea no se puede deshacer. Si un usuario envía tokens a la dirección incorrecta, se pierden. Si hay un bug en el contrato de compra, podría costar dinero real. Esta característica que da seguridad (nadie puede revertir transacciones maliciosamente) también elimina la red de seguridad del "deshaz el último cambio".

El proyecto mitiga esto con una suite de tests exhaustiva, pero la realidad es que el coste de un error en blockchain es mucho mayor que en software tradicional.

### Velocidad

Las transacciones blockchain, incluso en redes rápidas como Polygon, toman varios segundos en confirmarse. En un videojuego donde la latencia importa (acción en tiempo real, para multijugador competitivo), esto es inaceptable. EAI, al ser un juego de gestión de inventario sin combate en tiempo real, puede convivir con esta latencia. Pero es una limitación fundamental que excluye ciertos géneros de videojuego.

### Experiencia de Usuario

El modelo de wallet (cartera criptográfica) es todavía intimidante para usuarios no técnicos. Manejar claves privadas, entender qué es el gas, aprobar transacciones en MetaMask... todo esto añade fricción que el software tradicional no tiene. El proyecto resuelve esto en el entorno de pruebas usando claves hardcodeadas (sin MetaMask), pero en producción real, la barrera de entrada para nuevos jugadores es significativa.

### Escalabilidad

Aunque Polygon mejora mucho la escalabilidad respecto a Ethereum mainnet, una blockchain sigue teniendo límites de throughput (transacciones por segundo). Un juego masivo con millones de usuarios activos requeriría soluciones de escalabilidad adicionales que añaden complejidad arquitectural.

### El Problema del Oráculo

El contrato EAIProject es un sistema cerrado: solo sabe lo que ocurre en la blockchain. No puede verificar si un jugador realmente completó un nivel, si ganó una partida, o si cumplió cualquier condición externa. Para conectar eventos del mundo real (o del juego off-chain) con el contrato, se necesitan oráculos, que introducen complejidad y potencialmente nuevos puntos de confianza.

---

## 10. Blockchain como Infraestructura de Confianza

### El Cambio de Paradigma Fundamental

La forma más precisa de entender qué aporta blockchain es esta: **blockchain es una infraestructura de confianza**.

En el mundo digital tradicional, la confianza siempre recae en una institución: el banco, la empresa de videojuegos, la plataforma de comercio electrónico. Estas instituciones son necesarias porque sin ellas no hay forma de verificar que las reglas se están cumpliendo, que los registros son correctos, y que nadie está haciendo trampas.

Blockchain reemplaza la confianza en instituciones con confianza en matemáticas y en la descentralización. No necesitas confiar en que EAI es una empresa honesta que no manipulará tu inventario, porque las reglas están en el código público y la ejecución es automática. Las matemáticas criptográficas garantizan la autenticidad de cada transacción. La descentralización garantiza que nadie puede controlar unilateralmente el sistema.

### La Triada: Sin Permiso, Sin Confianza, Sin Custodia

**Sin permiso (Permissionless):** Cualquiera puede interactuar con el contrato. No hay KYC, no hay cuenta que crear, no hay términos de servicio que aceptar. Solo necesitas una dirección blockchain.

**Sin confianza (Trustless):** No necesitas confiar en el desarrollador, en la empresa, ni en ningún tercero. Las reglas son matemáticas. El resultado de cualquier interacción es predecible con certeza.

**Sin custodia (Non-custodial):** El proyecto nunca tiene custodia de los activos de los jugadores. Los tokens están siempre bajo el control criptográfico del jugador. El contrato es un intermediario de reglas, no un custodio de activos.

### La Relevancia Académica: Computación Distribuida Aplicada

Desde la perspectiva académica de este máster, el proyecto EAI es una implementación práctica de varios principios de computación distribuida:

**Consenso distribuido:** La validez de cada transacción no la decide un servidor central, sino miles de nodos que ejecutan el mismo algoritmo de consenso (Proof of Stake en Polygon) y llegan al mismo resultado.

**Replicación de estado:** El estado del contrato (inventarios, listings, comisiones) está replicado en todos los nodos de la red. No hay un nodo "maestro"; todos tienen la misma copia del estado.

**Tolerancia a fallos:** El sistema sigue funcionando aunque fallen miles de nodos, porque siempre hay suficientes nodos funcionando para mantener el consenso.

**Inmutabilidad del log:** La blockchain es esencialmente un log distribuido e inmutable de transacciones, un concepto fundamental en sistemas distribuidos.

**Ejecución determinista:** Dado el mismo estado y los mismos inputs, todos los nodos calculan el mismo resultado. Esto es lo que permite el consenso: todos llegan a la misma respuesta.

El proyecto EAI utiliza estas propiedades no como un ejercicio teórico sino como la base de un sistema real con valor económico: los activos se intercambian por ETH real, las reglas se ejecutan sin intermediarios, y la confianza está delegada a la matemática criptográfica.

---

## 11. Conclusiones: El Verdadero Aporte de Blockchain

### Lo que Blockchain hace por EAI que Ninguna Otra Tecnología Puede Hacer

Habiendo analizado en profundidad todos los aspectos, podemos formular con precisión qué aporta blockchain que ninguna tecnología alternativa podría proporcionar de manera equivalente:

**1. Propiedad soberana verificable.** No es posible crear propiedad digital real sin blockchain. Cualquier sistema centralizado requiere confiar en la honestidad del operador central. Blockchain hace que la confianza sea innecesaria reemplazándola con verificabilidad matemática.

**2. Interoperabilidad sin acuerdos.** La interoperabilidad entre juegos que no tienen ningún acuerdo comercial entre sí es imposible en el modelo centralizado. En blockchain, cualquier aplicación puede leer y escribir en el contrato siguiendo el estándar público, sin pedir permiso a nadie.

**3. Mercado peer-to-peer de activos con valor real.** Un mercado donde el valor transferido es real (ETH), donde no hay intermediarios, y donde las reglas no pueden cambiarse unilateralmente no es posible sin blockchain.

**4. Persistencia independiente del creador.** Un sistema cuya existencia no depende de que el creador lo mantenga activo no es posible sin blockchain. Un contrato desplegado existe para siempre, independientemente de lo que hagan los desarrolladores.

### La Reflexión Final

El proyecto EAI no usa blockchain porque es tendencia o porque suena interesante. Lo usa porque el problema que resuelve —inventarios de activos digitales que pertenecen realmente al jugador y son interoperables entre juegos— solo puede resolverse correctamente con blockchain.

Un sistema de inventarios tradicional puede replicar la apariencia de interoperabilidad, pero no puede garantizar la propiedad real, la resistencia a la censura, la transparencia de las reglas, ni la independencia del creador. Estas propiedades no son características que se añaden a un sistema; son consecuencias inevitables de la arquitectura blockchain.

En ese sentido, EAI no es un juego con blockchain añadido como decoración. Es un sistema de propiedad digital construido sobre la única infraestructura que puede garantizar esa propiedad, que resulta tener también dos interfaces de juego. La diferencia puede parecer sutil, pero es fundamental: blockchain no es la herramienta que se usó para construir el juego; es el fundamento sobre el que el concepto mismo del juego tiene sentido.

---

*Informe elaborado para el Módulo 1 de Blockchain — Computación distribuida para la gestión de datos a gran escala*
