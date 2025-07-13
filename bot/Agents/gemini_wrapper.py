import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")

def load_prompt_template(filepath: str) -> str:
    with open(filepath, "r", encoding="utf-8") as file:
        return file.read()

def ask_gemini_from_file(context: str, prompt_path: str) -> str:
    template = load_prompt_template(prompt_path)
    filled_prompt = template.replace("{context}", context)
    response = model.generate_content(filled_prompt)
    return response.text
