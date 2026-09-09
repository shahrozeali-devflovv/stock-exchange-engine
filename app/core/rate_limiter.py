from fastapi import Request, HTTPException

from app.core.redis import redis_client


def login_rate_limiter(request: Request):
    ip_address = request.client.host

    key = f"rate_limit:login:{ip_address}"

    request_count = redis_client.incr(key)

    if request_count == 1:
        redis_client.expire(key, 60)

    if request_count > 5:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please try again later."
        )