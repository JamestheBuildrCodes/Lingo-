# Lingo — Stage 1: WebRTC Foundation

Real-time multilingual video calls. Stage 1 gets two people on a call.
Stage 3+ adds live AI translation.

---

## What this stage builds

- ✅ Video/audio call between any two browsers
- ✅ Language badge per participant (used by AI pipeline in Stage 3)
- ✅ Room creation and sharing
- ✅ FastAPI token server (mints LiveKit JWTs)
- ✅ Branded Lingo UI

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- A free LiveKit Cloud account → https://cloud.livekit.io

---

## Step 1 — Get LiveKit credentials (5 min)

1. Go to https://cloud.livekit.io and sign up (free)
2. Create a new project
3. Copy your:
   - **API Key** (starts with `API...`)
   - **API Secret**
   - **WebSocket URL** (looks like `wss://your-project.livekit.cloud`)

---

## Step 2 — Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Open .env and fill in your LiveKit credentials
```

Your `.env` should look like:
```
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=your_secret_here
LIVEKIT_URL=wss://your-project.livekit.cloud
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

Test it's working:
```bash
curl http://localhost:8000/health
# → {"status":"ok","service":"lingo-api"}
```

---

## Step 3 — Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# .env.local already has NEXT_PUBLIC_API_URL=http://localhost:8000
# No changes needed for local dev
```

Start the frontend:
```bash
npm run dev
```

Open http://localhost:3000 — you should see the Lingo join screen.

---

## Step 4 — Test your first call

1. Open http://localhost:3000 in **two browser tabs** (or share with someone)
2. Enter your name and select your language in each tab
3. Use the **same room code** in both tabs (copy from the first tab's room name field)
4. Click **Start call** in both — you should see and hear each other

---

## Project structure

```
lingo/
├── backend/
│   ├── main.py              ← FastAPI app + token endpoint
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx          ← Join / home screen
    │   └── room/[roomName]/
    │       └── page.tsx      ← Room page (validates token, routes to VideoCall)
    ├── components/
    │   └── VideoCall.tsx     ← LiveKit room UI
    ├── next.config.js
    └── .env.example
```

---

## Deploying for free

### Frontend → Vercel

```bash
# Install Vercel CLI
npm i -g vercel

cd frontend
vercel

# When prompted:
# - Link to existing project? No → create new
# - Framework: Next.js (auto-detected)
# Add environment variable:
#   NEXT_PUBLIC_API_URL = https://your-backend.railway.app
```

### Backend → Railway

1. Go to https://railway.app and sign up (free $5 credit/month)
2. New Project → Deploy from GitHub repo
3. Select the `backend/` folder
4. Add environment variables (same as your `.env`):
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `LIVEKIT_URL`
   - `FRONTEND_URL` = your Vercel URL (e.g. `https://lingo.vercel.app`)
5. Railway auto-detects `requirements.txt` and sets start command to:
   `uvicorn main:app --host 0.0.0.0 --port $PORT`

Update `NEXT_PUBLIC_API_URL` in Vercel with the Railway URL, redeploy — done.

---

## What's next (Stage 2 — STT)

Stage 2 wires Whisper transcription into the LiveKit audio pipeline:

1. A Python `livekit-agents` worker subscribes to each participant's audio track
2. Audio is chunked at 300ms and sent to Whisper
3. Partial transcripts stream back to the frontend via WebSocket
4. Live captions appear below each participant's video tile

Files to be added in Stage 2:
- `backend/agent.py` — LiveKit agent worker
- `backend/stt.py` — Whisper streaming wrapper
- `frontend/components/CaptionOverlay.tsx` — live caption UI

---

## Troubleshooting

**"Failed to get token"** — Backend not running, or CORS misconfigured.
Check that `FRONTEND_URL` in `.env` matches where your frontend is running.

**Camera/microphone blocked** — Browser requires HTTPS for media devices except on localhost.
For local dev, `http://localhost:3000` works. For production, Vercel provides HTTPS automatically.

**Blank video tile** — The other participant's camera is off, or they haven't granted camera permission.

**Can't hear audio** — Check that `RoomAudioRenderer` is mounted (it's in VideoCall.tsx).
Also check browser volume and that the other participant's microphone is unmuted.
