# POI Translation and Audio Agent

## Local Ollama

Translation uses Ollama, with no OpenAI API key. Speech still uses 9Router.

1. Install Ollama and run `ollama pull qwen2.5:1.5b`.
2. Install Python dependencies: `python -m pip install -r app/agent/requirements.txt`.
3. Copy `app/agent/.env.example` to `app/agent/.env`. Configure 9Router only if speech is needed.
4. From `app/agent`, run `uvicorn translat_bot:app --host 0.0.0.0 --port 8000`.

`OLLAMA_BASE_URL` defaults to `http://localhost:11434` (without `/v1`).
`OLLAMA_MODEL` defaults to `qwen2.5:1.5b`; pull any replacement model before using it.
Existing OPENAI_* settings are no longer used.

## Independent Render service

The root `render.yaml` creates a standalone Docker web service containing FastAPI and Ollama.
It does not depend on Ollama running on your personal computer. Ollama listens only on the
container loopback address. Only FastAPI is exposed publicly.

1. Push this repository to your Git provider, then choose New > Blueprint in Render and select it.
2. Review the paid compute plan (`pro`) and 10 GB persistent disk before creating resources.
3. Set `AGENT_ALLOWED_ORIGINS` to the exact frontend origin (comma-separated for multiple origins).
   Set `NINEROUTER_BASE_URL` and `NINEROUTER_API_KEY` for speech. That URL must be reachable
   from Render; `localhost` refers to this container, not your PC.
4. Startup pulls the configured model if missing, then starts the API on Render's `$PORT`.
   First startup may take time to download the model. Subsequent restarts reuse `/var/data/ollama`.
5. Verify `https://<service>.onrender.com/health`, then configure the frontend agent URL
   to the new service URL. An existing Render service URL can be retained by deploying
   this Dockerfile to that service instead of creating a new Blueprint service.

Endpoints: `GET /health`, `POST /translate-poi`, `POST /translate-script`,
`POST /text-to-speech`. Request and response shapes are unchanged.
`/health` checks the API process; run an actual translation to verify model inference.

The small default model is intended as an initial resource-conscious configuration.
Validate Vietnamese/English/Chinese translation quality and CPU latency with real content;
use a larger model and more RAM if needed. Translation requests time out after 180 seconds.
CORS controls browser origins; these endpoints currently have no API authentication.

Render disk documentation: https://render.com/docs/disks
Ollama model: https://ollama.com/library/qwen2.5:1.5b
