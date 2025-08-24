import fitz  # PyMuPDF

# --- Simple State class for testing ---
class State:
    def _init_(self, pdf_path):
        self.pdf_path = pdf_path
        self.documents = []
        self.errors = []

class PDFIngestionAgent:
    """
    Agent to read PDF content and prepare it for summarization or analysis.
    Extracts only the first 1000 characters of the PDF.
    """
    def _init_(self, pdf_path: str = None):
        self.pdf_path = pdf_path

    def run(self, state):
        """
        state: object with attribute 'pdf_path' or 'pdf_path' passed in constructor.
        Returns extracted text in state.documents (list of one string).
        """
        try:
            pdf_file = getattr(state, "pdf_path", None) or self.pdf_path
            if not pdf_file:
                if not hasattr(state, "errors"):
                    state.errors = []
                state.errors.append("No PDF path provided")
                return state

            # Open PDF and extract text
            doc = fitz.open(pdf_file)
            text = ""
            for page in doc:
                text += page.get_text()
                if len(text) >= 1000:  # stop after 1000 characters
                    text = text[:1000]
                    break

            state.documents = [text]
            return state

        except Exception as e:
            if not hasattr(state, "errors"):
                state.errors = []
            state.errors.append(str(e))
            return state