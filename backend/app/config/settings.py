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
MODEL_CACHE_DIR = BASE_DIR / "data" / "model_cache"

for dir_path in [DATA_DIR, VECTOR_STORE_DIR, RAW_DATA_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# OpenAI (activo)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = "gpt-4o"

# Groq (alternativo - para futuro)
# GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
# LLM_MODEL = "llama-3.1-70b-versatile"

# Ollama (alternativo - para futuro)
# OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# Anthropic (alternativo - para futuro)
# ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

TOP_K_RETRIEVAL = 5

CONFIDENCE_THRESHOLD_HIGH = 0.8
CONFIDENCE_THRESHOLD_MEDIUM = 0.5