# import os
# from langchain_community.vectorstores import Chroma
# from langchain.document_loaders import PyPDFLoader
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from typing import Optional
# from embedding_api import BGEAPIEmbeddings
import fitz  # PyMuPDF
from langchain.docstore.document import Document

path =  "../test_pdfs/Comparison_with_human.pdf"



def load_pdf_texts(pdf_path):
    """Returns a list of text strings, one per page."""
    doc = fitz.open(pdf_path)
    return [page.get_text() for page in doc]

def load_pdf_documents_with_metadata(pdf_path):
    """Returns LangChain Document objects with page metadata."""
    doc = fitz.open(pdf_path)
    return [
        Document(page.get_text(), metadata={"page": i+1})
        for i, page in enumerate(doc)
    ]

        
        



