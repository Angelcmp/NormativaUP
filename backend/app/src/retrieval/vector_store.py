"""
Creador de base de datos vectorial para consultas legales
Soporta OpenAI embeddings (cloud, low memory) y sentence-transformers (local)
"""
from pathlib import Path
from typing import List, Optional
import os
import shutil

from langchain_chroma import Chroma
from langchain_core.documents import Document
from loguru import logger

from app.config.settings import (
    VECTOR_STORE_DIR,
    EMBEDDING_MODEL,
    EMBEDDING_PROVIDER,
    TOP_K_RETRIEVAL,
)


def _create_embeddings():
    if EMBEDDING_PROVIDER == "openai":
        from langchain_openai import OpenAIEmbeddings
        logger.info(f"Using OpenAI embeddings: {EMBEDDING_MODEL}")
        return OpenAIEmbeddings(model=EMBEDDING_MODEL)
    else:
        from langchain_huggingface import HuggingFaceEmbeddings
        from app.config.settings import MODEL_CACHE_DIR
        logger.info(f"Using local embeddings: {EMBEDDING_MODEL}")
        return HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            cache_folder=str(MODEL_CACHE_DIR),
        )


class BaseDatosVectorial:
    """Gestor de la base de datos vectorial para documentos legales."""
    
    def __init__(
        self,
        modelo_embeddings: str = EMBEDDING_MODEL,
        persistencia: str = str(VECTOR_STORE_DIR)
    ):
        self.modelo_embeddings = modelo_embeddings
        self.persistencia = persistencia
        self.embeddings = None
        self.vectorstore = None
        self._inicializar_embeddings()
    
    def _inicializar_embeddings(self):
        """Inicializa el modelo de embeddings."""
        try:
            self.embeddings = _create_embeddings()
            logger.info(f"Embeddings inicializados: {self.modelo_embeddings}")
        except Exception as e:
            logger.error(f"Error al inicializar embeddings: {e}")
            raise
    
    def crear_o_cargar(
        self,
        documentos: List[Document],
        nombre_coleccion: str = "leyes_panama",
        recargar: bool = False
    ) -> Chroma:
        """Crea o carga la base de datos vectorial."""
        
        if recargar and os.path.exists(self.persistencia):
            shutil.rmtree(self.persistencia)
            logger.info("Base de datos vectorial existente eliminada")
        
        chroma_db_exists = os.path.exists(os.path.join(self.persistencia, "chroma.sqlite3"))
        
        if chroma_db_exists and not recargar and not documentos:
            logger.info("Cargando base de datos vectorial existente...")
            self.vectorstore = Chroma(
                persist_directory=self.persistencia,
                embedding_function=self.embeddings,
                collection_name=nombre_coleccion
            )
        else:
            if not documentos:
                logger.warning("No hay documentos para indexar y no existe base previa")
                return self.vectorstore
            
            if chroma_db_exists:
                logger.info("Agregando documentos a base de datos existente...")
                existing = Chroma(
                    persist_directory=self.persistencia,
                    embedding_function=self.embeddings,
                    collection_name=nombre_coleccion
                )
                existing.add_documents(documentos)
                self.vectorstore = existing
            else:
                logger.info("Creando nueva base de datos vectorial...")
                self.vectorstore = Chroma.from_documents(
                    documents=documentos,
                    embedding=self.embeddings,
                    persist_directory=self.persistencia,
                    collection_name=nombre_coleccion
                )
        
        count = self.vectorstore._collection.count()
        logger.info(f"Base de datos lista con {count} documentos")
        return self.vectorstore
    
    def buscar(
        self,
        query: str,
        k: int = TOP_K_RETRIEVAL,
        filtro: Optional[dict] = None
    ) -> List[Document]:
        """Busca documentos relevantes usando búsqueda semántica."""
        if not self.vectorstore:
            logger.error("Base de datos vectorial no inicializada")
            return []
        
        resultados = self.vectorstore.similarity_search_with_score(
            query=query,
            k=k,
            filter=filtro
        )
        
        documentos_encontrados = []
        for doc, score in resultados:
            doc.metadata["score"] = float(score)
            documentos_encontrados.append(doc)
        
        logger.info(f"Encontrados {len(documentos_encontrados)} documentos para: {query}")
        return documentos_encontrados
    
    def buscar_por_tipo(self, query: str, tipo: str, k: int = 3) -> List[Document]:
        """Busca filtrando por tipo de documento."""
        filtro = {"tipo": tipo}
        return self.buscar(query, k=k, filtro=filtro)
    
    def buscar_por_anio(self, query: str, anio: str, k: int = 3) -> List[Document]:
        """Busca filtrando por año."""
        filtro = {"anio": anio}
        return self.buscar(query, k=k, filtro=filtro)
    
    def obtener_estadisticas(self) -> dict:
        """Obtiene estadísticas de la base de datos."""
        if not self.vectorstore:
            return {"error": "Base de datos no inicializada"}
        
        total_docs = self.vectorstore._collection.count()
        
        return {
            "total_documentos": total_docs,
            "modelo_embeddings": self.modelo_embeddings,
            "proveedor_embeddings": EMBEDDING_PROVIDER,
            "ruta_persistencia": self.persistencia
        }


def crear_base_datos(documentos: List[Document]) -> BaseDatosVectorial:
    """Función de conveniencia para crear la base de datos."""
    db = BaseDatosVectorial()
    db.crear_o_cargar(documentos)
    return db


def cargar_base_datos() -> BaseDatosVectorial:
    """Función de conveniencia para cargar la base de datos existente."""
    db = BaseDatosVectorial()
    db.crear_o_cargar([])
    return db


if __name__ == "__main__":
    from app.src.ingestion.document_loader import cargar_documentos
    from app.config.settings import RAW_DATA_DIR
    
    logger.info("Creando base de datos vectorial...")
    documentos = cargar_documentos(str(RAW_DATA_DIR))
    db = crear_base_datos(documentos)
    stats = db.obtener_estadisticas()
    logger.info(f"Estadisticas: {stats}")