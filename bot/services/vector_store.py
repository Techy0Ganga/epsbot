from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
import chromadb

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from bot.services.embedding_api import BGEAPIEmbeddings

class VectorStoreService:
    def __init__(self):
        self.embedder = BGEAPIEmbeddings(api_key=os.getenv("HF_API_KEY"))
        
        # This is the path where your disk is mounted on Render
        db_path = "/data/chroma_db"

        # Load the database from the files on the disk
        self.db = Chroma(
            persist_directory=db_path,
            embedding_function=self.embedder
        )
        print("Successfully loaded ChromaDB from disk.")



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