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
        # Initialize your embedding function as before
        self.embedder = BGEAPIEmbeddings(api_key=os.getenv("HF_API_KEY"))

        # Get the ChromaDB URL from your environment variables
        CHROMA_HOST = os.getenv("CHROMA_DB_URL")
        
        # Create a client that points to your live ChromaDB on Hugging Face
        chroma_client = chromadb.HttpClient(host=CHROMA_HOST, port=8000)

        # Connect to your existing collection using the client
        self.db = Chroma(
            client=chroma_client,
            collection_name="my_collection",  # Use the name of the collection you created
            embedding_function=self.embedder,
        )
        print("Successfully connected to remote ChromaDB.")



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
        """
        This method now ADDS documents to the EXISTING remote database.
        """
        if not self.db:
            raise ValueError("Database not initialized. Cannot add documents.")

        unique_texts = self.deduplicate_documents(texts)
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        
        if metadata:
            docs = [
                Document(page, metadata=meta)
                for page, meta in zip(unique_texts, metadata)
            ]
        else:
            docs = splitter.create_documents(unique_texts)
        
        # This adds the new documents to your remote ChromaDB
        self.db.add_documents(docs)
        print(f"Successfully added {len(docs)} new document chunks to the remote database.")

    def query(self, query_text, top_k :int = 3):
        return self.db.similarity_search(query_text, k=top_k)