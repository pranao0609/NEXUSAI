from datetime import datetime
import os
import asyncio
import re
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from langchain.tools import Tool


class PDFGeneratorAgent:
    """Agent that takes text and generates a styled PDF report."""

    def __init__(self, output_dir: str = "generated_pdfs") -> None:
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def _slugify(self, text: str) -> str:
        """Convert title into safe filename part."""
        return re.sub(r"[^a-zA-Z0-9_-]", "_", text).strip("_")

    def _get_styles(self, style: str):
        """Return ReportLab stylesheet with optional customization."""
        styles = getSampleStyleSheet()

        if style == "professional":
            styles.add(ParagraphStyle(name="Body", parent=styles["Normal"], fontName="Helvetica", fontSize=11, leading=14))
        elif style == "casual":
            styles.add(ParagraphStyle(name="Body", parent=styles["Normal"], fontName="Times-Roman", fontSize=12, leading=16))
        else:
            styles.add(ParagraphStyle(name="Body", parent=styles["Normal"]))

        return styles

    async def generate_pdf(self, title: str, content: str, user_id: str, style: str = "professional") -> dict:
        """Generate PDF report and return metadata."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_title = self._slugify(title)
        filename = os.path.join(self.output_dir, f"{safe_title}_{style}_{user_id}_{timestamp}.pdf")

        styles = self._get_styles(style)
        story = [
            Paragraph(title, styles["Title"]),
            Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", styles["Normal"]),
            Spacer(1, 20),
            Paragraph(content, styles["Body"]),
        ]

        doc = SimpleDocTemplate(filename, pagesize=A4)

        # Run blocking ReportLab in executor
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, doc.build, story)

        file_size = os.path.getsize(filename)

        return {
            "path": filename,
            "title": title,
            "style": style,
            "user_id": user_id,
            "created_at": timestamp,
            "size_bytes": file_size,
        }


# ✅ LangChain Tool Wrapper
def get_pdf_tool(output_dir: str = "generated_pdfs") -> Tool:
    pdf_agent = PDFGeneratorAgent(output_dir=output_dir)

    async def _tool_func(text: str) -> str:
        """LangChain-compatible tool function (async wrapper)."""
        meta = await pdf_agent.generate_pdf("AI_Report", text, user_id="default")
        return f"PDF generated at {meta['path']} (size: {meta['size_bytes']} bytes)"

    return Tool(
        name="pdf_generator",
        description="Generates a styled PDF report from given text input.",
        coroutine=_tool_func,  # ✅ use coroutine for async
    )
