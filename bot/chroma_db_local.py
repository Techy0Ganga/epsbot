# create_db_local.py

import os
from langchain_community.vectorstores import Chroma
# Import your document loaders and embedding functions
from services.embedding_api import BGEAPIEmbeddings
from utils.pdf_loader import load_pdf_documents_with_metadata

print("Starting database creation...")

# --- 1. Load and process your documents ---
pdf_path = "test_pdfs/Comparison_with_human.pdf" # Make sure this path is correct
docs = load_pdf_documents_with_metadata(pdf_path)
# texts = [d.page_content for d in docs] # Adapt as needed

# --- 2. Initialize your embedding function ---
# Make sure your HF_API_KEY is available locally (e.g., in a .env file)
embedder = BGEAPIEmbeddings(api_key=os.getenv("HF_API_KEY"))

# --- 3. Create and persist the database ---
# This will create a folder named 'chroma_db_files'
persistent_db = Chroma.from_documents(
    documents=docs,
    embedding=embedder,
    persist_directory="./chroma_db_files" 
)

print("Database created successfully in the 'bot/chroma_db_files' folder.")