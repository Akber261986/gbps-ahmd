# cache.py
"""
Simple in-memory cache for user and school data to reduce database queries.
"""
from datetime import datetime, timedelta
from typing import Optional, Any, Dict
import threading

class SimpleCache:
    """Thread-safe in-memory cache with TTL support."""

    def __init__(self, default_ttl_seconds: int = 300):  # 5 minutes default
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
        self.default_ttl = default_ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if it exists and hasn't expired."""
        with self._lock:
            if key in self._cache:
                entry = self._cache[key]
                if datetime.utcnow() < entry['expires_at']:
                    return entry['value']
                else:
                    # Remove expired entry
                    del self._cache[key]
            return None

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        """Set value in cache with optional custom TTL."""
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        expires_at = datetime.utcnow() + timedelta(seconds=ttl)

        with self._lock:
            self._cache[key] = {
                'value': value,
                'expires_at': expires_at
            }

    def delete(self, key: str) -> None:
        """Delete a key from cache."""
        with self._lock:
            if key in self._cache:
                del self._cache[key]

    def clear(self) -> None:
        """Clear all cache entries."""
        with self._lock:
            self._cache.clear()

    def delete_pattern(self, pattern: str) -> None:
        """Delete all keys matching a pattern (simple startswith match)."""
        with self._lock:
            keys_to_delete = [key for key in self._cache.keys() if key.startswith(pattern)]
            for key in keys_to_delete:
                del self._cache[key]

# Global cache instances
user_cache = SimpleCache(default_ttl_seconds=300)  # 5 minutes for user data
school_cache = SimpleCache(default_ttl_seconds=600)  # 10 minutes for school data
endpoint_cache = SimpleCache(default_ttl_seconds=180)  # 3 minutes for endpoint responses

def invalidate_user_cache(user_id: int) -> None:
    """Invalidate cache for a specific user."""
    user_cache.delete(f"user:{user_id}")

def invalidate_school_cache(school_id: int) -> None:
    """Invalidate cache for a specific school."""
    school_cache.delete(f"school:{school_id}")
    # Also invalidate all users from this school
    user_cache.delete_pattern(f"user:")

def invalidate_endpoint_cache(pattern: str) -> None:
    """Invalidate endpoint cache by pattern."""
    endpoint_cache.delete_pattern(pattern)

def get_cache_key(user_id: int, endpoint: str, params: str = "") -> str:
    """Generate cache key for endpoint response."""
    return f"endpoint:{user_id}:{endpoint}:{params}"
