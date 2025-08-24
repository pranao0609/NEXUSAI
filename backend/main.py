# main.py
from __future__ import annotations

import logging
from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# --- Safe imports with clear failure messages ---
try:
    from routers import auth
except Exception as e:
    raise RuntimeError(f"Failed to import routers.auth: {e}") from e

try:
    from agents.orchestrator.orchestrator_agent import OrchestratorAgent
except Exception as e:
    raise RuntimeError(f"Failed to import OrchestratorAgent: {e}") from e

logger = logging.getLogger("uvicorn.error")

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

# --- Orchestrator instance ---
orchestrator = OrchestratorAgent()

# --- Health & Root ---
@app.get("/", tags=["system"])
def read_root() -> Dict[str, str]:
    return {"Hackathon": "Kurukshetra"}

@app.get("/health", tags=["system"])
def health_check() -> Dict[str, str]:
    return {"status": "ok"}

# --- Global exception handler (optional but useful in dev) ---
@app.exception_handler(Exception)
async def unhandled_exception_handler(_, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

# --- Pipeline endpoint ---
@app.post("/pipeline", tags=["pipeline"])
async def pipeline(
    source: str = Query(..., description="ingestion source key e.g. wiki|web|arxiv|duckduckgo"),
    query: str = Query(..., description="search/topic query for ingestion"),
    title: str = Query("Generated Report", description="report title"),
    audience: str = Query("General", description="target audience"),
) -> Any:
    """
    Runs the full multi-agent pipeline:
      1. Ingestion
      2. Summarization
      3. Analysis / Report Generation
    """
    try:
        result = await orchestrator.run_pipeline(source, query, title, audience)
        return result
    except ValueError as ve:
        # e.g. unknown source, bad params, validation issues
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except HTTPException:
        # bubble up HTTPExceptions unchanged
        raise
    except Exception as e:
        logger.exception("Pipeline failed for source=%s query=%s: %s", source, query, e)
        # Avoid leaking internals to clients
        raise HTTPException(status_code=500, detail="Pipeline execution failed") from e
