from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import logging
import time

from routers import challenges, submissions, leaderboard, contests, interview, profile
from core.config import settings

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("upgradian")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Upgradian API starting up")
    yield
    logger.info("Upgradian API shutting down")


app = FastAPI(
    title="Upgradian API",
    description="Backend API for Upgradian coding platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.LOG_LEVEL == "DEBUG" else None,
    redoc_url=None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(challenges.router,   prefix="/challenges",   tags=["challenges"])
app.include_router(submissions.router,  prefix="/submissions",  tags=["submissions"])
app.include_router(leaderboard.router,  prefix="/leaderboard",  tags=["leaderboard"])
app.include_router(contests.router,     prefix="/contests",     tags=["contests"])
app.include_router(interview.router,    prefix="/interview",    tags=["interview"])
app.include_router(profile.router,      prefix="/profile",      tags=["profile"])


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration = (time.perf_counter() - start) * 1000
    logger.info("%s %s %d %.1fms", request.method, request.url.path, response.status_code, duration)
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
