from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from services.embedding_api import BGEAPIEmbeddings
import os

class VectorStoreService:
    def __init__(self):
        self.embedder = BGEAPIEmbeddings(api_key=os.getenv("HF_API_KEY"))
        self.db = None



    def deduplicate_documents(self, texts):
        seen = set()
        unique_texts = []

        for text in texts:
            normalized = " ".join(sorted(text.strip().splitlines()))
            if normalized not in seen:
                seen.add(normalized)
                unique_texts.append(text)

        return unique_texts
    


    def load_documents(self, texts, metadata=None):
        self.texts = self.deduplicate_documents(texts)
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        if metadata:
            docs = [
                Document(page, metadata=meta)
                for page, meta in zip(self.texts, metadata)
            ]
        else:
            docs = splitter.create_documents(self.texts)
        
        self.db = Chroma.from_documents(docs, embedding=self.embedder)

    def query(self, query_text, top_k :int = 3):
        return self.db.similarity_search(query_text, k=top_k)