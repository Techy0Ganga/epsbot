from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from services.embedding_api import BGEAPIEmbeddings
import os

class VectorStoreService:
    def __init__(self):
        self.embedder = BGEAPIEmbeddings(api_key=os.getenv("HF_API_KEY"))
        self.db = None

    def load_documents(self, texts):
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        docs = splitter.create_documents(texts)
        self.db = Chroma.from_documents(docs, embedding=self.embedder)

    def query(self, query_text, top_k :int = 5):
        return self.db.similarity_search(query_text, k=top_k)