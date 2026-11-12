FROM ollama/ollama:0.6.8
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" \
    OLLAMA_HOST=127.0.0.1:11434 \
    OLLAMA_BASE_URL=http://127.0.0.1:11434 \
    OLLAMA_MODELS=/var/data/ollama \
    OLLAMA_MODEL=qwen2.5:1.5b \
    OLLAMA_NUM_PARALLEL=1 \
    OLLAMA_MAX_LOADED_MODELS=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY translat_bot.py translation_errors.py start.sh ./
ENTRYPOINT ["/bin/bash", "/app/start.sh"]
