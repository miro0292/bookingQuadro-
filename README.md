# Quadro Smartliving — Plataforma de Reservas

Aplicación web full-stack para la gestión y reserva de apartamentos del Edificio Quadro Smartliving en Bogotá, Colombia. Construida como MVP con Next.js, Prisma y SQLite.

---

## Descripción general

Quadro Smartliving es una plataforma de reservas de apartamentos amoblados que permite a los huéspedes explorar unidades disponibles, consultar disponibilidad, hacer reservas y realizar pagos en línea. Los propietarios cuentan con un panel privado para administrar los apartamentos.

---

## Funcionalidades

### Página principal (`/`)

- Banner hero con foto de áreas comunes del edificio e información destacada (coworking, cafetería, terraza, lavandería, parqueadero).
- Galería de fotos de las áreas comunes del edificio (28 imágenes navegables).
- Listado de todos los apartamentos disponibles con foto, título, dirección y precio por noche en COP.
- Navegación al detalle de cada apartamento.
- Acceso directo al Panel del Propietario.

### Detalle de apartamento (`/listing/[id]`)

- Galería de imágenes del apartamento con miniaturas, acordeón expandible y modal de pantalla completa (navegación con teclado: flechas y Escape).
- Calificación de huéspedes con puntuaciones por categoría: limpieza, exactitud, comunicación y ubicación.
- Sección de beneficios y comodidades del edificio.
- Calendario de disponibilidad mensual: muestra en rojo las fechas ya reservadas y permite navegar mes a mes.
- Reseñas de huéspedes (demo).
- Mapa de ubicación embebido (Google Maps) con la dirección del apartamento.
- Panel lateral de reserva con:
  - Selección de fechas de llegada y salida.
  - Número de huéspedes (1–8).
  - Cálculo automático del total por noches.
  - Botón **Solicitar reserva** (requiere sesión activa).
  - Botón **Pagar ahora** con redirección a Stripe Checkout (requiere sesión activa y `STRIPE_SECRET_KEY` válida).
  - Botón de contacto por **WhatsApp** con mensaje predeterminado.
- Autenticación social para reservar: Google, Facebook e Instagram (vía Meta).

### Panel del propietario (`/owner`)

- Acceso protegido: requiere login con credenciales de propietario.
- Formulario para **crear** nuevos apartamentos (título, descripción, dirección, ciudad, precio, imágenes).
- Editor inline para **actualizar** cualquier apartamento existente.
- Cierre de sesión.

### Autenticación (`/auth/signin`)

- **Credenciales** (propietario): email y contraseña configurados en variables de entorno.
- **Google OAuth**: para huéspedes con cuenta Google.
- **Facebook / Instagram OAuth**: para huéspedes con cuenta Meta.

### API REST interna

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/listings` | Lista todos los apartamentos con imágenes y reservas |
| POST | `/api/listings` | Crea un nuevo apartamento (requiere rol host) |
| GET | `/api/listings/[id]` | Detalle de un apartamento con imágenes y reservas |
| PUT | `/api/listings/[id]` | Actualiza un apartamento existente |
| POST | `/api/bookings` | Crea una reserva (requiere sesión) |
| POST | `/api/payments/checkout` | Inicia sesión de pago en Stripe Checkout |
| GET | `/api/whatsapp` | Redirige a WhatsApp con mensaje predefinido del apartamento |

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 13 (Pages Router) |
| UI | React 18 + Tailwind CSS 3 |
| ORM | Prisma 5 |
| Base de datos | SQLite (archivo local `prisma/dev.db`) |
| Autenticación | NextAuth v4 (Credentials, Google, Facebook) |
| Pagos | Stripe (Checkout Sessions) |
| Fetching de datos | SWR |

---

## Modelos de datos

```
User        → id, email, name, image, role (guest | host)
Listing     → id, title, description, address, city, price, ownerId
Image       → id, path, listingId
Booking     → id, listingId, userId, startDate, endDate, total
Review      → id, rating, comment, listingId, authorId
Admin       → id, email, name
```

---

## Estructura del proyecto

```
bookingQuadro/
├── pages/
│   ├── index.js                    # Página principal
│   ├── listing/[id].js             # Detalle de apartamento
│   ├── owner/index.js              # Panel del propietario
│   ├── auth/signin.js              # Página de login
│   ├── _app.js                     # Proveedor de sesión NextAuth
│   └── api/
│       ├── auth/[...nextauth].js   # Configuración de autenticación
│       ├── listings/
│       │   ├── index.js            # GET listado / POST crear
│       │   └── [id].js             # GET detalle / PUT actualizar
│       ├── bookings.js             # POST crear reserva
│       ├── payments/checkout.js    # POST Stripe Checkout
│       └── whatsapp.js             # GET redirección WhatsApp
├── lib/
│   └── prisma.js                   # Cliente Prisma singleton
├── prisma/
│   ├── schema.prisma               # Esquema de la base de datos
│   ├── seed.js                     # Script de datos de demo
│   └── dev.db                      # Base de datos SQLite (generada)
├── public/
│   ├── listings/                   # Imágenes de los apartamentos
│   └── welcome/                    # Imágenes de áreas comunes
├── styles/
│   └── globals.css                 # Estilos globales + clases Tailwind
├── Dockerfile
├── docker-compose.yml
├── .env.example                    # Plantilla de variables de entorno
└── package.json
```

---

## Ejecución local (paso a paso)

### Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior

Verificar instalación:

```bash
node --version
npm --version
```

---

### Paso 1 — Clonar o ubicarse en el proyecto

```bash
cd bookingQuadro
```

---

### Paso 2 — Configurar variables de entorno

Copiar la plantilla de entorno:

```bash
cp .env.example .env
```

Abrir `.env` y editar los valores necesarios:

```env
# Base de datos SQLite (no cambiar para desarrollo local)
DATABASE_URL="file:./dev.db"

# Secreto de sesión — generar uno aleatorio con:
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET="reemplazar_con_secreto_aleatorio"
NEXTAUTH_URL="http://localhost:3000"

# Login del propietario (panel /owner)
OWNER_EMAIL="host@quadro.local"
OWNER_PASSWORD="host123"

# OAuth Google — opcional para demo local
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# OAuth Facebook / Instagram — opcional para demo local
FACEBOOK_CLIENT_ID="your_facebook_client_id"
FACEBOOK_CLIENT_SECRET="your_facebook_client_secret"

# Stripe — opcional para demo local
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Google Maps — opcional, el mapa carga igualmente sin key
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

> Las variables de OAuth, Stripe y Google Maps son **opcionales** para explorar la aplicación localmente. El login de propietario y el listado de apartamentos funcionan sin ellas.

---

### Paso 3 — Instalar dependencias

```bash
npm install
```

---

### Paso 4 — Configurar la base de datos

Generar el cliente de Prisma:

```bash
npx prisma generate
```

Crear las tablas en la base de datos SQLite:

```bash
npx prisma db push
```

Cargar datos de demo (8 apartamentos + usuario host y guest):

```bash
node prisma/seed.js
```

---

### Paso 5 — Agregar imágenes (opcional)

Las imágenes de los apartamentos deben estar en `public/listings/` con los nombres:

```
public/listings/list1.png
public/listings/list2.png
public/listings/list3.png
public/listings/list4.png
```

Las imágenes de áreas comunes deben estar en `public/welcome/`:

```
public/welcome/welcome-01.png
public/welcome/welcome-02.png
...
public/welcome/welcome-28.png
```

El logo del edificio va en:

```
public/logo.jpg
```

---

### Paso 6 — Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

---

## Accesos de la aplicación

| Ruta | Descripción |
|------|-------------|
| `http://localhost:3000` | Página principal con listado de apartamentos |
| `http://localhost:3000/listing/[id]` | Detalle y reserva de un apartamento |
| `http://localhost:3000/owner` | Panel del propietario (requiere login) |
| `http://localhost:3000/auth/signin` | Página de inicio de sesión |

### Credenciales del propietario

```
Email:      host@quadro.local
Contraseña: host123
```

---

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo en http://localhost:3000
npm run build        # Build de producción
npm run start        # Servidor de producción (requiere build previo)
npm run prisma:g     # Regenerar cliente Prisma
npm run prisma:m     # Crear nueva migración
npm run seed         # Recargar datos de demo en la base de datos
```

---

## Despliegue con Docker

### Paso 1 — Configurar `.env` para producción

```bash
cp .env.example .env
```

Ajustar para producción:

```env
DATABASE_URL="file:/data/dev.db"
NEXTAUTH_SECRET="secreto_largo_y_aleatorio"
NEXTAUTH_URL="https://tu-dominio.com"
```

### Paso 2 — Construir y levantar los contenedores

```bash
docker compose up -d --build
```

### Paso 3 — Ver logs

```bash
docker compose logs -f web
```

### Paso 4 — Detener los servicios

```bash
docker compose down
```

> El entrypoint ejecuta `prisma db push` automáticamente al iniciar. Para cargar datos demo al arrancar, definir `RUN_SEED_ON_START=true` en `.env`. El volumen `booking-data` persiste la base de datos entre reinicios del contenedor.

---

## Integraciones opcionales

### Stripe (pagos)

1. Crear cuenta en [stripe.com](https://stripe.com) y obtener las keys de prueba.
2. Agregar en `.env`:
   ```env
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```
3. El botón **Pagar ahora** en la ficha del apartamento redirige a Stripe Checkout.

### Google OAuth

1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com).
2. Habilitar la API de OAuth y crear credenciales para aplicación web.
3. Agregar `http://localhost:3000/api/auth/callback/google` como URI de redirección.
4. Agregar en `.env`:
   ```env
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```

### Facebook / Instagram OAuth

1. Crear app en [Meta for Developers](https://developers.facebook.com).
2. Agregar el producto Facebook Login.
3. Agregar en `.env`:
   ```env
   FACEBOOK_CLIENT_ID="..."
   FACEBOOK_CLIENT_SECRET="..."
   ```

### Google Maps

1. Obtener API Key en [Google Cloud Console](https://console.cloud.google.com) (Maps Embed API).
2. Agregar en `.env`:
   ```env
   GOOGLE_MAPS_API_KEY="..."
   ```
   > Sin la key, el mapa embebido en la ficha del apartamento sigue funcionando con funcionalidad reducida.
