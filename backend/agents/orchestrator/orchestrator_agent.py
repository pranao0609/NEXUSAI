# agents/orchestrator/pipeline_graph.py
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


# ---------- Nodes ----------

def make_ingest_node(ingestor: IngestionAgent, timeout_s: Optional[float] = 20.0):
    async def ingest_node(state: PipelineState) -> Dict[str, Any]:
        source = state.get("source", "")
        query = state.get("query", "")
        logger.info("[ingest] source=%s query=%s", source, query)

        try:
            # IngestionAgent.ingest is sync in your codebase
            # Run in thread executor so the node stays async-friendly
            loop = asyncio.get_running_loop()
            docs = await _with_timeout(
                loop.run_in_executor(None, ingestor.ingest, source, query),
                timeout_s,
                "Ingestion",
            )
            docs = _normalize_docs(docs)
            if not docs:
                return {"errors": [f"No data ingested for source={source}, query={query}"]}
            logger.info("[ingest] %d document(s)", len(docs))
            return {"docs": docs}
        except Exception as e:
            logger.exception("[ingest] failed: %s", e)
            return {"errors": [f"Ingestion failed: {e}"]}
    return ingest_node


def make_summarize_node(summarizer: SummarizerAgent, timeout_s: Optional[float] = 45.0):
    async def summarize_node(state: PipelineState) -> Dict[str, Any]:
        if state.get("errors"):
            return {}
        docs = state.get("docs", [])
        logger.info("[summarize] start with %d doc(s)", len(docs))
        try:
            points: List[str] = await _with_timeout(
                summarizer.summarize(docs, max_points=8),
                timeout_s,
                "Summarization",
            )
            if not points:
                return {"errors": ["No summary points generated"]}
            logger.info("[summarize] generated %d point(s)", len(points))
            return {"points": points}
        except Exception as e:
            logger.exception("[summarize] failed: %s", e)
            return {"errors": [f"Summarization failed: {e}"]}
    return summarize_node


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


# ---------- Conditional routing ----------

def has_errors(state: PipelineState) -> str:
    """Route to END if errors accumulated, otherwise continue."""
    return "ERR" if state.get("errors") else "OK"


# ---------- Public builder ----------

def build_pipeline() -> Any:
    """
    Build & compile the LangGraph pipeline, wiring your existing agents.
    Returns: compiled graph (supports .ainvoke(input_state)).
    """
    ingestor = IngestionAgent()
    summarizer = SummarizerAgent()
    analyser = AnalyserAgent()

    ingest_node = make_ingest_node(ingestor)
    summarize_node = make_summarize_node(summarizer)
    analyse_node = make_analyse_node(analyser)

    graph = StateGraph(PipelineState)

    graph.add_node("ingest", ingest_node)
    graph.add_node("summarize", summarize_node)
    graph.add_node("analyse", analyse_node)

    # Start -> ingest
    graph.set_entry_point("ingest")

    # ingest -> (errors? END : summarize)
    graph.add_conditional_edges("ingest", has_errors, {"ERR": END, "OK": "summarize"})

    # summarize -> (errors? END : analyse)
    graph.add_conditional_edges("summarize", has_errors, {"ERR": END, "OK": "analyse"})

    # analyse -> (errors? END : END)
    graph.add_conditional_edges("analyse", has_errors, {"ERR": END, "OK": END})

    # Use in-memory checkpointer (enables future resumability)
    checkpointer = MemorySaver()

    compiled = graph.compile(checkpointer=checkpointer)
    return compiled
