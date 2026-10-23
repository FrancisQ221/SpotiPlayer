# ==============================================================================
# SpotiPlayer Micro-Backend Dockerfile
# Optimized for Python 3.11-slim + FFmpeg on Cloud Free Tiers (Render & Railway)
# ==============================================================================

FROM python:3.11-slim

# Prevent Python from writing .pyc files & enable unbuffered standard I/O
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install system dependencies:
# - ffmpeg: Required by yt-dlp for audio stream parsing, format extraction, and metadata
# - curl: Required for container healthchecks
# - ca-certificates: Required for secure HTTPS requests to YouTube / CDN endpoints
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set up dedicated non-root application user for container security
RUN groupadd -g 1001 spotiuser && \
    useradd -u 1001 -g spotiuser -m -s /bin/bash spotiuser

WORKDIR /app

# Copy dependency manifest first to leverage Docker layer caching
COPY requirements.txt .

# Upgrade pip and install pinned Python packages
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application source code
COPY . .

# Set proper ownership for non-root user
RUN chown -R spotiuser:spotiuser /app

# Switch to non-root execution
USER spotiuser

# Expose default port (Render & Railway inject dynamic $PORT at runtime)
EXPOSE 8000

# Container healthcheck targeting the FastAPI /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Launch production server with Uvicorn respecting dynamic environment PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2 --access-log"]
