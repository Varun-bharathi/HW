import os
from resume_parser_api import extract_text, calculate_score

# Mock class to mimic Flask FileStorage
class MockFile:
    def __init__(self, path):
        self.path = path
        self.filename = os.path.basename(path)

    def read(self):
        with open(self.path, 'rb') as f:
            return f.read()
            
    # pdfplumber needs a path or file-like object. 
    # extract_text in api uses direct file object from flask which is file-like.
    # We should open the file in binary mode.

# Actually extract_text implementation:
# with pdfplumber.open(file) as pdf:
# pdfplumber.open accepts path or file object.

# Test file
test_file_name = "resume-cml3ntcoe000nxvgfso6ffwfx-1769945735720.pdf"
test_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", test_file_name)

print(f"Testing with file: {test_file_path}")

if os.path.exists(test_file_path):
    # pdfplumber.open(path) works. 
    # But our API takes a file object.
    # Let's try passing the path string as if it was the file object? No, API uses file.filename.endswith
    
    # We need to simulate the object passed to extract_text
    class FileObj:
        def __init__(self, path):
            self.filename = path
            self.file_handle = open(path, 'rb')
        
        def read(self, *args):
            return self.file_handle.read(*args)

        def seek(self, *args):
            return self.file_handle.seek(*args)
            
        def tell(self):
            return self.file_handle.tell()

    # API logic reproduction
    try:
        import pdfplumber
        with pdfplumber.open(test_file_path) as pdf:
            text = " ".join(page.extract_text() or "" for page in pdf.pages)
        print(f"Direct pdfplumber extraction length: {len(text)}")
        print(f"Snippet: {text[:100]}")
        
        from resume_parser_api import calculate_score
        jd = "Software Engineer React Node.js TypeScript"
        score = calculate_score(text, jd)
        print(f"Score: {score}")
    except Exception as e:
        print(f"Error testing: {e}")

else:
    print("Test file not found")
