### Builder: install dependencies into a virtualenv
FROM python:3.11-slim AS builder
ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1
WORKDIR /app

# Install build tools only in builder stage
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential gcc \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./

# Create a venv and install wheels into it to keep final image small
RUN python -m venv /opt/venv \
 && /opt/venv/bin/pip install --upgrade pip \
 && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt


### Final image: runtime only, non-root user
FROM python:3.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	PATH="/opt/venv/bin:$PATH"

# Create a dedicated unprivileged user
RUN groupadd -r app && useradd -r -g app -u 1000 app

WORKDIR /app

# Copy the virtualenv from builder
COPY --from=builder /opt/venv /opt/venv

# Copy only application files (after deps) to maximize layer cache
COPY . /app

# Ensure app directory and venv are owned by non-root user
RUN chown -R app:app /app /opt/venv

EXPOSE 5000

# Run as non-root
USER app

# Healthcheck: simple HTTP GET to the /health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
	CMD ["python", "-c", "import sys,urllib.request as u;\ntry:\n r=u.urlopen('http://127.0.0.1:5000/health'); sys.exit(0 if r.getcode()==200 else 1)\nexcept:\n sys.exit(1)"]

ENV FLASK_APP=app.py
CMD ["python", "-u", "app.py"]
