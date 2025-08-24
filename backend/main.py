# main.py
from __future__ import annotations
from fastapi import FastAPI
from routers import auth
from fastapi.middleware.cors import CORSMiddleware

import logging
from typing import Any, Dict
from fastapi.responses import FileResponse

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# --- Safe imports with clear failure messages ---
try:
    from routers import auth
except Exception as e:
    raise RuntimeError(f"Failed to import routers.auth: {e}") from e

try:
    from agents.orchestrator.orchestrator_agent import build_pipeline
except Exception as e:
    raise RuntimeError(f"Failed to import build_pipeline: {e}") from e

logger = logging.getLogger("uvicorn.error")

# --- FastAPI setup ---
app = FastAPI(
    title="Hackathon Multi-Agent System",
    version="1.0.0",
    description="Kurukshetra Hackathon Project: Multi-Agent Collaboration System",
)

# --- CORS (tighten origins in production) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restrict in prod (e.g., ["https://yourdomain.com"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---

app.include_router(auth.router, prefix="/auth", tags=["auth"])

# --- Pipeline Graph instance ---
pipeline = build_pipeline()

# --- Health & Root ---
@app.get("/", tags=["system"])
def read_root() -> Dict[str, str]:
    return {"Hackathon": "Kurukshetra"}

@app.get("/health", tags=["system"])
def health_check() -> Dict[str, str]:
    return {"status": "ok"}

# --- Global exception handler (optional but useful in dev/prod) ---
@app.exception_handler(Exception)
async def unhandled_exception_handler(_, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

@app.post("/pipeline", tags=["pipeline"])
async def pipeline_endpoint(
    source: str = Query(..., description="ingestion source key e.g. wiki|web|arxiv|csv"),
    query: str = Query(..., description="search/topic query for ingestion"),
    title: str = Query("Generated Report", description="report title"),
    audience: str = Query("General", description="target audience"),
) -> Any:
    """
    Runs the full multi-agent pipeline (LangGraph powered):
      1. Ingestion
      2. Summarization
      3. Analysis / Report Generation
      4. PDF Generation (if available)
    """
    try:
        # input state (matches PipelineState in pipeline_graph.py)
        input_state = {
            "source": source,
            "query": query,
            "title": title,
            "audience": audience,
        }

        result = await pipeline.ainvoke(
            input_state,
            config={"configurable": {"thread_id": "session-1"}}
        )

        # if a pdf was generated, return it directly
        pdf_path = result.get("pdf_path")
        if pdf_path:
            return FileResponse(
                pdf_path,
                media_type="application/pdf",
                filename="report.pdf"
            )

        # otherwise return the raw result (json/dict/etc.)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Pipeline failed for source=%s query=%s: %s", source, query, e)
        raise HTTPException(status_code=500, detail="Pipeline execution failed") from e