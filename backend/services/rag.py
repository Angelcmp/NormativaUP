"""
RAG service — orchestrates vector search and LLM generation
"""
from typing import List, Optional

from openai import OpenAI
from langchain_core.documents import Document

from app.config.settings import OPENAI_API_KEY, OPENAI_MODEL, TOP_K_RETRIEVAL, OPENAI_MODELS
from app.src.retrieval.vector_store import BaseDatosVectorial

from models import SourceInfo, ConfidenceInfo

SYSTEM_PROMPT_ES = """Eres NormativaUP, asistente de inteligencia artificial especializado en leyes,
decretos, resoluciones y normas de la Republica de Panama.

Tu funcion es ayudar a los ciudadanos a encontrar informacion legal de manera clara y precisa.

INSTRUCCIONES IMPORTANTES:
1. Responde SIEMPRE en espanol.
2. Usa un tono profesional pero accesible.
3. CITA SIEMPRE las fuentes oficiales de donde obtienes la informacion.
4. Si no tienes suficiente informacion para responder, indica claramente que no tienes esa informacion.
5. NUNCA inventes articulos, numeros de ley o contenido legal que no exista en los documentos.

FORMATO DE RESPUESTA:
- Responde de manera clara y estructurada.
- Incluye una seccion de "FUENTES" al final con las referencias exactas.
- Indica el "NIVEL DE CONFIANZA" como porcentaje (alto >80%, medio 50-80%, bajo <50%)."""

SYSTEM_PROMPT_EN = """You are NormativaUP, an artificial intelligence assistant specialized in laws,
decrees, resolutions and regulations of the Republic of Panama.

Your job is to help citizens find legal information clearly and accurately.

IMPORTANT INSTRUCTIONS:
1. ALWAYS respond in English.
2. Use a professional but accessible tone.
3. ALWAYS CITE the official sources where you get the information.
4. If you don't have enough information to answer, clearly state that you don't have that information.
5. NEVER invent articles, law numbers or legal content that does not exist in the documents.

RESPONSE FORMAT:
- Respond clearly and in a structured way.
- Include a "SOURCES" section at the end with exact references.
- Indicate the "CONFIDENCE LEVEL" as a percentage (high >80%, medium 50-80%, low <50%)."""


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

        valid_models = [m["id"] for m in OPENAI_MODELS]
        if model not in valid_models:
            model = "gpt-4o"

        context = "\n\n".join([
            f"--- Documento {i+1} ---\nTipo: {doc.metadata.get('tipo', '')}\n"
            f"Numero: {doc.metadata.get('numero', '')}\nAno: {doc.metadata.get('anio', '')}\n\n"
            f"{doc.page_content[:1500]}"
            for i, doc in enumerate(documents)
        ])

        system_prompt = SYSTEM_PROMPT_ES if language == "es" else SYSTEM_PROMPT_EN
        prompt = system_prompt + f"""

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

    def generate_stream(self, query: str, documents: List[Document], language: str = "es", model: str = "gpt-4o"):
        if not self.client:
            yield "Error: OPENAI_API_KEY no configurada"
            return
        if not documents:
            yield "No encontre documentos relevantes. Intente reformular su pregunta." if language == "es" else "No relevant documents found. Try rephrasing your question."
            return

        valid_models = [m["id"] for m in OPENAI_MODELS]
        if model not in valid_models:
            model = "gpt-4o"

        context = "\n\n".join([
            f"--- Documento {i+1} ---\nTipo: {doc.metadata.get('tipo', '')}\n"
            f"Numero: {doc.metadata.get('numero', '')}\nAno: {doc.metadata.get('anio', '')}\n\n"
            f"{doc.page_content[:1500]}"
            for i, doc in enumerate(documents)
        ])

        system_prompt = SYSTEM_PROMPT_ES if language == "es" else SYSTEM_PROMPT_EN
        prompt = system_prompt + f"""

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
                stream=True,
            )
            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            yield f"Error: {str(e)}"

    def calculate_confidence(self, documents: List[Document]) -> ConfidenceInfo:
        if not documents:
            return ConfidenceInfo(level="bajo", percentage=0, source_count=0)
        scores = [doc.metadata.get("score", 1.0) for doc in documents]
        avg = sum(scores) / len(scores)
        # ChromaDB L2 distance: lower = more similar (better match)
        # distance < 0.5 = alto, 0.5-1.0 = medio, > 1.0 = bajo
        # Convert distance to confidence: invert the scale (low distance = high confidence)
        if avg < 0.5:
            percentage = int((1 - avg) * 100)  # 0-50 -> 50-100%
        elif avg < 1.0:
            percentage = int((1 - avg) * 100)  # 0.5-1.0 -> 0-50%
        else:
            percentage = max(0, int(50 - (avg - 1.0) * 20))  # >1.0 -> 0-20%
        percentage = max(0, min(100, percentage))
        if percentage >= 50:
            return ConfidenceInfo(level="alto", percentage=percentage, source_count=len(documents))
        elif percentage >= 30:
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