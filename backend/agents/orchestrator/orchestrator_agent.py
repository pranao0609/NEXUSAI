# agents/orchestrator/orchestrator.py
from __future__ import annotations

import asyncio
import logging
import operator
from typing import Any, Dict, List, Optional, TypedDict, Union, Annotated

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver  # in-memory checkpointer

from agents.ingestion.ingestion_agent import IngestionAgent
from agents.summarizer.summarizer_agent import SummarizerAgent
from agents.analyser.analyser_agent import AnalyserAgent
from agents.pdf_genration.pdf_agent import PDFGeneratorAgent

logger = logging.getLogger(__name__)


# ---------- Graph State ----------
class PipelineState(TypedDict, total=False):
    # inputs
    source: str
    query: str
    title: str
    audience: str
    
    # working state
    # We "accumulate" with operator.add to be safe if any node returns partial results
    docs: Annotated[List[Union[str, dict]], operator.add]
    points: Annotated[List[str], operator.add]
    errors: Annotated[List[str], operator.add]
    
    # intermediate state for multi-source processing
    text_sources: Annotated[List[str], operator.add]  # For web, wiki, arxiv results
    file_content: Optional[str]  # For PDF/CSV/Word content
    
    # final
    report: Dict[str, Any]


# ---------- Utilities ----------
async def _with_timeout(coro, timeout: Optional[float], label: str):
    """Run an async operation with timeout and log nice errors."""
    try:
        if timeout is None:
            return await coro
        return await asyncio.wait_for(coro, timeout=timeout)
    except asyncio.TimeoutError:
        msg = f"{label} timed out after {timeout}s"
        logger.exception(msg)
        raise RuntimeError(msg)


def _normalize_docs(docs: Any) -> List[Union[str, dict]]:
    """Ensure docs is a list of strings or dicts with 'content' keys."""
    if docs is None:
        return []
    if isinstance(docs, (str, dict)):
        return [docs]
    if isinstance(docs, list):
        # keep only str or dict; best-effort
        out: List[Union[str, dict]] = []
        for d in docs:
            if isinstance(d, (str, dict)):
                out.append(d)
            else:
                # try coercion
                out.append(str(d))
        return out
    # last resort
    return [str(docs)]


def _classify_input_type(source: str, query: str) -> str:
    """Classify input type based on source and query content."""
    # File-based sources
    file_sources = ["pdf", "csv", "word"]
    
    # Text-based sources  
    text_sources = ["web", "wiki", "arxiv"]
    
    if source.lower() in file_sources:
        return "file"
    elif source.lower() in text_sources:
        return "text"
    else:
        # If source is not specified or is "text", analyze query content
        if any(keyword in query.lower() for keyword in [".pdf", ".csv", ".doc", ".docx", "file:", "upload"]):
            return "file"
        else:
            return "text"


# ---------- Nodes ----------
def make_router_node():
    """Super node that decides the processing flow based on input type."""
    async def router_node(state: PipelineState) -> Dict[str, Any]:
        source = state.get("source", "")
        query = state.get("query", "")
        
        logger.info("[router] analyzing input - source=%s query=%s", source, query)
        
        input_type = _classify_input_type(source, query)
        
        logger.info("[router] classified input as: %s", input_type)
        
        return {
            "input_type": input_type,
            "routing_decision": input_type
        }
    
    return router_node


def make_file_ingest_node(ingestor: IngestionAgent, timeout_s: Optional[float] = 60.0):
    """Handle file-based ingestion (PDF, CSV, Word)."""
    async def file_ingest_node(state: PipelineState) -> Dict[str, Any]:
        source = state.get("source", "")
        query = state.get("query", "")
        
        logger.info("[file_ingest] source=%s query=%s", source, query)
        
        try:
            # Determine actual source if not specified
            if not source or source == "text":
                if ".pdf" in query.lower():
                    source = "pdf"
                elif ".csv" in query.lower():
                    source = "csv"
                elif any(ext in query.lower() for ext in [".doc", ".docx"]):
                    source = "word"
                else:
                    source = "pdf"  # default assumption
            
            loop = asyncio.get_running_loop()
            docs = await _with_timeout(
                loop.run_in_executor(None, ingestor.ingest, source, query),
                timeout_s,
                "File Ingestion",
            )
            
            docs = _normalize_docs(docs)
            if not docs:
                return {"errors": [f"No data ingested from file source={source}, query={query}"]}
            
            # Store file content for potential text-based searches
            file_content = ""
            for doc in docs:
                if isinstance(doc, str):
                    file_content += doc + "\n"
                elif isinstance(doc, dict) and "content" in doc:
                    file_content += str(doc["content"]) + "\n"
            
            logger.info("[file_ingest] ingested %d document(s) from file", len(docs))
            return {
                "docs": docs,
                "file_content": file_content.strip(),
                "processing_stage": "file_processed"
            }
            
        except Exception as e:
            logger.exception("[file_ingest] failed: %s", e)
            return {"errors": [f"File ingestion failed: {e}"]}
    
    return file_ingest_node


import random
import asyncio

def make_text_ingest_node(ingestor: IngestionAgent, timeout_s: Optional[float] = 60.0):
    """Handle text-based ingestion (Web, Wiki, Arxiv)."""
    async def text_ingest_node(state: PipelineState) -> Dict[str, Any]:
        source = state.get("source", "")
        query = state.get("query", "")
        
        # For file-first processing, extract key terms from file content for searching
        file_content = state.get("file_content", "")
        if file_content and not query.strip():
            # Extract key terms from file content for search
            words = file_content.split()[:50]  # Use first 50 words as search query
            query = " ".join(words)
            logger.info("[text_ingest] using file content for search query: %s...", query[:100])
        
        logger.info("[text_ingest] searching with query=%s", query[:100])
        
        try:
            # Search multiple text sources
            search_sources = ["web", "wiki", "arxiv"]
            all_docs = []
            
            loop = asyncio.get_running_loop()
            
            for search_source in search_sources:
                try:
                    logger.info("[text_ingest] searching %s", search_source)
                    source_docs = await _with_timeout(
                        loop.run_in_executor(None, ingestor.ingest, search_source, query),
                        timeout_s // len(search_sources),  # Split timeout across sources
                        f"{search_source} search",
                    )
                    
                    if source_docs:
                        normalized_docs = _normalize_docs(source_docs)
                        all_docs.extend(normalized_docs)
                        logger.info("[text_ingest] found %d docs from %s", len(normalized_docs), search_source)
                
                except Exception as e:
                    logger.warning("[text_ingest] %s search failed: %s", search_source, e)
                    continue
            
            if not all_docs:
                return {"errors": ["No data found from text sources (web, wiki, arxiv)"]}
            
            logger.info("[text_ingest] total %d documents from text sources", len(all_docs))
            return {
                "docs": all_docs,
                "text_sources": [f"{len(all_docs)} documents from web/wiki/arxiv"],
                "processing_stage": "text_processed"
            }
            
        except Exception as e:
            logger.exception("[text_ingest] failed: %s", e)
            return {"errors": [f"Text ingestion failed: {e}"]}
    
    return text_ingest_node


def make_file_first_summarize_node(summarizer: SummarizerAgent, timeout_s: Optional[float] = 45.0):
    """Summarize file content first, then proceed to text searches."""
    async def file_first_summarize_node(state: PipelineState) -> Dict[str, Any]:
        if state.get("errors"):
            return {}
        
        docs = state.get("docs", [])
        logger.info("[file_first_summarize] processing %d documents", len(docs))
        
        try:
            # Summarize file content
            chunk_size = 5  # Smaller chunks for file content
            all_points = []
            
            for i in range(0, len(docs), chunk_size):
                chunk = docs[i:i + chunk_size]
                chunk_points = await _with_timeout(
                    summarizer.summarize(chunk, max_points=5),
                    timeout_s,
                    "File Summarization",
                )
                if chunk_points:
                    all_points.extend(chunk_points)
            
            points = all_points[:10] if all_points else []
            
            if not points:
                return {"errors": ["No summary points generated from file content"]}
            
            logger.info("[file_first_summarize] generated %d points from file", len(points))
            return {
                "points": points,
                "processing_stage": "file_summarized"
            }
            
        except Exception as e:
            logger.exception("[file_first_summarize] failed: %s", e)
            return {"errors": [f"File summarization failed: {e}"]}
    
    return file_first_summarize_node


def make_final_summarize_node(summarizer: SummarizerAgent, timeout_s: Optional[float] = 45.0):
    """Final summarization combining all sources."""
    async def final_summarize_node(state: PipelineState) -> Dict[str, Any]:
        if state.get("errors"):
            return {}
        
        docs = state.get("docs", [])
        existing_points = state.get("points", [])
        
        logger.info("[final_summarize] processing %d docs, %d existing points", 
                   len(docs), len(existing_points))
        
        try:
            # Process only new documents (text search results)
            new_points = []
            if docs:
                chunk_size = 10
                
                for i in range(0, len(docs), chunk_size):
                    chunk = docs[i:i + chunk_size]
                    chunk_points = await _with_timeout(
                        summarizer.summarize(chunk, max_points=3),
                        timeout_s,
                        "Text Summarization",
                    )
                    if chunk_points:
                        new_points.extend(chunk_points)
            
            # Combine existing points (from file) with new points (from text sources)
            all_points = existing_points + new_points[:8]  # Limit new points
            final_points = all_points[:15]  # Overall limit
            
            if not final_points:
                return {"errors": ["No summary points generated from any source"]}
            
            logger.info("[final_summarize] combined %d total points", len(final_points))
            return {"points": final_points}
            
        except Exception as e:
            logger.exception("[final_summarize] failed: %s", e)
            return {"errors": [f"Final summarization failed: {e}"]}
    
    return final_summarize_node


def make_analyse_node(analyser: AnalyserAgent, timeout_s: Optional[float] = 45.0):
    async def analyse_node(state: PipelineState) -> Dict[str, Any]:
        if state.get("errors"):
            return {}
        
        points = state.get("points", [])
        title = state.get("title", "Generated Report")
        audience = state.get("audience", "General")
        
        logger.info("[analyse] title=%s audience=%s points=%d", title, audience, len(points))
        
        try:
            report: Dict[str, Any] = await _with_timeout(
                analyser.analyse(points, title, audience),
                timeout_s,
                "Analysis",
            )
            
            logger.info("[analyse] report generated")
            return {"report": report}
            
        except Exception as e:
            logger.exception("[analyse] failed: %s", e)
            return {"errors": [f"Analysis failed: {e}"]}
    
    return analyse_node

def make_greeting_node():
    """Simulate a greeting/loading node with verbose output."""
    async def greeting_node(state: PipelineState) -> Dict[str, Any]:
        logger.info("[greeting] Hello! Initializing your request...")
        await asyncio.sleep(0.5)
        
        steps = [
            "Analyzing query context...",
            "Searching knowledge base...",
            "Fetching relevant sources...",
            "Preparing pipeline agents...",
            "Optimizing search parameters...",
            "Almost ready to process your request..."
        ]
        
        # Simulate step-by-step verbose output
        for step in steps:
            logger.info(f"[greeting] {step}")
            # random short sleep to mimic real-time progress
            await asyncio.sleep(random.uniform(0.3, 0.7))
        
        logger.info("[greeting] All systems ready! Proceeding to main pipeline.")
        
        # Optionally, add a verbose message to the state (for UI feedback)
        state.setdefault("verbose", []).extend(steps + ["All systems ready!"])
        
        return {"processing_stage": "greeting_done"}
    
    return greeting_node

def make_pdf_node(pdf_agent: PDFGeneratorAgent, timeout_s: Optional[float] = 45.0):
    async def pdf_node(state: PipelineState) -> Dict[str, Any]:
        if state.get("errors"):
            return {}
        
        report = state.get("report")
        title = state.get("title", "Generated_Report")
        
        if not report:
            return {"errors": ["No report available for PDF generation."]}
        
        try:
            # Convert report dictionary to a formatted string
            report_content = ''
            for key, value in report.items():
                report_content += f"{key}:\n{value}\n\n"
            
            pdf_path: str = await _with_timeout(
            pdf_agent.generate_pdf(title, report_content, user_id="system", style="professional"),
            timeout_s,
            "PDF Generation",
)

            
            logger.info("[pdf_node] PDF generated at %s", pdf_path)
            return {"pdf_path": pdf_path}
            
        except Exception as e:
            logger.exception("[pdf_node] failed: %s", e)
            return {"errors": [f"PDF generation failed: {e}"]}
    
    return pdf_node


# ---------- Conditional routing ----------
def route_after_classification(state: PipelineState) -> str:
    """Route based on input classification."""
    input_type = state.get("input_type", "text")
    if input_type == "file":
        return "file_ingest"
    else:
        return "text_ingest"


def route_after_file_ingest(state: PipelineState) -> str:
    """Route after file ingestion."""
    if state.get("errors"):
        return "END"
    return "file_first_summarize"


def route_after_file_summarize(state: PipelineState) -> str:
    """Route after file summarization to text search."""
    if state.get("errors"):
        return "END"
    return "text_ingest"


def route_after_text_ingest(state: PipelineState) -> str:
    """Route after text ingestion."""
    if state.get("errors"):
        return "END"
    
    # If we came from file processing, go to final summarize
    if state.get("processing_stage") == "file_summarized":
        return "final_summarize"
    else:
        # Direct text processing, go to final summarize
        return "final_summarize"


def route_after_summarize(state: PipelineState) -> str:
    """Route after summarization."""
    if state.get("errors"):
        return "END"
    return "analyse"


def route_after_analyse(state: PipelineState) -> str:
    """Route after analysis."""
    if state.get("errors"):
        return "END"
    return "pdf"


def route_after_pdf(state: PipelineState) -> str:
    """Always end after PDF generation."""
    return "END"


# ---------- Public builder ----------
def build_pipeline() -> Any:
    """
    Build & compile the LangGraph pipeline with intelligent routing.
    
    Flow:
    1. Router classifies input (file vs text)
    2. File path: file_ingest -> file_summarize -> text_ingest -> final_summarize -> analyse -> pdf
    3. Text path: text_ingest -> final_summarize -> analyse -> pdf
    
    Returns:
        compiled graph (supports .ainvoke(input_state)).
    """
    ingestor = IngestionAgent()
    summarizer = SummarizerAgent()
    analyser = AnalyserAgent()
    pdf_agent = PDFGeneratorAgent()
    
    # Create nodes
    router_node = make_router_node()
    file_ingest_node = make_file_ingest_node(ingestor)
    text_ingest_node = make_text_ingest_node(ingestor)
    file_first_summarize_node = make_file_first_summarize_node(summarizer)
    final_summarize_node = make_final_summarize_node(summarizer)
    analyse_node = make_analyse_node(analyser)
    pdf_node = make_pdf_node(pdf_agent)
    
    # Build graph
    graph = StateGraph(PipelineState)
    
    # Add nodes
    greeting_node = make_greeting_node()
    router_node = make_router_node()
    graph.add_node("greeting", greeting_node)
    graph.add_node("router", router_node)
    graph.add_node("file_ingest", file_ingest_node)
    graph.add_node("text_ingest", text_ingest_node)
    graph.add_node("file_first_summarize", file_first_summarize_node)
    graph.add_node("final_summarize", final_summarize_node)
    graph.add_node("analyse", analyse_node)
    graph.add_node("pdf", pdf_node)
    
    # Set entry point
    graph.set_entry_point("greeting")
    
    graph.add_conditional_edges(
    "greeting",
    lambda state: "router",
    {"router": "router"}
)

    # Router -> file_ingest or text_ingest
    graph.add_conditional_edges(
        "router",
        route_after_classification,
        {
            "file_ingest": "file_ingest",
            "text_ingest": "text_ingest"
        }
    )
    
    # file_ingest -> file_first_summarize or END
    graph.add_conditional_edges(
        "file_ingest",
        route_after_file_ingest,
        {
            "file_first_summarize": "file_first_summarize",
            "END": END
        }
    )
    
    # file_first_summarize -> text_ingest or END
    graph.add_conditional_edges(
        "file_first_summarize",
        route_after_file_summarize,
        {
            "text_ingest": "text_ingest",
            "END": END
        }
    )
    
    # text_ingest -> final_summarize or END
    graph.add_conditional_edges(
        "text_ingest",
        route_after_text_ingest,
        {
            "final_summarize": "final_summarize",
            "END": END
        }
    )
    
    # final_summarize -> analyse or END
    graph.add_conditional_edges(
        "final_summarize",
        route_after_summarize,
        {
            "analyse": "analyse",
            "END": END
        }
    )
    
    # analyse -> pdf or END
    graph.add_conditional_edges(
        "analyse",
        route_after_analyse,
        {
            "pdf": "pdf",
            "END": END
        }
    )
    
    # pdf -> END
    graph.add_conditional_edges(
        "pdf",
        route_after_pdf,
        {
            "END": END
        }
    )
    
    # Use in-memory checkpointer
    checkpointer = MemorySaver()
    compiled = graph.compile(checkpointer=checkpointer)
    
    return compiled
