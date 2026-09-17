# Maniaque Estudio

Tienda online de Maniaque Estudio. La aplicación permite descubrir productos y colecciones, consultar el detalle de cada producto, seleccionar variantes y gestionar un carrito conectado con Shopify.

La interfaz está construida con Next.js App Router, React y Tailwind CSS. Shopify actúa como fuente de productos, colecciones, variantes, precios, imágenes y checkout.

## Contenido

- [Requisitos](#requisitos)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Modos de la aplicación](#modos-de-la-aplicación)
- [Rutas](#rutas)
- [Carrito y checkout](#carrito-y-checkout)
- [Cookies y privacidad](#cookies-y-privacidad)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Scripts disponibles](#scripts-disponibles)
- [Despliegue](#despliegue)

## Requisitos

- Node.js compatible con Next.js 16.
- npm, incluido con Node.js.
- Una tienda Shopify con acceso a Storefront API.
- Un Storefront Access Token con permisos para consultar productos y gestionar carritos.

## Puesta en marcha

1. Instala las dependencias:

	```bash
	npm install
	```

2. Crea un archivo `.env.local` en la raíz del proyecto. Consulta la sección [Variables de entorno](#variables-de-entorno).

3. Inicia el servidor de desarrollo:

	```bash
	npm run dev
	```

4. Abre [http://localhost:3000](http://localhost:3000).

Los cambios en `src/` se reflejan automáticamente durante el desarrollo.

## Variables de entorno

Define estas variables en `.env.local` para trabajar en local. No subas este archivo al repositorio ni compartas sus valores.

```env
SHOPIFY_STORE_DOMAIN="tu-tienda.myshopify.com"
SHOPIFY_STOREFRONT_ACCESS_TOKEN=""
SHOPIFY_API_VERSION="2026-07"
SHOPIFY_REVALIDATION_SECRET=""
ENABLE_LAUNCH_LANDING="false"
```

| Variable | Descripción |
| --- | --- |
| `SHOPIFY_STORE_DOMAIN` | Dominio `myshopify.com` de la tienda. |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Token usado por el servidor para llamar a Storefront API. |
| `SHOPIFY_API_VERSION` | Versión de GraphQL Storefront API. Si se omite, el cliente usa `2026-07`. |
| `SHOPIFY_REVALIDATION_SECRET` | Secreto reservado para las operaciones de revalidación de Shopify. |
| `ENABLE_LAUNCH_LANDING` | Controla si la web funciona como tienda (`false`) o como landing de lanzamiento (`true`). |

El cliente de Shopify se encuentra en [`src/lib/shopify/client.ts`](src/lib/shopify/client.ts). Las variables no llevan prefijo `NEXT_PUBLIC_` porque el token solo debe utilizarse en el servidor.

## Modos de la aplicación

El comportamiento se controla sin cambiar el código:

- `ENABLE_LAUNCH_LANDING="false"`: modo tienda. Las rutas como `/shop`, `/cart` y las páginas de producto están disponibles.
- `ENABLE_LAUNCH_LANDING="true"`: modo lanzamiento. Las rutas públicas se redirigen a `/` y se muestra la landing.

Para desarrollar con normalidad, usa `false` en `.env.local`. En producción puedes usar `true` hasta que la tienda esté lista para abrirse.

## Rutas

| Ruta | Función |
| --- | --- |
| `/` | Página principal con productos, últimos lanzamientos y enlaces a las políticas disponibles en Shopify. |
| `/shop` | Listado de colecciones de la tienda. |
| `/shop/[collection]` | Productos pertenecientes a una colección identificada por su `handle`. |
| `/products/[handle]` | Detalle de un producto, galería de imágenes, variantes, guía de tallas y productos relacionados. |
| `/cart` | Carrito actual: cantidades, eliminación de líneas, subtotal y enlace al checkout de Shopify. |
| `/contact` | Página de contacto. |
| `/us` | Página informativa de la marca. |

Los segmentos dinámicos `[collection]` y `[handle]` deben coincidir con los `handle` definidos en Shopify.

## Carrito y checkout

El carrito se gestiona mediante Shopify Storefront API:

- Al añadir el primer producto, se crea un carrito con `cartCreate`.
- Las siguientes adiciones utilizan `cartLinesAdd`.
- El identificador del carrito se guarda en `localStorage` con la clave `cartId`.
- El carrito permite consultar, modificar cantidades y eliminar líneas.
- El pago continúa en la URL `checkoutUrl` proporcionada por Shopify.

La ruta interna [`/api/cart`](src/app/api/cart/route.ts) expone estas operaciones:

| Método | Uso |
| --- | --- |
| `GET` | Obtiene un carrito mediante `cartId`. |
| `POST` | Crea un carrito o añade una variante a uno existente. |
| `PATCH` | Actualiza la cantidad de una línea. |
| `DELETE` | Elimina una línea del carrito. |

Los componentes [`CartClient`](src/components/cart/CartClient.tsx) y [`ProductPurchase`](src/components/product/ProductPurchase.tsx) consumen esta API desde el navegador. El contador del header se actualiza mediante el evento local `cart-updated`.

## Cookies y privacidad

[`CookieBanner`](src/components/cookies/CookieBanner.tsx) muestra el aviso de consentimiento cuando todavía no existe una decisión guardada. La persona puede aceptar, rechazar o personalizar las categorías desde [`CookiePreferencesModal`](src/components/cookies/CookiePreferencesModal.tsx).

El consentimiento se guarda en `localStorage` con la clave `cookie-consent`. Las cookies necesarias permanecen activas; las categorías de analítica y marketing se guardan según la elección realizada.

## Estructura del proyecto

```text
src/
├── app/
│   ├── page.tsx                    # Página principal
│   ├── layout.tsx                  # Layout global, metadata, fuente y cookies
│   ├── globals.css                 # Estilos globales
│   ├── api/cart/route.ts           # API interna del carrito
│   ├── cart/page.tsx               # Vista del carrito
│   ├── contact/page.tsx            # Página de contacto
│   ├── products/[handle]/page.tsx  # Detalle de producto
│   ├── shop/page.tsx               # Listado de colecciones
│   ├── shop/[collection]/page.tsx  # Productos de una colección
│   └── us/page.tsx                 # Página de marca
├── components/
│   ├── cart/                       # Carrito y contador del header
│   ├── cookies/                    # Consentimiento y preferencias
│   ├── layout/                     # Header, footer y carga inicial
│   └── product/                    # Galerías, tarjetas y compra
├── lib/
│   ├── cookies/                    # Lectura de consentimiento
│   └── shopify/                    # Cliente GraphQL y consultas
└── types/shopify.ts                # Tipos de respuestas de Shopify
```

Otros archivos relevantes:

- [`next.config.ts`](next.config.ts): dominios remotos permitidos para `next/image` y redirecciones de la landing.
- [`tsconfig.json`](tsconfig.json): configuración de TypeScript y alias `@/*`.
- [`eslint.config.mjs`](eslint.config.mjs): configuración de ESLint.
- [`postcss.config.mjs`](postcss.config.mjs): integración de Tailwind CSS 4 mediante PostCSS.

## Scripts disponibles

```bash
npm run dev    # Servidor de desarrollo
npm run lint   # Comprobación de ESLint
npm run build  # Compilación de producción
npm run start  # Servidor con la compilación generada
```

Antes de desplegar, ejecuta al menos `npm run lint` y `npm run build` con las variables de Shopify configuradas.

## Despliegue

La aplicación puede desplegarse en Vercel o en cualquier plataforma compatible con Next.js 16:

1. Configura todas las variables de entorno en el proveedor.
2. Usa `npm run build` como comando de compilación.
3. Usa `npm run start` para ejecutar la aplicación en un entorno Node.js.
4. Comprueba que el dominio de Shopify esté incluido en los `remotePatterns` de [`next.config.ts`](next.config.ts).
5. Decide si `ENABLE_LAUNCH_LANDING` debe estar en `true` o `false` según el estado del lanzamiento.

No incluyas tokens ni secretos en el código fuente, el README o variables públicas del navegador.

## Tecnologías

- [Next.js 16](https://nextjs.org/docs)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Lucide React](https://lucide.dev/guide/packages/lucide-react)
