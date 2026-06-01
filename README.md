<div align="center">
<img width="1200" height="475" alt="Mundo Mimitos" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Mundo Mimitos - E-commerce

Plataforma de e-commerce para venta de ropa para bebés y niños con inteligencia artificial integrada.

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Base de datos**: PostgreSQL
- **IA**: Google Gemini API

## Características

✨ Catálogo dinámico de productos
💳 Carrito de compras
📱 Diseño responsivo
🤖 Generador de descripciones con IA
⚙️ Panel de administración

## Requisitos Previos

- Node.js 18+
- PostgreSQL 12+
- Clave API de Google Gemini

## Instalación Local

### 1. Clonar repositorio
```bash
git clone https://github.com/ivanna-toloza/mundo-mimitos.git
cd mundo-mimitos
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copiar `.env.example` a `.env.local` y completar:
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```
GEMINI_API_KEY="tu_clave_gemini_aqui"
APP_URL="http://localhost:3000"
DATABASE_URL="postgresql://user:password@localhost:5432/mundo_mimitos"
```

### 4. Crear base de datos PostgreSQL

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE mundo_mimitos;
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Despliegue en Railway

### 1. Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Inicia sesión con GitHub
3. Haz clic en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Conecta tu cuenta de GitHub
6. Selecciona el repositorio `mundo-mimitos`

### 2. Agregar PostgreSQL

1. En el panel de Railway, haz clic en "+ New"
2. Selecciona "Database"
3. Elige "PostgreSQL"
4. Railway agregará automáticamente `DATABASE_URL`

### 3. Configurar variables de entorno

En Railway, ve a la pestaña "Variables" y agrega:

```
GEMINI_API_KEY=tu_clave_gemini_aqui
APP_URL=https://tu-app.railway.app
NODE_ENV=production
```

Railway automáticamente proporcionará `DATABASE_URL` desde PostgreSQL.

### 4. Desplegar

Railway detectará automáticamente el proyecto Node.js y hará el deploy.

El URL de tu aplicación será: `https://tu-app.railway.app`

## Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Limpiar archivos compilados
npm run clean

# Verificar tipos
npm run lint
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── AdminPanel.tsx
│   ├── CartDrawer.tsx
│   ├── ProductCard.tsx
│   └── ProductModal.tsx
├── database/           # Configuración de PostgreSQL
│   ├── db.ts          # Conexión a BD
│   ├── init.ts        # Inicialización de tablas
│   └── types.ts       # Tipos TypeScript
├── assets/            # Imágenes y estilos
├── App.tsx
├── main.tsx
└── types.ts

server.ts              # Servidor Express
vite.config.ts        # Configuración de Vite
tsconfig.json         # Configuración de TypeScript
```

## API Endpoints

### GET `/api/store`
Obtiene la configuración y productos de la tienda.

### POST `/api/store/config`
Actualiza la configuración de la tienda.

### POST `/api/store/products`
Actualiza el catálogo de productos.

### POST `/api/store/reset`
Reinicia la tienda a valores por defecto.

### POST `/api/gemini/generate-description`
Genera descripciones de productos con IA.

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `GEMINI_API_KEY` | Clave API de Google Gemini |
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `APP_URL` | URL base de la aplicación |
| `PORT` | Puerto del servidor (default: 3000) |
| `NODE_ENV` | Ambiente (development/production) |

## Obtener Clave Gemini API

1. Ve a [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Haz clic en "Get API Key"
3. Crea una nueva clave
4. Copia la clave y agrégala a tu `.env.local`

## Solución de Problemas

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL esté corriendo
- Comprueba que la `DATABASE_URL` sea correcta
- En Railway, espera a que PostgreSQL esté listo (puede tomar 2-3 minutos)

### Error de Gemini API
- Verifica que la clave sea válida
- Comprueba que tengas cuota disponible en Google AI Studio
- Revisa la consola del servidor para más detalles

### Build fallando
```bash
npm run clean
npm install
npm run build
```

## Licencia

Privado - Uso exclusivo de Mundo Mimitos

## Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.
