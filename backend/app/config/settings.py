"""
Configuración de la aplicación NormativaUP
Universidad de Panamá - Consulta Legal IA
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent.parent / ".env")

BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "data"
VECTOR_STORE_DIR = DATA_DIR / "vector_store"
RAW_DATA_DIR = DATA_DIR / "raw"

for dir_path in [DATA_DIR, VECTOR_STORE_DIR, RAW_DATA_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# OpenAI (activo)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

OPENAI_MODELS = [
    {"id": "gpt-4o", "name": "GPT-4o", "desc": "Balance calidad/precio", "input": 2.5, "output": 10.0},
    {"id": "gpt-4o-mini", "name": "GPT-4o mini", "desc": "Rapido y economico", "input": 0.15, "output": 0.6},
]

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# Embedding provider: "openai" for cloud (low memory) or "local" for sentence-transformers (high memory)
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "openai")

# Local embeddings (requires ~1GB RAM)
EMBEDDING_MODEL_LOCAL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
MODEL_CACHE_DIR = DATA_DIR / "model_cache"

# OpenAI embeddings (requires only ~100MB RAM)
EMBEDDING_MODEL_OPENAI = "text-embedding-3-small"

EMBEDDING_MODEL = EMBEDDING_MODEL_OPENAI if EMBEDDING_PROVIDER == "openai" else EMBEDDING_MODEL_LOCAL

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

TOP_K_RETRIEVAL = 20

CONFIDENCE_THRESHOLD_HIGH = 0.8
CONFIDENCE_THRESHOLD_MEDIUM = 0.5