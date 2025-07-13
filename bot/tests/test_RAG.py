import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))


from bot.utils.pdf_loader import load_pdf_documents_with_metadata
from bot.services.vector_store import VectorStoreService
# from bot.Agents.gemini_wrapper import ask_gemini

# Load PDF content
docs = load_pdf_documents_with_metadata("./test_pdfs/Comparison_with_human.pdf")

# Initialize vector store and load docs
vs = VectorStoreService()
vs.load_documents([d.page_content for d in docs], metadata=[d.metadata for d in docs])

# Run a test query
results = vs.query("What is this paper about?")
print("Top Result:", results[0].page_content[:200])  # Just show first 200 chars

# Query RAG
query = "What is this paper about?"
results = vs.query(query)

# Combine retrieved documents
retrieved_text = "\n\n".join([doc.page_content for doc in results])

from bot.Agents.gemini_wrapper import ask_gemini_from_file

# Run RAG query
query = "What is this paper about?"
results = vs.query(query)
retrieved_text = "\n\n".join([doc.page_content for doc in results])

# Path to your prompt
prompt_path = "./prompts/rag_template.txt"

# Generate response
gemini_response = ask_gemini_from_file(retrieved_text, prompt_path)

print("🧠 Gemini says:\n", gemini_response)

