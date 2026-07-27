import json
import logging
import time
import asyncio
from typing import Optional, Callable, Dict, Any
from contextlib import suppress

logger = logging.getLogger(__name__)

class FallbackMemoryCache:
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[dict]:
        if key in self._cache:
            entry = self._cache[key]
            if entry['expires_at'] is None or entry['expires_at'] > time.time():
                return entry['value']
            else:
                del self._cache[key]
        return None

    def set(self, key: str, value: dict, ttl: int = None):
        expires_at = time.time() + ttl if ttl else None
        self._cache[key] = {'value': value, 'expires_at': expires_at}

    def delete(self, key: str):
        self._cache.pop(key, None)
        
    def delete_pattern(self, pattern: str):
        # basic implementation replacing * with empty
        prefix = pattern.replace('*', '')
        keys_to_delete = [k for k in self._cache.keys() if k.startswith(prefix) or prefix in k]
        for k in keys_to_delete:
            self._cache.pop(k, None)

class RedisCacheLayer:
    def __init__(self, redis_url: str = 'redis://localhost:6379/0', default_ttl: int = 300):
        self.redis_url = redis_url
        self.default_ttl = default_ttl
        self.redis = None
        self.memory_cache = FallbackMemoryCache()
        self.use_redis = False

    async def connect(self):
        try:
            import redis.asyncio as redis_async
            self.redis = await redis_async.from_url(self.redis_url)
            await self.redis.ping()
            self.use_redis = True
            logger.info("Connected to Redis cache")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis, falling back to memory cache: {e}")
            self.use_redis = False

    async def get(self, key: str) -> Optional[dict]:
        if self.use_redis:
            try:
                data = await self.redis.get(key)
                if data:
                    return json.loads(data)
                return None
            except Exception as e:
                logger.warning(f"Redis get error: {e}")
                return self.memory_cache.get(key)
        else:
            return self.memory_cache.get(key)

    async def set(self, key: str, value: dict, ttl: int = None):
        ttl = ttl or self.default_ttl
        if self.use_redis:
            try:
                await self.redis.set(key, json.dumps(value), ex=ttl)
                return
            except Exception as e:
                logger.warning(f"Redis set error: {e}")
                
        self.memory_cache.set(key, value, ttl)

    async def invalidate(self, key: str):
        if self.use_redis:
            try:
                await self.redis.delete(key)
            except Exception as e:
                logger.warning(f"Redis delete error: {e}")
        self.memory_cache.delete(key)

    async def invalidate_pattern(self, pattern: str):
        if self.use_redis:
            try:
                keys = await self.redis.keys(pattern)
                if keys:
                    await self.redis.delete(*keys)
            except Exception as e:
                logger.warning(f"Redis delete pattern error: {e}")
        self.memory_cache.delete_pattern(pattern)

    async def get_or_fetch(self, key: str, fetcher: Callable, ttl: int = None) -> dict:
        cached = await self.get(key)
        if cached is not None:
            return cached
            
        value = await fetcher()
        if value:
            await self.set(key, value, ttl)
        return value

    async def close(self):
        if self.use_redis and self.redis:
            await self.redis.close()
