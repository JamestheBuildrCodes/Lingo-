from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from livekit.api import AccessToken, VideoGrants
import os
import uuid
import time
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Lingo API", version="1.0.0")

# Allow requests from your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "https://*.vercel.app",  # allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LIVEKIT_API_KEY    = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
LIVEKIT_URL        = os.getenv("LIVEKIT_URL")          # wss://your-project.livekit.cloud


class TokenRequest(BaseModel):
    room_name: str
    participant_name: str
    language: str = "en"    # participant's native language (for future STT routing)


class TokenResponse(BaseModel):
    token: str
    livekit_url: str
    room_name: str
    participant_identity: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "lingo-api"}


@app.post("/api/token", response_model=TokenResponse)
def create_token(req: TokenRequest):
    """
    Mint a LiveKit JWT token for a participant.
    The token grants publish + subscribe rights within the requested room.
    """
    if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        raise HTTPException(
            status_code=500,
            detail="LiveKit credentials not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET."
        )

    # Stable identity: name + short uuid suffix to allow the same name in different sessions
    identity = f"{req.participant_name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"

    token = (
        AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        .with_identity(identity)
        .with_name(req.participant_name)
        .with_grants(VideoGrants(
            room_join=True,
            room=req.room_name,
            can_publish=True,
            can_subscribe=True,
            can_publish_data=True,   # needed for sending caption data messages later
        ))
        # Metadata carries the participant's language — the AI pipeline reads this
        .with_metadata(f'{{"language":"{req.language}"}}')
        .to_jwt()
    )

    return TokenResponse(
        token=token,
        livekit_url=LIVEKIT_URL,
        room_name=req.room_name,
        participant_identity=identity,
    )


@app.get("/api/rooms/new")
def new_room():
    """Generate a fresh random room name."""
    words = ["swift", "amber", "nova", "cedar", "echo", "flair", "grove", "haven"]
    import random
    name = f"{random.choice(words)}-{random.choice(words)}-{random.randint(100, 999)}"
    return {"room_name": name}
