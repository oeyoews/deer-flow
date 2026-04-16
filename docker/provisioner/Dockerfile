FROM python:3.12-slim-bookworm

ARG APT_MIRROR
ARG PIP_INDEX_URL
ARG http_proxy
ARG https_proxy
ARG no_proxy
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

ENV http_proxy=${http_proxy} \
    https_proxy=${https_proxy} \
    no_proxy=${no_proxy} \
    HTTP_PROXY=${HTTP_PROXY} \
    HTTPS_PROXY=${HTTPS_PROXY} \
    NO_PROXY=${NO_PROXY}

# Optionally override apt mirror for restricted networks (e.g. APT_MIRROR=mirrors.aliyun.com)
RUN if [ -n "${APT_MIRROR}" ]; then \
      sed -i "s|deb.debian.org|${APT_MIRROR}|g" /etc/apt/sources.list.d/debian.sources 2>/dev/null || true; \
      sed -i "s|security.debian.org|${APT_MIRROR}|g" /etc/apt/sources.list.d/debian.sources 2>/dev/null || true; \
      sed -i "s|deb.debian.org|${APT_MIRROR}|g" /etc/apt/sources.list 2>/dev/null || true; \
      sed -i "s|security.debian.org|${APT_MIRROR}|g" /etc/apt/sources.list 2>/dev/null || true; \
    fi

# Prefer HTTPS apt sources to avoid proxy responses corrupting signature files.
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list.d/debian.sources 2>/dev/null || true \
    && sed -i 's|http://security.debian.org|https://security.debian.org|g' /etc/apt/sources.list.d/debian.sources 2>/dev/null || true \
    && sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list 2>/dev/null || true \
    && sed -i 's|http://security.debian.org|https://security.debian.org|g' /etc/apt/sources.list 2>/dev/null || true

# Install system dependencies with retry/fallback mirror for flaky networks.
RUN set -eux; \
    apt_update() { \
      apt-get -o Acquire::Retries=5 -o Acquire::http::Timeout=30 -o Acquire::https::Timeout=30 -o Acquire::ForceIPv4=true update; \
    }; \
    if ! apt_update; then \
      sed -i 's|deb.debian.org|mirrors.aliyun.com|g' /etc/apt/sources.list.d/debian.sources 2>/dev/null || true; \
      sed -i 's|security.debian.org|mirrors.aliyun.com|g' /etc/apt/sources.list.d/debian.sources 2>/dev/null || true; \
      sed -i 's|deb.debian.org|mirrors.aliyun.com|g' /etc/apt/sources.list 2>/dev/null || true; \
      sed -i 's|security.debian.org|mirrors.aliyun.com|g' /etc/apt/sources.list 2>/dev/null || true; \
      apt_update; \
    fi; \
    apt-get install -y --no-install-recommends curl; \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    ${PIP_INDEX_URL:+--index-url "$PIP_INDEX_URL"} \
    fastapi \
    "uvicorn[standard]" \
    kubernetes

WORKDIR /app
COPY app.py .

EXPOSE 8002

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8002"]
