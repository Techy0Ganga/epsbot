import pytest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from bot.services.vector_store import VectorStoreService
from bot.utils.pdf_loader import load_pdf_documents_with_metadata


@pytest.fixture(scope="module")
def vector_service():
    assert os.getenv("HF_TOKEN"), "HF_TOKEN must be set in your environment"
    return VectorStoreService()


@pytest.fixture(scope="module")
def pdf_docs():
    path = "bot/test_pdfs/Comparison_with_human.pdf"
    assert os.path.exists(path), f"Test PDF not found at {path}"
    return load_pdf_documents_with_metadata(path)


def test_load_documents(vector_service, pdf_docs):
    texts = [doc.page_content for doc in pdf_docs]
    metadata = [doc.metadata for doc in pdf_docs]
    
    vector_service.load_documents(texts, metadata=metadata)
    assert vector_service.db is not None


def test_vector_search(vector_service):
    query = "What are actuators?"
    results = vector_service.query(query, top_k=2)

    assert results, "No results returned from similarity search"

    for doc in results:
        assert isinstance(doc.page_content, str)
        print("\n🔍 Top result:\n", doc.page_content[:300])