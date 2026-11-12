# POI Translation and Audio Agent

## Local Ollama

Translation uses Ollama, with no OpenAI API key. Speech still uses 9Router.

1. Install Ollama and run `ollama pull llama3.2:3b`.
2. Install Python dependencies: `python -m pip install -r app/agent/requirements.txt`.
3. Copy `app/agent/.env.example` to `app/agent/.env`. Configure 9Router only if speech is needed.
4. From `app/agent`, run `uvicorn translat_bot:app --host 0.0.0.0 --port 8000`.

`OLLAMA_BASE_URL` defaults to `http://localhost:11434` (without `/v1`).
`OLLAMA_MODEL` defaults to `llama3.2:3b`; pull any replacement model before using it.
Existing OPENAI_* settings are no longer used.

## Render Python agent with local Ollama

The agent runs as a Python web service on Render. Ollama and its model run on your PC;
Render connects through a tunnel. No Docker deployment or Render model disk is needed.

1. On your PC, open Ollama and run `ollama pull llama3.2:3b`.
2. Start the tunnel: `ngrok http 11434 --host-header="localhost:11434"`.
   Use access controls for a persistent public endpoint. Keep Ollama, the tunnel and your PC online.
3. Push the code to the branch connected to Render and configure the service:

   | Setting | Value |
   | --- | --- |
   | Runtime | Python |
   | Root Directory | `app/agent` |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `uvicorn translat_bot:app --host 0.0.0.0 --port $PORT` |
   | Pre-Deploy Command | Empty |
   | Health Check Path | `/health` |

4. Set these variables in Render Environment:

   ```env
   OLLAMA_MODEL=llama3.2:3b
   OLLAMA_BASE_URL=https://YOUR-OLLAMA-TUNNEL.ngrok-free.app
   AGENT_ALLOWED_ORIGINS=https://YOUR-FRONTEND-DOMAIN
   NINEROUTER_BASE_URL=https://YOUR-9ROUTER-ENDPOINT/v1
   NINEROUTER_API_KEY=YOUR-9ROUTER-KEY
   ```

   Do not append `/v1` to `OLLAMA_BASE_URL`. The 9Router URL must also be reachable
   from Render. If 9Router runs on your PC, it needs its own reachable endpoint.
   Remove unused `OPENAI_*` settings. Never commit real API keys or tunnel credentials.
5. Save and deploy. Verify `/health`, then test a translation and speech generation
   from the frontend. If the Ollama tunnel URL changes, update `OLLAMA_BASE_URL` and redeploy.

`llama3.2:3b` is selected through the Render environment variable; the code's fallback
remains `llama3.2:3b`. Users of the frontend do not need to install Ollama or ngrok.
Translation stops working while your PC or tunnel is offline.

Endpoints: `GET /health`, `POST /translate-poi`, `POST /translate-script`,
`POST /text-to-speech`. Request and response shapes are unchanged.
`/health` checks the API process; run an actual translation to verify model inference.

The small default model is intended as an initial resource-conscious configuration.
Validate Vietnamese/English/Chinese translation quality and CPU latency with real content;
use a larger model and more RAM if needed. Translation requests time out after 180 seconds.
CORS controls browser origins; these endpoints currently have no API authentication.
