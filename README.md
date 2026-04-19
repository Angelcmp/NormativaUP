# NormativaUP — El Jurisconsulto Digital

Asistente de inteligencia artificial para consultar leyes, decretos y normas de la Republica de Panama. Prototipo desarrollado en la Universidad de Panama.

## Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | React 19 + Vite 8 + TypeScript + Tailwind CSS v4 |
| Backend | FastAPI (Python 3.14) |
| LLM | OpenAI GPT-4o |
| Embeddings | sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 |
| Base vectorial | ChromaDB |
| Contenedores | Docker + docker-compose |

## Estructura del Proyecto

```
NormativaIAUP/
├── backend/
│   ├── main.py                 # FastAPI app + security middleware
│   ├── models.py               # Pydantic schemas con validacion
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── routes/
│   │   ├── chat.py             # POST /api/chat, GET /api/categories
│   │   └── documents.py        # GET /api/documents
│   ├── services/
│   │   └── rag.py              # Orquestacion RAG (OpenAI + ChromaDB)
│   ├── app/
│   │   ├── config/settings.py  # Configuracion centralizada
│   │   └── src/
│   │       ├── retrieval/vector_store.py
│   │       └── ingestion/document_loader.py
│   ├── scripts/
│   │   └── generar_datos_prueba.py
│   ├── data/
│   │   ├── raw/               # PDFs de leyes
│   │   └── vector_store/      # ChromaDB (se regenera)
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
│   │       ├── WelcomeScreen.tsx
│   │       ├── MessageBubble.tsx
│   │       └── ChatComponents.tsx
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
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

## API Endpoints

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Status de la API |
| GET | `/health` | Health check (vector store + LLM) |
| GET | `/docs` | Swagger UI |
| POST | `/api/chat` | Consulta legal con RAG |
| GET | `/api/categories` | Categorias disponibles |
| GET | `/api/documents` | Documentos indexados |

### Ejemplo de consulta

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Que dice la Ley Organica sobre la autonomia universitaria?", "language": "es"}'
```

## Variables de Entorno

| Variable | Requerida | Descripcion |
|----------|-----------|-------------|
| `OPENAI_API_KEY` | Si | Clave API de OpenAI (GPT-4o) |

## Documentos Indexados

- Ley 6 de 2002 — Transparencia y Acceso a la Informacion
- Ley 29 de 2002 — Regimen Juridico de la Universidad de Panama
- **Ley Organica de la Universidad de Panama** (PDF real)
- Ley 42 de 2012 — Sistema Penitenciario
- DE 356 de 2020 — Reglamento de Teletrabajo
- Ley 187 de 2020 — Proteccion de Datos Personales

## Seguridad

- Input validation con Pydantic (min 3, max 1000 caracteres, HTML stripping, regex para lenguaje)
- Rate limiting: 30 req/min por IP
- Security headers: CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy
- CORS restringido a origenes especificos
- `.env` excluido del repositorio
- Dependencias auditadas (0 vulnerabilidades)

## Licencia

Prototipo academico — Universidad de Panama