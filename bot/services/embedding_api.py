import os
import requests
from langchain_core.embeddings import Embeddings

HF_TOKEN = os.getenv("HF_TOKEN")
HF_API_URL = "https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5"

HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"}


class BGEAPIEmbeddings(Embeddings):
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("HF_TOKEN")
        self.api_url = "https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5"
        self.headers = {"Authorization": f"Bearer {self.api_key}"}

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed(text)

    def _embed(self, text: str) -> list[float]:
        response = requests.post(
            self.api_url,
            headers=self.headers,
            json={"inputs": text}
        )
        # print(response.status_code)
        response.raise_for_status()
        embedding = response.json()
        assert isinstance(embedding, list) and isinstance(embedding[0], float), "Unexpected response format"
        return embedding