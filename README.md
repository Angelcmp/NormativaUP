# NormativaUP — El Jurisconsulto Digital

Asistente de inteligencia artificial para consultar leyes, decretos y normas de la Republica de Panama. Prototipo desarrollado en la Universidad de Panama.

## Demo en vivo

- **Aplicacion web**: https://normativaup-frontend.onrender.com/
- **API**: https://normativaup-backend.onrender.com — documentacion interactiva en [/docs](https://normativaup-backend.onrender.com/docs)

> Desplegado en Render (plan free). El backend puede tardar unos segundos en responder tras un periodo de inactividad.

## Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | React 19 + Vite 8 + TypeScript + Tailwind CSS v4 |
| Backend | FastAPI (Python 3.12+) |
| LLM | OpenAI GPT-4o / GPT-4o mini |
| Embeddings | OpenAI `text-embedding-3-small` (o `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` en local) |
| Base vectorial | ChromaDB |
| Contenedores | Docker + docker-compose |

## Estructura del Proyecto

```
NormativaIAUP/
├── backend/
│   ├── main.py                 # FastAPI app, security headers, rate limiting, lifespan
│   ├── models.py               # Pydantic schemas con validacion
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── routes/
│   │   ├── chat.py             # POST /api/chat, POST /api/chat/stream, GET /api/categories, GET /api/models
│   │   └── documents.py        # GET /api/documents, /{id}/pdf, /{id}/content
│   ├── services/
│   │   └── rag.py              # Orquestacion RAG (OpenAI + ChromaDB)
│   ├── app/
│   │   ├── config/settings.py  # Configuracion centralizada
│   │   └── src/
│   │       ├── document_data.py        # Metadatos de documentos
│   │       ├── retrieval/vector_store.py
│   │       └── ingestion/document_loader.py
│   ├── scripts/
│   │   └── generar_datos_prueba.py
│   ├── data/
│   │   ├── raw/               # PDFs de leyes
│   │   └── vector_store/      # ChromaDB (se regenera)
│   ├── .dockerignore
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   ├── types.ts
│   │   ├── index.css          # Design system + Tailwind
│   │   └── components/
│   │       ├── Sidebar.tsx
│   │       ├── ChatArea.tsx
│   │       ├── DocumentPanel.tsx
│   │       ├── WelcomeScreen.tsx
│   │       ├── MessageBubble.tsx
│   │       └── ChatComponents.tsx
│   ├── vite.config.ts
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
├── docker-compose.yml
├── render.yaml
├── .gitignore
└── .env.example
```

## Levantar Local (sin Docker)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp .env.example .env      # Editar con tu OPENAI_API_KEY
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`. El frontend proxifica `/api` al backend en puerto 8000.

### 3. Indexar documentos

```bash
cd backend
python -c "
import sys; sys.path.insert(0, '.')
from app.src.ingestion.document_loader import cargar_documentos
from app.src.retrieval.vector_store import BaseDatosVectorial
docs = cargar_documentos('data/raw')
db = BaseDatosVectorial()
db.crear_o_cargar(docs)
print(f'Indexados {len(docs)} chunks')
"
```

## Levantar con Docker

```bash
cp backend/.env.example backend/.env   # Editar con tu OPENAI_API_KEY
docker-compose up --build
```

Abrir `http://localhost:80`.

## Despliegue (Render)

El proyecto incluye `render.yaml` con dos servicios:

- `normativaup-backend` — FastAPI (Python 3.12), `EMBEDDING_PROVIDER=openai` para no exceder el limite de memoria del plan free.
- `normativaup-frontend` — build estatico de Vite, con rewrite de `/api/*` hacia el backend.

Configura `OPENAI_API_KEY` como variable de entorno en el servicio del backend.

## API Endpoints

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Status de la API |
| GET | `/health` | Health check (vector store + LLM) |
| GET | `/docs` | Swagger UI |
| POST | `/api/chat` | Consulta legal con RAG |
| POST | `/api/chat/stream` | Consulta legal con RAG (streaming SSE) |
| GET | `/api/categories` | Categorias disponibles |
| GET | `/api/models` | Modelos LLM disponibles |
| GET | `/api/documents` | Documentos indexados |
| GET | `/api/documents/{id}/pdf` | PDF del documento |
| GET | `/api/documents/{id}/content` | Texto extraido del documento |

### Ejemplo de consulta

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Que dice la Ley Organica sobre la autonomia universitaria?", "language": "es"}'
```

## Variables de Entorno

| Variable | Requerida | Default | Descripcion |
|----------|-----------|---------|-------------|
| `OPENAI_API_KEY` | Si | — | Clave API de OpenAI |
| `EMBEDDING_PROVIDER` | No | `openai` | `openai` (cloud, baja memoria) o `local` (sentence-transformers) |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Modelo por defecto |
| `HOST` | No | `0.0.0.0` | Host del servidor |
| `PORT` | No | `8000` | Puerto del servidor |

## Documentos Indexados

- Ley 6 de 2002 — Transparencia y Acceso a la Informacion
- Ley 29 de 2002 — Regimen Juridico de la Universidad de Panama
- **Ley Organica de la Universidad de Panama** (PDF real)
- Ley 42 de 2012 — Sistema Penitenciario
- DE 356 de 2020 — Reglamento de Teletrabajo
- Ley 187 de 2020 — Proteccion de Datos Personales

## Seguridad

- Input validation con Pydantic (min 3, max 1000 caracteres, HTML stripping, validacion de modelo y lenguaje)
- Rate limiting: 30 req/min por IP (respeta `X-Forwarded-For`/`X-Real-IP` detras de proxy)
- Security headers: CSP, X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy
- CORS restringido a origenes especificos
- Contexto de documentos delimitado y tratado como no confiable (mitigacion de prompt injection)
- `.env` excluido del repositorio y de las imagenes Docker (`.dockerignore`)
- Dependencias auditadas (0 vulnerabilidades)

## Calidad y Tests

```bash
# Backend
cd backend
pip install -r requirements-dev.txt
ruff check .
pytest -q

# Frontend
cd frontend
npm run lint
npm test
npm run build
```

El workflow `.github/workflows/ci.yml` ejecuta lint, typecheck, tests y build en cada push a `main` y en cada pull request.

## Licencia

MIT License - Universidad de Panama

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
