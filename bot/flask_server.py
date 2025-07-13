from flask import Flask, request, jsonify
from services.vector_store import VectorStoreService
from Agents.gemini_wrapper import ask_gemini_from_file
import os

# Initialize once
vector_store = VectorStoreService()
vector_store.load_documents(["The controller is the brain of the robot...", "Sensors collect input..."])  # Replace with actual docs

# Setup Flask app
app = Flask(__name__)

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    question = data.get('question')
    memory = data.get('memory', '')
    user_id = data.get('user_id')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    # 🔍 RAG Context
    docs = vector_store.query(question)
    rag_context = "\n".join([doc.page_content for doc in docs])

    # 📄 Build prompt context
    full_context = f"{memory}\n\nRAG:\n{rag_context}\n\nQ: {question}"

    # 🤖 Ask Gemini
    prompt_path = os.path.join("prompts", "rag_template.txt")
    answer = ask_gemini_from_file(full_context, prompt_path)

    return jsonify({'answer': answer})


if __name__ == '__main__':
    app.run(port=8000, debug=True)
