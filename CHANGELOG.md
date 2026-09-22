# Changelog — NormativaUP

## [0.7.0] — 2026-09-21

### Endurecimiento, documentacion y enlace de demo

- **Demo en vivo**: documentada en el README
  - Web: `https://normativaup-frontend.onrender.com/`
  - API: `https://normativaup-backend.onrender.com`
- **Streaming SSE robusto**: `frontend/src/api.ts` acumula buffer y decodifica con `{stream: true}`, procesa eventos separados por `\n\n` y maneja eventos `error`
- **Errores sin filtracion**: `LLMError` en `services/rag.py`; `/api/chat` responde `502` y `/api/chat/stream` emite evento `error` con mensaje generico, detalle solo en logs
- **Rate limiting tras proxy**: `get_client_ip` usa `X-Forwarded-For`/`X-Real-IP`; `--proxy-headers` en Dockerfile y `render.yaml`
- **Event loop**: `search`/`generate` se ejecutan con `run_in_threadpool`
- **Prompt injection**: contexto envuelto en `<documentos>` y tratado como dato no confiable; se elimina la query duplicada en el system prompt
- **Validacion**: `language` opcional (autodeteccion) y `model` validado contra `ALLOWED_MODELS` (`422` si es invalido)
- **Lifespan**: migracion de `@app.on_event("startup")` a `lifespan`
- **Docker**: `.dockerignore` en backend y frontend (evita incluir `.env`, `venv/`, `vector_store/`, `node_modules/`)
- **DocumentPanel**: cleanup correcto de `objectURL` y cancelacion de fetch
- **Documentacion**: README actualizado (endpoints de streaming/PDF/contenido, variables de entorno reales, `X-Frame-Options SAMEORIGIN`), CHANGELOG versionado en el repo

### Pendiente

- Tests automatizados (pytest + vitest) y workflow de CI
- Visor PDF movil (pdf.js), boton detener generacion, citas por pagina, i18n de UI

---

## [0.6.0] — 2026-04-19

### Deploy a Render — OpenAI Embeddings + Error Handling

- **Render deployment**: Backend y frontend desplegados a Render free tier
  - Backend: `https://normativaup-backend.onrender.com`
  - Frontend: `https://normativaup-frontend.onrender.com`
- **OpenAI embeddings**: Cambiado de `sentence-transformers` a `text-embedding-3-small` para evitar OOM en Render free tier (512MB limit)
- **EMBEDDING_PROVIDER env var**: `"openai"` (cloud) o `"local"` (sentence-transformers)
- **Chromadb rebuild**: Vector store regenerado con OpenAI embeddings, 651 chunks
- **render.yaml**: Configuracion para ambos servicios, Python 3.12, CORS permitido

### Fixes de Backend

- **Confidence calculation**: Correccion para distancia L2 de ChromaDB (menor = mejor). Formula `1/(1+avg)*100` produce porcentaje valido 0-100
- **Error handling detallado**: Chat endpoint ahora captura y loggea errores con tipo y mensaje
- **Auto-rebuild**: Si el vector store no existe al iniciar, lo regenera desde los PDFs

### Frontend Error Handling

- **Mensajes amigables en espanol**: Para errores 400, 429, 500, 502, 503
- **Auto-retry**: Hasta 2 reintentos con backoff exponencial (1.5s, 3s) en errores 5xx
- **Boton Reintentar**: UI con icono y funcionalidad en errores
- **Clamp defensivo**: confidence.percentage forzado a rango 0-100
- **Fetch graceful**: `fetchCategories` y `fetchDocuments` devuelven arrays vacios en vez de crashear

---

## [0.5.0] — 2026-04-18

### Seguridad e Infraestructura

- **Input validation**: Modelos Pydantic con `min_length=3`, `max_length=1000`, regex `(es|en)` para lenguaje, stripping de HTML tags y caracteres de control
- **Rate limiting**: Middleware 30 req/min por IP, HTTP 429 si excede
- **Security headers**: CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy
- **CORS restringido**: Solo 4 origenes permitidos (localhost:5173, localhost:3000, 127.0.0.1 equivalentes), solo GET/POST, solo header Content-Type
- **Health endpoint**: `GET /health` reporta estado de vector store y LLM
- **Logging estructurado**: Logger `normativaup` con formato `timestamp | level | name | message`
- **.env protection**: `.gitignore` bloquea `.env`, `.env.local`, `.env.production`, `*.env`; `.env.example` sin secrets reales
- **PDF storage**: Sin endpoints de upload, files solo accesibles internamente por el backend
- **Dependency audit**: 0 vulnerabilidades en pip-audit y npm audit
- **.gitignore completo**: Cubre Python, Node, data, models, IDE, OS, secrets, certs

### Markdown Rendering (respuestas IA)

- Instalado `react-markdown` + `remark-gfm`
- Las respuestas del asistente ahora renderizan Markdown completo: negrita, itálica, listas, tablas, bloques de código, blockquotes, links, H1-H3
- Clase CSS `prose-normativa` con paleta del Jurisconsulto Digital (midnight, earth, section, etc.)
- Código inline: fondo section, color earth
- Bloques de código: fondo midnight, texto claro, border-radius 10px
- Blockquotes: borde lateral gold, fondo crema
- Tablas: header en section, bordes con muted

---

## [0.4.0] — 2026-04-18

### Fase 4 — Datos Reales

- **Ley Organica UP**: Descargado PDF real desde `https://www.up.ac.pa/sites/default/files/2021-07/LeyOrganica.pdf` (1.9MB, ~626 chunks)
- **5 leyes adicionales** generadas con texto legal real (dominio publico):
  - Ley 6 de 2002 — Transparencia y Acceso a la Informacion
  - Ley 29 de 2002 — Regimen Juridico de la Universidad de Panama
  - Ley 42 de 2012 — Sistema Penitenciario
  - DE 356 de 2020 — Reglamento de Teletrabajo
  - Ley 187 de 2020 — Proteccion de Datos Personales
- **ChromaDB**: 651 chunks de 6 documentos indexados
- **Script generador**: `backend/scripts/generar_datos_prueba.py` con fpdf2 + DejaVu fonts (Unicode)
- Eliminados los 3 PDFs ficticios originales (IFARHU 2017, Datos 2020, Trabajo)
- Actualizada lista de documentos en backend (`routes/documents.py`) y frontend (`Sidebar.tsx`)

---

## [0.3.0] — 2026-04-18

### Migracion Streamlit → React + FastAPI

- **Removido**: Carpeta `normativaup_app/` con UI Streamlit completa
- **Arquitectura nueva**:
  - `backend/` — FastAPI (Python) con `/api/chat`, `/api/categories`, `/api/documents`, `/health`
  - `frontend/` — React 19 + Vite 8 + TypeScript + Tailwind v4
- **Backend**:
  - `main.py` — App FastAPI con CORS, security headers, rate limiting
  - `models.py` — Pydantic schemas con validacion
  - `routes/chat.py` — POST /api/chat, GET /api/categories
  - `routes/documents.py` — GET /api/documents
  - `services/rag.py` — Orquestacion RAG (OpenAI + ChromaDB)
  - `app/config/settings.py` — Configuracion centralizada
  - `app/src/retrieval/vector_store.py` — Busqueda semantica
  - `app/src/ingestion/document_loader.py` — Carga de PDFs
  - Proxy Vite: `/api` → `http://localhost:8000`
- **Frontend** — Estructura:
  - `App.tsx` — Layout principal con state management + localStorage persistence
  - `Sidebar.tsx` — Barra lateral navy colapsable con categorias, historial, idioma
  - `ChatArea.tsx` — Area de chat con input bottom-bar
  - `WelcomeScreen.tsx` — Pantalla bienvenida con sugerencias
  - `MessageBubble.tsx` — Burbujas user/assistant con boton copiar
  - `ChatComponents.tsx` — ConfidenceBadge + SourcesPanel
  - `api.ts` — Cliente fetch al backend
  - `types.ts` — Tipos TypeScript
  - `index.css` — Tailwind v4 + design system completo

### Design System — El Jurisconsulto Digital

- **Paleta CSS**: midnight `#002046`, navy `#1B365D`, gold `#775A19`, cream `#FCFBF7`, paper `#FFFFFF`, section `#E8ECF2`
- **Fuentes**: Newsreader (serif headings), Inter (sans UI)
- **Sidebar**:
  - Fondo navy con botones `rgba(255,255,255,0.08)`
  - Radio de idioma con highlight gold en seleccion
  - Categorias con iconos emoji
  - Historial con boton X para eliminar items
  - Boton colapsar sidebar
  - Disclaimer con `bg-black/15`
- **Chat input**: Fondo cream `#F0F0EB`, input con `bg-paper`, boton enviar midnight
- **Welcome**: Icono SVG de balanza, tipografia serif Newsreader, cards hover con shadow
- **Messages**: Animacion fade-in, badge AI con dot gold, copiar boton en hover
- **Confidence**: Colores semanticos success/warning/error con barra animada
- **Sources**: `details/summary` con chevron animado

### Persistencia (localStorage)

- `normativaup_messages` — Mensajes del chat
- `normativaup_history` — Historial de consultas
- `normativaup_language` — Idioma seleccionado
- Carga automatica al abrir, guarda en cada cambio

---

## [0.2.0] — 2026-04-18

### Iteraciones UI Streamlit (DEPRECATED)

- UI inicial pesada estilo "Jurisconsulto Digital" con hero banner
- Simplificacion a estilo Claude/GPT minimal
- Sidebar con `st.sidebar` nativo
- Paleta de 3 blancos unificados: `rgba(255,255,255,0.88)` texto, `rgba(255,255,255,0.45)` muted, `rgba(255,255,255,0.08)` botones
- Radio de idioma con highlight gold
- Chat input bottom-bar con fondo cream
- Estas iteraciones fueron reemplazadas por la migracion a React

---

## [0.1.0] — 2026-04-18

### Prototipo Inicial — Streamlit

- Proyecto creado como `normativaup_app/`
- **Pipeline RAG**: PDF → pypdf → RecursiveCharacterTextSplitter → ChromaDB → OpenAI GPT-4o
- **Embeddings**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- **3 PDFs de prueba** generados con texto ficticio
- **Configuracion**: `.env` con OPENAI_API_KEY, `config/settings.py`
- **Vector store**: ChromaDB persistente en `data/vector_store/`
- **Streamlit UI**: `src/ui/app.py` con chat, sidebar, categorias, idioma, confianza, fuentes