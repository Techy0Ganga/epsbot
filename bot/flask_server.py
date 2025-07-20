from flask import Flask, request, jsonify
from services.vector_store import VectorStoreService
from Agents.gemini_wrapper import ask_gemini
import os
import traceback # Import traceback to print detailed exceptions


# --- Initialization ---
vector_store = VectorStoreService()
vector_store.load_documents([
    "Based on your course materials, a controller is the 'brain' of the robot. This means it's the central processing unit responsible for receiving input from sensors, making decisions based on that input, and sending commands to other parts of the robot to execute those decisions. It acts as the central decision-making and control center. However, that's a simplified view. A controller's function is much more complex and involves: 1. Input Processing: Taking raw sensor data (e.g., a robot arm's position, a camera's image) and cleaning it up for use in decision-making. 2. Decision Making: Using processed sensor data and pre-programmed instructions, the controller determines the robot's next actions. This could involve complex calculations and logical comparisons to achieve a goal (like picking up an object). 3. Output Generation: Sending signals to actuators (the parts that perform actions, like motors or valves) to carry out the decisions. These signals precisely control the actuators' movements. 4. Feedback Control (Often): Many controllers use feedback loops. They constantly monitor the results of their actions via sensors and adjust actuator signals to maintain accuracy and stability, similar to a thermostat adjusting heating/cooling based on temperature. 5. Types of Controllers: Different types of controllers exist, such as PID controllers (common for basic control), fuzzy logic controllers (handling uncertainty), and neural network controllers (capable of learning and adaptation), each with its strengths and weaknesses. In short, the controller isn't simply a passive receiver and dispatcher; it actively processes information and makes crucial decisions governing the robot's behavior. A thorough understanding requires exploring control theory and programming."
])

app = Flask(__name__)

# --- Helper function to load the prompt template ---
def load_prompt_from_file(filepath: str) -> str:
    """Loads a prompt template from a given file path."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: Prompt template file not found at {filepath}")
        return "Please answer the following question based on the provided context.\n\nContext: {context}\n\nQuestion: {question}"


# --- Query Transformation Function ---
def transform_query(chat_history: str, follow_up_question: str) -> str:
    """
    Uses the LLM to transform a follow-up question into a standalone query.
    """
    if not chat_history:
        return follow_up_question

    transformation_prompt = (
        "Given the following conversation history and a follow-up question, "
        "rephrase the follow-up question to be a standalone question that "
        "can be understood without the chat history. Do not answer the question, "
        "just reformulate it.\n\n"
        f"Chat History:\n{chat_history}\n\n"
        f"Follow-up Question: {follow_up_question}\n\n"
        "Standalone Question:"
    )
    
    standalone_question = ask_gemini(transformation_prompt)
    return standalone_question.strip()


# --- Unified Endpoint with Role-Based Logic ---
@app.route('/ask', methods=['POST'])
def ask():
    # ADDED: Global try-except block to catch all errors and provide detailed logs.
    try:
        data = request.get_json()
        print(f"\n--- NEW REQUEST ---")
        print(f"Received data: {data}")

        role = data.get('role')
        question = data.get('question')

        if not role or not question:
            print("Error: Missing role or question in the request.")
            return jsonify({'error': 'Missing role or question in request'}), 400

        # =================================================================
        # STUDENT LOGIC: Now with detailed logging
        # =================================================================
        if role == 'student':
            chat_history = data.get('chat_history', '')

            print("Step 1: Transforming query...")
            standalone_question = transform_query(chat_history, question)
            print(f"  - Original question: '{question}'")
            print(f"  - Transformed question: '{standalone_question}'")

            print("Step 2: Performing RAG search...")
            docs = vector_store.query(standalone_question)
            rag_context = "\n".join([doc.page_content for doc in docs])
            print(f"  - RAG context found: {'Yes' if rag_context else 'No'}")
            
            if not rag_context:
                rag_context = "No specific context was found in the course material for this question."

            print("Step 3: Loading and formatting prompt from template...")
            prompt_template = load_prompt_from_file(os.path.join("prompts", "rag_template.txt"))
            final_prompt = prompt_template.format(context=rag_context, question=question)

            print("Step 4: Sending request to Gemini...")
            answer = ask_gemini(final_prompt)
            print(f"  - Received answer from Gemini: {'Yes, content received.' if answer and answer.strip() else 'NO, BLANK RESPONSE.'}")
            
            return jsonify({'answer': answer})

        # =================================================================
        # MENTOR LOGIC: Now with detailed logging
        # =================================================================
        elif role == 'mentor':
            system_prompt = data.get('system_prompt')
            data_context = data.get('data_context')

            if not system_prompt or not data_context:
                print("Error: Mentor request missing system_prompt or data_context.")
                return jsonify({'error': 'Mentor requests require system_prompt and data_context'}), 400

            print("Step 1: Formatting mentor prompt...")
            mentor_prompt = (
                f"{system_prompt}\n\n"
                "-------------------- STUDENT DATA --------------------\n"
                f"{data_context}\n"
                "------------------------------------------------------\n\n"
                f"Mentor's Question: {question}"
            )

            print("Step 2: Sending mentor request to Gemini...")
            answer = ask_gemini(mentor_prompt)
            print(f"  - Received answer from Gemini: {'Yes, content received.' if answer and answer.strip() else 'NO, BLANK RESPONSE.'}")

            return jsonify({'answer': answer})

        else:
            print(f"Error: Invalid role specified: {role}")
            return jsonify({'error': f'Invalid role specified: {role}'}), 400

    except Exception as e:
        # This will catch any error and print a detailed traceback to your console.
        print(f"\n!!!! AN UNHANDLED EXCEPTION OCCURRED IN FLASK SERVER !!!!")
        print(traceback.format_exc())
        return jsonify({'error': 'An internal error occurred in the bot server.', 'details': str(e)}), 500


@app.route('/')
def home():
    return "Bot is alive!"


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(port=port, debug=True)