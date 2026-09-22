# NormativaUP — Frontend

Interfaz web de NormativaUP (El Jurisconsulto Digital), construida con React 19 + Vite 8 + TypeScript + Tailwind CSS v4.

## Requisitos

- Node.js 22+
- Backend de NormativaUP corriendo (por defecto en `http://localhost:8000`)

## Desarrollo

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173`. Vite proxifica `/api` al backend en el puerto 8000 (ver `vite.config.ts`).

## Scripts

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Typecheck (`tsc -b`) + build de produccion en `dist/` |
| `npm run preview` | Sirve el build de produccion |
| `npm run lint` | Ejecuta ESLint |

## Variables de entorno

| Variable | Default | Descripcion |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | URL base de la API. En produccion apunta al backend en Render |

## Despliegue

El build estatico se publica en `https://normativaup-frontend.onrender.com/` (ver `render.yaml` en la raiz del repositorio).
