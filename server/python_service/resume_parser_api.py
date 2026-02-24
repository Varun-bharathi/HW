from flask import Flask, request, jsonify
import pdfplumber
from docx import Document
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

import os
import tempfile

def extract_text(file):
    temp_path = None
    try:
        # Save to temp file to ensure pdfplumber/docx works reliably
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            file.save(temp)
            temp_path = temp.name

        text = ""
        if temp_path.endswith(".pdf"):
            with pdfplumber.open(temp_path) as pdf:
                text = " ".join(page.extract_text() or "" for page in pdf.pages)
        elif temp_path.endswith(".docx"):
            doc = Document(temp_path)
            text = " ".join(p.text for p in doc.paragraphs)
            
        return text
    except Exception as e:
        logging.error(f"Error extracting text: {e}")
        return ""
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass
    return ""

def calculate_score(resume_text, jd_text):
    if not resume_text or not jd_text:
        return 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        vectors = vectorizer.fit_transform([resume_text, jd_text])
        score = cosine_similarity(vectors[0], vectors[1])[0][0]
        return round(score * 100, 2)
    except Exception as e:
        logging.error(f"Error calculating score: {e}")
        return 0.0

@app.route("/parse-resume", methods=["POST"])
def parse_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400
    
    resume = request.files["resume"]
    jd_text = request.form.get("job_description", "")

    resume_text = extract_text(resume)
    score = calculate_score(resume_text, jd_text)

    return jsonify({
        "resume_score": score,
        "extracted_text_preview": resume_text[:200]
    })

if __name__ == "__main__":
    print("Starting Resume Parser API on port 5001...")
    app.run(port=5001, debug=True)
