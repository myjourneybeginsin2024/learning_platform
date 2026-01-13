
import io
import pypdf
from fastapi import UploadFile

class DocumentParser:
    @staticmethod
    async def extract_text(file_content: bytes, filename: str) -> str:
        """
        Extract text from PDF or Plain Text content.
        """
        if filename.lower().endswith('.pdf'):
            return DocumentParser._extract_pdf(file_content)
        else:
            # Assume text/markdown
            return file_content.decode('utf-8', errors='ignore')

    @staticmethod
    def _extract_pdf(content: bytes) -> str:
        text = ""
        try:
            pdf = pypdf.PdfReader(io.BytesIO(content))
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        except Exception as e:
            print(f"Error parsing PDF: {e}")
            raise ValueError("Failed to process PDF file")
        return text
