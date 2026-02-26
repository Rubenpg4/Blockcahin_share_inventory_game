# NFTs en el Proyecto EAI
## ¿Hay NFTs? La Respuesta Honesta y Completa

> **Asignatura:** Computación distribuida para la gestión de datos a gran escala
> **Módulo:** 1 — Blockchain

---

## Índice

1. [La Respuesta Directa](#1-la-respuesta-directa)
2. [Qué es Realmente un NFT](#2-qué-es-realmente-un-nft)
3. [Qué Usa el Proyecto: Tokens Semi-Fungibles ERC-1155](#3-qué-usa-el-proyecto-tokens-semi-fungibles-erc-1155)
4. [La Diferencia Fundamental Explicada con Ejemplos](#4-la-diferencia-fundamental-explicada-con-ejemplos)
5. [Por Qué los Tokens de EAI NO Son NFTs](#5-por-qué-los-tokens-de-eai-no-son-nfts)
6. [Qué SÍ Comparten con los NFTs](#6-qué-sí-comparten-con-los-nfts)
7. [Por Qué se Eligió Este Enfoque en Lugar de NFTs](#7-por-qué-se-eligió-este-enfoque-en-lugar-de-nfts)
8. [Los Tres Estándares: ERC-20, ERC-721 y ERC-1155](#8-los-tres-estándares-erc-20-erc-721-y-erc-1155)
9. [Cómo Serían los NFTs en Este Proyecto](#9-cómo-serían-los-nfts-en-este-proyecto)
10. [Conclusión: Semi-Fungibles, el Punto Medio Perfecto](#10-conclusión-semi-fungibles-el-punto-medio-perfecto)

---

## 1. La Respuesta Directa

**No. El proyecto EAI no contiene NFTs.**

Ni uno solo. En ninguna parte del contrato, en ningún script, en ninguna parte de los frontends se crean, transfieren ni gestionan tokens no fungibles en el sentido técnico correcto del término.

Lo que el proyecto SÍ tiene son **tokens semi-fungibles ERC-1155**, que superficialmente se parecen a los NFTs y comparten algunos de sus conceptos, pero son una categoría distinta con un comportamiento fundamentalmente diferente.

Esta distinción no es un detalle técnico menor: es la diferencia entre una obra de arte única e irrepetible y una tirada de producción de cien copias numeradas del mismo cuadro. Parecen lo mismo a simple vista, pero su naturaleza económica y funcional es completamente diferente.

---

## 2. Qué es Realmente un NFT

### La Definición Técnica

NFT son las siglas de **Non-Fungible Token**, que en español significa Token No Fungible. Para entender qué significa "no fungible" hay que entender primero qué significa "fungible".

Un bien **fungible** es aquel donde cada unidad es idéntica e intercambiable con cualquier otra unidad del mismo tipo. Un euro es fungible: tu euro y mi euro valen exactamente lo mismo y pueden intercambiarse sin que nadie pierda o gane nada. Un litro de gasolina del mismo octanaje es fungible. Una acción de una empresa en bolsa es fungible.

Un bien **no fungible** es aquel donde cada unidad es única e irrepetible. Una pintura original de Velázquez no es fungible: no hay otra igual en el mundo. El asiento 14B de un vuelo concreto no es fungible: es ese asiento específico en ese vuelo específico.

Un NFT lleva este concepto al mundo digital: es un token en blockchain donde **existe exactamente una unidad** y esa unidad tiene una identidad única e irrepetible que la distingue de cualquier otro token en toda la blockchain.

### El Estándar Técnico: ERC-721

Los NFTs en el ecosistema Ethereum utilizan el estándar **ERC-721**, definido en 2018. Este estándar establece que cada token tiene un ID único y que de ese ID existe exactamente una unidad. Si el Token #1 existe, solo puede haber un Token #1 en todo el contrato, y ese token pertenece a exactamente una dirección.

Esto es lo que hizo famosos a los NFTs de arte digital, los CryptoPunks, los Bored Apes y colecciones similares: cada pieza es un objeto digital único que solo puede pertenecer a una persona a la vez.

### La Propiedad Clave: Supply de 1

La característica definitoria de un NFT es que su **supply total es siempre 1**. No puede haber dos personas con el mismo NFT porque solo existe uno. Cuando alguien lo compra, el anterior propietario lo pierde. No se pueden tener "5 copias" del mismo NFT porque la unicidad está garantizada por el estándar.

---

## 3. Qué Usa el Proyecto: Tokens Semi-Fungibles ERC-1155

### El Estándar ERC-1155

El proyecto EAI usa exclusivamente el estándar **ERC-1155**, que fue diseñado específicamente como una evolución más flexible que supera las limitaciones tanto de ERC-20 (solo fungibles) como de ERC-721 (solo no fungibles).

ERC-1155 permite que en un único contrato coexistan múltiples tipos de tokens, donde cada tipo puede tener cualquier cantidad de unidades en circulación. El Token ID #1 puede tener 100 unidades repartidas entre 20 jugadores. El Token ID #4 puede tener solo 3 unidades. Incluso podría haber un Token ID con supply de 1 (lo que lo haría comportarse como un NFT), pero esa es una decisión del programador, no un requisito del estándar.

### Cómo Funciona en el Proyecto

Cuando el script de despliegue crea el inventario inicial, llama repetidamente a la función `mint` del contrato indicando tres cosas: a quién entregar los tokens, qué tipo de token (el ID del 1 al 6) y **cuántas unidades**. Esta última parte es la clave: se crean entre 1 y 15 unidades de cada tipo para cada jugador. Varias personas pueden recibir unidades del mismo Token ID.

El resultado final en la blockchain es algo parecido a esto:

```
Token ID #1 (Plasma Rifle / Enchanted Bow):
  ├── Jugador A tiene 10 unidades
  ├── Jugador B tiene 5 unidades
  └── Jugador C tiene 3 unidades

  Supply total: 18 unidades en circulación
```

Esas 18 unidades del Token #1 son **completamente intercambiables entre sí**. Las 10 unidades del Jugador A son idénticas a las 5 del Jugador B: no hay ninguna diferencia entre ellas. Cuando el Jugador B compra 2 unidades al Jugador A, recibe exactamente lo mismo que si hubiera comprado las 2 unidades al Jugador C.

Esto es la definición de fungibilidad: intercambiabilidad perfecta entre unidades del mismo tipo.

---

## 4. La Diferencia Fundamental Explicada con Ejemplos

### Analogía 1: El Cuadro Único vs. Las Postales

Imagina que el Token #4 del proyecto (Void Blade / Shadow Dagger, el más poderoso del juego) fuera un NFT. Significaría que en **toda la blockchain solo existe un único Void Blade**. Exactamente uno. Solo un jugador en todo el ecosistema podría tenerlo, y si lo vende, se lo transfiere íntegramente al comprador. Sería como poseer el original de la Mona Lisa: hay una y solo una.

En cambio, en la implementación real con ERC-1155, el Void Blade es como una postal de la Mona Lisa. Puede haber 50 copias en circulación, cada una es idéntica a las demás, y cualquier persona con suficiente ETH puede comprar una. Cuando el Jugador A vende 2 unidades de Void Blade al Jugador B, ambos siguen teniendo unidades del mismo tipo de token; solo cambia la distribución de cuántas tiene cada uno.

### Analogía 2: El Número de Serie

Un NFT sería el equivalente a una edición con número de serie donde cada pieza tiene su número único impreso: la pieza #1, la pieza #2, la pieza #47... Aunque todas sean "iguales" en apariencia, técnicamente son distintas porque sus IDs son distintos. No son intercambiables perfectamente porque la pieza #1 puede valer más que la pieza #47 por ser la primera.

Un token ERC-1155 fungible dentro de su tipo es como un billete de 10 euros: no tiene número de serie relevante, cualquier billete de 10 euros vale exactamente lo mismo que cualquier otro billete de 10 euros.

### Analogía 3: Los Videojuegos de Cartas

Pensando en términos de juegos, la diferencia sería:
- **NFT (ERC-721):** Como una carta de Magic: The Gathering de edición especial firmada por el artista. Existe una sola en el mundo, tiene su historial de propietarios, y su valor es parcialmente el de ser un objeto único.
- **ERC-1155 semi-fungible:** Como una carta estándar de Pokémon. Puede haber miles de "Charizard Holo" en circulación. Todas son idénticas y perfectamente intercambiables. Tener 3 Charizards es simplemente tener 3 unidades de ese tipo de carta.

El proyecto EAI implementa el segundo modelo.

---

## 5. Por Qué los Tokens de EAI NO Son NFTs

La evidencia directa en el código del proyecto lo confirma sin lugar a dudas:

### Evidencia 1: La Función `mint` Acepta `amount`

La función de creación de tokens en el contrato tiene un parámetro `amount` que indica cuántas unidades crear. Si los tokens fueran NFTs, este parámetro no tendría sentido: un NFT siempre tiene supply de 1, no hace falta especificarlo. El hecho de que el contrato permita (y use) cantidades de 1 a 15 unidades por tipo confirma que no son NFTs.

### Evidencia 2: El Script Crea Múltiples Unidades por Tipo

El script de despliegue local genera entre 1 y 15 unidades de cada tipo de token por jugador, con valores aleatorios. Múltiples jugadores pueden recibir unidades del mismo Token ID. Si fueran NFTs, cada mint crearía un objeto único y el Token #1 del Jugador A sería diferente al Token #1 del Jugador B.

### Evidencia 3: El Marketplace Vende "Cantidad" de un Tipo

La función de compra del contrato recibe tres parámetros: vendedor, tipo de token, y **cantidad a comprar**. En un marketplace de NFTs puros, no existiría el parámetro "cantidad" porque cada NFT es único. Solo existiría "el token" o "no el token". El hecho de poder comprar 3 unidades del Token #2 confirma que estamos ante tokens fungibles dentro de su tipo.

### Evidencia 4: El Supply Total es Mayor que 1

El contrato hereda de `ERC1155Supply`, que añade la capacidad de consultar cuántos tokens de cada tipo existen en total. Si consultáramos `totalSupply(1)` después del despliegue, obtendríamos un número mayor que 1 (la suma de todas las unidades del Token #1 repartidas entre los jugadores). Un NFT puro siempre respondería 1 a esta consulta.

---

## 6. Qué SÍ Comparten con los NFTs

Aunque los tokens del proyecto no son NFTs, sí comparten algunas características que generan la confusión habitual entre ambos conceptos. Es importante reconocerlas para entender el ecosistema correctamente.

### Propiedad Digital Real

Al igual que los NFTs, los tokens de EAI son activos que el jugador posee de verdad en blockchain. Nadie puede quitárselos, el desarrollador no tiene acceso a ellos, y persisten independientemente de que el juego esté activo o cerrado. Esta propiedad soberana es característica de toda la familia de tokens blockchain, no exclusiva de los NFTs.

### Metadatos Únicos por Tipo

Al igual que los NFTs, cada tipo de token tiene sus propios metadatos: un nombre, una descripción, estadísticas de juego y representaciones visuales. El Token #4 es conceptualmente diferente al Token #1 y tiene su propia identidad. La diferencia es que en los NFTs cada token INDIVIDUAL tiene sus propios metadatos; aquí, todos los tokens del mismo tipo comparten los mismos metadatos.

### URI Único por Tipo

El contrato almacena una URI (dirección de metadatos) diferente para cada tipo de token. Cuando el frontend quiere saber las propiedades del Token #1, consulta una URI específica; para el Token #4, consulta una URI diferente. Esta estructura de URI por tipo es similar al sistema de metadatos de los NFTs.

### Representación en Marketplaces

La forma en que los activos se muestran, se listan y se compran en el marketplace del proyecto es conceptualmente similar a como funcionan los marketplaces de NFTs como OpenSea. La diferencia es que en OpenSea cada token listado es un objeto único, mientras que en EAI se listan "X unidades de este tipo".

### Interoperabilidad de Activos

La idea central del proyecto —que los activos pueden ser utilizados en múltiples juegos porque viven en blockchain— es exactamente la misma promesa que hacen los NFTs de gaming. La diferencia es la implementación técnica: NFTs para activos únicos, ERC-1155 para activos en serie.

---

## 7. Por Qué se Eligió Este Enfoque en Lugar de NFTs

La elección de ERC-1155 semi-fungible en lugar de ERC-721 NFT no es arbitraria. Responde a una reflexión sobre la naturaleza de los activos de un videojuego.

### Los Objetos de un Juego Son Naturalmente Semi-Fungibles

En casi todos los videojuegos, los objetos son replicables. Cuando matas a un enemigo y te cae una espada, esa espada no es única en el mundo del juego: otros jugadores también pueden obtener espadas idénticas. Hay miles de "Espada de Hierro +2" en World of Warcraft porque es un objeto que muchos jugadores pueden tener simultáneamente.

Los NFTs tienen sentido para coleccionables únicos: el primer gol marcado en un partido de fútbol tokenizado, una obra de arte digital firmada, un momento histórico. Pero para los objetos de un juego de rol, la unicidad absoluta de los NFTs es contraproducente: ¿qué sentido tiene un juego donde solo existe una poción de curación en todo el mundo?

### Eficiencia Económica: El Gas

Cada acción en blockchain tiene un coste en gas. Con ERC-721 (NFTs puros), si el Jugador A quiere transferir 10 espadas al Jugador B, necesitaría 10 transacciones separadas (una por cada NFT único). Con ERC-1155, es una única transacción que transfiere 10 unidades del mismo tipo. El ahorro en gas es directo y significativo.

En el contexto de un juego donde los jugadores intercambian activos frecuentemente, este ahorro multiplica su impacto. La decisión de usar ERC-1155 hace el sistema económicamente viable para un uso intensivo.

### Gestión Simplificada del Inventario

Desde el punto de vista del jugador, tener "10 Plasma Rifles" es mucho más natural que tener "los Plasma Rifles #1, #47, #203, #890..." como lo manejaría un sistema NFT. El inventario de un juego es conceptualmente una lista de tipos de objetos con cantidades, no una colección de objetos individualmente únicos con IDs propios.

### Escalabilidad del Contenido

Un juego puede expandir su catálogo de activos añadiendo nuevos tipos de tokens (nuevos IDs). Con ERC-1155, un solo contrato puede gestionar potencialmente miles de tipos distintos de forma eficiente. Con un sistema NFT puro (ERC-721), cada nuevo tipo de activo requeriría su propio contrato o una gestión de metadata mucho más compleja.

### El Modelo de Economía de Juego

En la economía de un juego, la rareza y el valor de un objeto no provienen de que sea el único que existe, sino de que pocas unidades están en circulación y son difíciles de obtener. Un arma "Legendary" vale más no porque haya solo una en el mundo, sino porque el juego la hace difícil de conseguir y hay pocas en circulación. ERC-1155 permite modelar esta escasez relativa (pocas unidades del Token #4 vs. muchas del Token #3) sin la rigidez de la unicidad absoluta de los NFTs.

---

## 8. Los Tres Estándares: ERC-20, ERC-721 y ERC-1155

Para consolidar la comprensión, aquí está la comparativa completa de los tres estándares de tokens más importantes en Ethereum y cómo cada uno encaja (o no) en el proyecto EAI.

### ERC-20: Token Puramente Fungible

Es el estándar original para tokens fungibles. Todos los tokens son idénticos e intercambiables. Diseñado principalmente para monedas y activos financieros. No tiene concepto de "tipos" ni de unicidad.

**En EAI:** Podría usarse para la moneda del juego (si existiera), pero no para los activos del inventario porque no distingue entre diferentes tipos de ítems.

### ERC-721: Token Puramente No Fungible (NFT)

Cada token tiene un ID único y existe exactamente una unidad. Cada token puede tener sus propios metadatos distintos. No hay dos tokens iguales dentro de un contrato ERC-721. Diseñado para coleccionables, arte digital, certificados únicos.

**En EAI:** No se usa. Sería técnicamente posible pero económicamente ineficiente y conceptualmente inadecuado para objetos de juego que existen en múltiples copias.

### ERC-1155: Token Semi-Fungible (el que usa EAI)

Puede gestionar múltiples tipos de tokens en un solo contrato. Cada tipo (ID) puede tener cualquier número de unidades en circulación. Las unidades del mismo tipo son perfectamente intercambiables entre sí. Diseñado específicamente para videojuegos e inventarios digitales.

**En EAI:** Es el estándar que implementa el contrato. Los 6 tipos de activos (IDs del 1 al 6) son los 6 tipos distintos de tokens. Cada tipo puede tener múltiples unidades repartidas entre los jugadores.

| Característica | ERC-20 | ERC-721 (NFT) | ERC-1155 (EAI) |
|---|---|---|---|
| Tipos distintos | Solo 1 | Ilimitados (cada token es un tipo) | Ilimitados |
| Unidades por tipo | Ilimitadas | Exactamente 1 | Ilimitadas |
| Fungibilidad | Total | Ninguna | Por tipo |
| Coste de transferencia múltiple | Bajo | Alto (1 tx por token) | Bajo (batch) |
| Metadatos | No | Por token individual | Por tipo |
| Uso ideal | Monedas | Coleccionables únicos | Inventarios de juego |

---

## 9. Cómo Serían los NFTs en Este Proyecto

Este apartado es un ejercicio conceptual para entender mejor la distinción: si el proyecto EAI hubiera usado NFTs en lugar de tokens semi-fungibles, ¿cómo sería diferente?

### El Inventario Sería de Objetos Únicos, No de Cantidades

En lugar de "Jugador A tiene 10 unidades del Token #1", el sistema registraría "Jugador A tiene los Plasma Rifles #1, #23, #47, #91, #134, #201, #302, #455, #678 y #901". Cada uno de esos rifles sería un objeto distinto con su propio ID en la blockchain, aunque todos fueran del mismo tipo de objeto.

### Cada Objeto Podría Tener Historia Individual

Una ventaja de los NFTs es que cada objeto puede tener su propia historia: quién lo creó, cuántas veces ha cambiado de manos, a qué precio se vendió cada vez. Con los tokens semi-fungibles del proyecto, todas las unidades del Token #1 son anónimas e intercambiables: no se puede distinguir "cuál" de las unidades de Token #1 tiene el Jugador A.

### La Rareza Sería Absoluta, No Relativa

Si solo se hubieran creado 5 NFTs del Void Blade en toda la historia del juego, esos 5 objetos serían los únicos que existirán jamás. Su rareza sería objetivamente verificable en la blockchain: `totalSupply()` devolvería 5. En el sistema actual, la rareza es una propiedad declarada en los metadatos ("rarity: Legendary") pero en principio el administrador podría mint miles de unidades del Token #4 si quisiera.

### El Marketplace Sería Diferente

En un marketplace de NFTs, cada listado es para un objeto específico e identificable. En OpenSea, cuando ves un Bored Ape a la venta, estás viendo ese Bored Ape concreto con su imagen única, sus atributos únicos y su historial único. En el marketplace de EAI, cuando ves "Token #1 × 3 a 0.02 ETH", estás viendo una oferta para 3 unidades intercambiables de ese tipo; no importa cuáles 3 recibirás exactamente.

### Los Costes Serían Mucho Mayores

Transferir 10 NFTs a un jugador requeriría 10 transacciones blockchain separadas o una transacción de batch muy costosa. Mint de inventarios iniciales para 3 jugadores (como hace el script de despliegue) requeriría decenas de transacciones en lugar de las pocas que usa con ERC-1155.

---

## 10. Conclusión: Semi-Fungibles, el Punto Medio Perfecto

### La Categoría Correcta para el Problema Correcto

Los tokens del proyecto EAI son **tokens semi-fungibles ERC-1155**. No son NFTs (que serían únicos e irrepetibles), ni son tokens puramente fungibles como el dinero (donde no hay distinción entre tipos). Son algo en el medio: múltiples tipos distintos, cada tipo con múltiples unidades intercambiables.

Esta categoría —que en inglés se denomina habitualmente **SFT (Semi-Fungible Token)**— es la que mejor modela la realidad de los objetos en un videojuego. Las espadas de un juego de rol no son obras de arte únicas (eso serían NFTs), pero tampoco son todas idénticas sin distinción de tipo (eso sería ERC-20). Son tipos definidos de objetos, cada uno con sus propias características, de los que pueden existir múltiples copias equivalentes entre sí.

### Por Qué la Confusión es Común

La razón por la que tanta gente confunde ERC-1155 con NFTs es que la industria del gaming blockchain ha comercializado todos sus tokens bajo la etiqueta "NFT" por razones de marketing, independientemente del estándar técnico real. "NFT de gaming" vende mejor que "token semi-fungible de gaming", aunque técnicamente sea incorrecto.

El proyecto EAI, al usar ERC-1155 correctamente para su caso de uso, hace una elección técnica más honesta y adecuada que muchos proyectos comerciales que llaman "NFT" a sus tokens ERC-1155 para aprovechar el hype.

### El Valor No Cambia

Lo importante es que la ausencia de NFTs en sentido estricto no reduce el valor ni la innovación del proyecto. Los tokens semi-fungibles de EAI ofrecen propiedad real, interoperabilidad entre juegos, marketplace descentralizado y todos los beneficios de blockchain que se detallan en el informe `Blockchain.md`. ERC-1155 no es "un NFT peor": es una herramienta diferente, diseñada específicamente para el problema que EAI resuelve, y es la elección más adecuada para un sistema de inventarios de videojuego.

---

*Informe elaborado para el Módulo 1 de Blockchain — Computación distribuida para la gestión de datos a gran escala*
