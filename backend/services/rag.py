"""
RAG service — orchestrates vector search and LLM generation
"""
from typing import List, Optional

from openai import OpenAI
from langchain_core.documents import Document

from app.config.settings import OPENAI_API_KEY, OPENAI_MODEL, TOP_K_RETRIEVAL, OPENAI_MODELS
from app.src.retrieval.vector_store import BaseDatosVectorial

from models import SourceInfo, ConfidenceInfo

SYSTEM_PROMPT = """Eres NormativaUP, asistente de inteligencia artificial especializado en leyes,
decretos, resoluciones y normas de la Republica de Panama.

Tu funcion es ayudar a los ciudadanos a encontrar informacion legal de manera clara y precisa.

INSTRUCCIONES IMPORTANTES:
1. Responde SIEMPRE en espanol, a menos que el usuario pida explicitamente ingles (EN).
2. Cuando respondas en espanol, usa un tono profesional pero accesible.
3. Cuando respondas en ingles, se equally professional and accessible.
4. CITA SIEMPRE las fuentes oficiales de donde obtienes la informacion.
5. Si no tienes suficiente informacion para responder, DICE CLARAMENTE que no tienes esa informacion.
6. NUNCA inventes articulos, numeros de ley o contenido legal que no exista en los documentos.
7. Si la respuesta proviene de un documento especifico, menciona el numero de ley, ano y tipo de documento.
8. Proporciona el nivel de confianza de tu respuesta basado en la relevancia de los documentos encontrados.

FORMATO DE RESPUESTA:
- Responde de manera clara y estructurada.
- Incluye una seccion de "FUENTES" al final con las referencias exactas.
- Indica el "NIVEL DE CONFIANZA" como porcentaje (alto >80%, medio 50-80%, bajo <50%).

Idioma de respuesta: {idioma}"""


class RAGService:
    def __init__(self):
        self.vector_db: Optional[BaseDatosVectorial] = None
        self.client: Optional[OpenAI] = None
        self.initialized = False

    def initialize(self):
        if OPENAI_API_KEY and OPENAI_API_KEY != "sk-tu-api-key-aqui":
            self.client = OpenAI(api_key=OPENAI_API_KEY)

        try:
            self.vector_db = BaseDatosVectorial()
            self.vector_db.crear_o_cargar([])
            if not self.vector_db.vectorstore:
                from app.src.ingestion.document_loader import cargar_documentos
                from app.config.settings import RAW_DATA_DIR
                documentos = cargar_documentos(str(RAW_DATA_DIR))
                if documentos:
                    self.vector_db.crear_o_cargar(documentos)
            self.initialized = True
        except Exception as e:
            import logging
            logging.getLogger("normativaup").error(f"Failed to initialize vector store: {e}")
            self.initialized = False

    def search(self, query: str, k: int = TOP_K_RETRIEVAL) -> List[Document]:
        if not self.vector_db or not self.vector_db.vectorstore:
            return []
        return self.vector_db.buscar(query, k=k)

    def generate(self, query: str, documents: List[Document], language: str = "es", model: str = "gpt-4o") -> str:
        if not self.client:
            return "Error: OPENAI_API_KEY no configurada"
        if not documents:
            return ("No encontre documentos relevantes. Intente reformular su pregunta."
                    if language == "es" else "No relevant documents found.")

        # Validate model
        valid_models = [m["id"] for m in OPENAI_MODELS]
        if model not in valid_models:
            model = "gpt-4o"

        context = "\n\n".join([
            f"--- Documento {i+1} ---\nTipo: {doc.metadata.get('tipo', '')}\n"
            f"Numero: {doc.metadata.get('numero', '')}\nAno: {doc.metadata.get('anio', '')}\n\n"
            f"{doc.page_content[:1500]}"
            for i, doc in enumerate(documents)
        ])

        prompt = SYSTEM_PROMPT.format(idioma=language) + f"""

CONSULTA DEL USUARIO: {query}

DOCUMENTOS DE REFERENCIA:
{context}

Responde basandote unicamente en los documentos de referencia."""

        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": query},
                ],
                temperature=0.3,
                max_tokens=2000,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"

    def calculate_confidence(self, documents: List[Document]) -> ConfidenceInfo:
        if not documents:
            return ConfidenceInfo(level="bajo", percentage=0, source_count=0)
        scores = [doc.metadata.get("score", 1.0) for doc in documents]
        avg = sum(scores) / len(scores)
        # ChromaDB L2 distance: lower is better (<0.5=alto, 0.5-1.0=medio, >1.0=bajo)
        # Convert distance to a 0-100 confidence percentage (inverted)
        percentage = max(0, min(100, int((1 / (1 + avg)) * 100)))
        # Use percentage thresholds for level display (50% = medio boundary)
        if percentage >= 50:
            return ConfidenceInfo(level="alto", percentage=percentage, source_count=len(documents))
        elif percentage >= 40:
            return ConfidenceInfo(level="medio", percentage=percentage, source_count=len(documents))
        return ConfidenceInfo(level="bajo", percentage=percentage, source_count=len(documents))

    def format_sources(self, documents: List[Document]) -> List[SourceInfo]:
        return [
            SourceInfo(
                titulo=doc.metadata.get("titulo", "Documento desconocido"),
                numero=doc.metadata.get("numero", "Sin numero"),
                anio=doc.metadata.get("anio", "Sin ano"),
                tipo=doc.metadata.get("tipo", "Documento"),
                fragmento=doc.page_content[:140].replace("\n", " ") + "...",
            )
            for doc in documents
        ]


rag_service = RAGService()