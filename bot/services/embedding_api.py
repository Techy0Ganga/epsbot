import os
import requests
from langchain_core.embeddings import Embeddings

HF_TOKEN = os.getenv("HF_TOKEN")
HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"}


class BGEAPIEmbeddings(Embeddings):
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed(text)

    def _embed(self, text: str) -> list[float]:
        response = requests.post(
            HF_API_URL,
            headers=HEADERS,
            json={"inputs": text}
        )
        response.raise_for_status()
        return response.json()[0]["embedding"]