from datetime import datetime
import os
import asyncio
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from langchain.tools import Tool

class PDFGeneratorAgent:
    """Agent that takes text and generates a PDF report."""

    def __init__(self, output_dir="generated_pdfs"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    async def generate_pdf(self, title: str, content: str, style: str = "professional") -> str:
        """Generate PDF report from given content."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.join(self.output_dir, f"{title}_{style}_{timestamp}.pdf")

        # Basic ReportLab setup
        doc = SimpleDocTemplate(filename, pagesize=A4)
        styles = getSampleStyleSheet()

        story = []
        story.append(Paragraph(title, styles["Title"]))
        story.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", styles["Normal"]))
        story.append(Spacer(1, 20))
        story.append(Paragraph(content, styles["Normal"]))

        # Run PDF generation in a thread pool to avoid blocking
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, doc.build, story)
        return filename

# Wrap as a LangChain tool
def get_pdf_tool(output_dir="generated_pdfs"):
    pdf_agent = PDFGeneratorAgent(output_dir=output_dir)
    return Tool(
        name="pdf_generator",
        description="Generates a PDF report from given text input",
        func=lambda text: pdf_agent.generate_pdf("AI_Report", text)
    )
