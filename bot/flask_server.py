from flask import Flask, request, jsonify
from services.vector_store import VectorStoreService
from Agents.gemini_wrapper import ask_gemini # We'll need a more generic Gemini function
import os

# --- Initialization ---
# This service is now only for students, but we initialize it for the app.
vector_store = VectorStoreService()
# It's better to load documents from a config or on-demand
# For now, we'll keep the placeholder.
vector_store.load_documents(["The controller is the brain of the robot...", "Sensors collect input..."])

app = Flask(__name__)

# --- Unified Endpoint with Role-Based Logic ---
@app.route('/ask', methods=['POST'])
def ask():
    """
    This single endpoint handles requests for both students and mentors.
    It routes the request to the correct logic based on the 'role' provided.
    """
    data = request.get_json()
    role = data.get('role')
    question = data.get('question')

    if not role or not question:
        return jsonify({'error': 'Missing role or question in request'}), 400

    # =================================================================
    # STUDENT LOGIC: Uses RAG to answer questions about documents
    # =================================================================
    if role == 'student':
        chat_history = data.get('chat_history', '')

        # 1. Perform RAG search to find relevant context from documents
        docs = vector_store.query(question)
        rag_context = "\n".join([doc.page_content for doc in docs])

        # 2. Build a prompt for a Q&A/tutoring scenario
        # Using a dedicated prompt template for students is recommended
        student_prompt = (
            "You are a helpful tutor. Answer the student's question based on the provided context from their course material.\n\n"
            f"Previous conversation:\n{chat_history}\n\n"
            f"Context from documents:\n{rag_context}\n\n"
            f"Question: {question}"
        )

        # 3. Ask Gemini
        # This function should just take the final prompt string
        answer = ask_gemini(student_prompt)
        return jsonify({'answer': answer})

    # =================================================================
    # MENTOR LOGIC: Uses provided data context, NO RAG
    # =================================================================
    elif role == 'mentor':
        system_prompt = data.get('system_prompt')
        data_context = data.get('data_context')

        if not system_prompt or not data_context:
            return jsonify({'error': 'Mentor requests require system_prompt and data_context'}), 400

        # 1. For mentors, we DO NOT perform a RAG search. The context is provided directly.
        # We build a precise prompt using the structured data from the backend.
        mentor_prompt = (
            f"{system_prompt}\n\n"
            "-------------------- STUDENT DATA --------------------\n"
            f"{data_context}\n"
            "------------------------------------------------------\n\n"
            f"Mentor's Question: {question}"
        )

        # 2. Ask Gemini
        answer = ask_gemini(mentor_prompt)
        return jsonify({'answer': answer})

    # =================================================================
    # Fallback for unknown roles
    # =================================================================
    else:
        return jsonify({'error': f'Invalid role specified: {role}'}), 400


if __name__ == '__main__':
    app.run(port=8000, debug=True)