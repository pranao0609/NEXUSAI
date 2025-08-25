# utils/redis_memory.py
"""
Redis-backed conversational memory.

Usage:
    from utils.redis_memory import RedisMemory
    memory = RedisMemory(
        host=os.getenv("REDIS_HOST"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        password=os.getenv("REDIS_PASSWORD"),
        max_messages=500,
        use_tls=True
    )
"""

from __future__ import annotations
import time
import json
from typing import List, Dict, Optional, Any
import os

try:
    import redis
except Exception as e:
    raise RuntimeError("redis package is required. Install with `pip install redis`.") from e

# optional: use orjson if present
try:
    import orjson  # type: ignore
    _HAS_ORJSON = True
except Exception:
    _HAS_ORJSON = False

# Default config (override via env or pass args)
DEFAULT_MAX_MESSAGES = 500
DEFAULT_PREFIX = "conv"

def _dumps(obj: Any) -> bytes:
    if _HAS_ORJSON:
        return orjson.dumps(obj)
    return json.dumps(obj, separators=(',', ':')).encode()

def _loads(b: bytes) -> Any:
    if _HAS_ORJSON:
        return orjson.loads(b)
    return json.loads(b.decode())

class RedisMemory:
    """
    Simple Redis-based conversation memory.
    Stores per-session message list under key: {prefix}:{session_id}:msgs
    Each list item is a JSON blob: {"role": "user"|"agent"|"system", "text": "...", "ts": 123}
    """

    def __init__(
        self,
        host: Optional[str] = None,
        port: int = 6379,
        db: int = 0,
        password: Optional[str] = None,
        max_connections: int = 50,
        max_messages: int = DEFAULT_MAX_MESSAGES,
        prefix: str = DEFAULT_PREFIX,
        use_tls: bool = False,
    ):
        host = host or os.getenv("REDIS_HOST", "localhost")
        port = int(os.getenv("REDIS_PORT", port))
        password = password or os.getenv("REDIS_PASSWORD", None)
        self.max_messages = max_messages
        self.prefix = prefix

        connection_kwargs = dict(host=host, port=port, db=db, password=password)
        if use_tls:
            # redis-py uses ssl_cert_reqs param; using ssl=True is common pattern
            connection_kwargs.update({"ssl": True, "ssl_cert_reqs": None})

        self.pool = redis.ConnectionPool(max_connections=max_connections, **connection_kwargs)
        self.client = redis.Redis(connection_pool=self.pool)

    def _msg_key(self, session_id: str) -> str:
        return f"{self.prefix}:{session_id}:msgs"

    def append_message(self, session_id: str, role: str, text: str, meta: Optional[Dict] = None) -> None:
        """
        Append a message to the conversation list and trim list to max_messages.
        role: 'user' | 'agent' | 'system'
        """
        key = self._msg_key(session_id)
        item = {
            "role": role,
            "text": text,
            "ts": int(time.time() * 1000),
        }
        if meta:
            item["meta"] = meta
        payload = _dumps(item)
        pipeline = self.client.pipeline()
        pipeline.lpush(key, payload)
        pipeline.ltrim(key, 0, self.max_messages - 1)
        pipeline.execute()

    def get_recent_messages(self, session_id: str, limit: int = 20) -> List[Dict]:
        """
        Return messages from oldest -> newest up to `limit` most recent messages.
        """
        key = self._msg_key(session_id)
        # we LPUSH newest, so LRANGE 0..limit-1 returns newest-first; reverse later
        raw = self.client.lrange(key, 0, limit - 1)
        msgs = []
        for b in raw:
            try:
                m = _loads(b)
            except Exception:
                try:
                    # fallback decode assumption
                    m = json.loads(b.decode() if isinstance(b, (bytes, bytearray)) else str(b))
                except Exception:
                    continue
            msgs.append(m)
        msgs.reverse()  # oldest -> newest
        return msgs

    def build_prompt_context(self, session_id: str, system_prompt: Optional[str] = None, limit: int = 20) -> str:
        """
        Return a prompt-ready string built from recent messages.
        Example:
            SYSTEM: <system_prompt>
            USER: Hello
            AGENT: Hi there!
        """
        msgs = self.get_recent_messages(session_id, limit=limit)
        parts = []
        if system_prompt:
            parts.append(f"SYSTEM: {system_prompt}")
        for m in msgs:
            role = m.get("role", "user").upper()
            text = m.get("text", "")
            parts.append(f"{role}: {text}")
        return "\n".join(parts)

    def clear_conversation(self, session_id: str) -> None:
        self.client.delete(self._msg_key(session_id))

    def get_length(self, session_id: str) -> int:
        return self.client.llen(self._msg_key(session_id))
