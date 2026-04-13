from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from livekit.api import AccessToken, VideoGrants
import os
import uuid
import random
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

print("URL:", os.getenv("LIVEKIT_URL"))
print("KEY:", os.getenv("LIVEKIT_API_KEY"))
print("SECRET:", os.getenv("LIVEKIT_API_SECRET"))

app = FastAPI(title="Lingo API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Be specific here
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

LIVEKIT_API_KEY    = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
LIVEKIT_URL        = os.getenv("LIVEKIT_URL")


class TokenRequest(BaseModel):
    room_name: str
    participant_name: str
    language: str = "en"


class TokenResponse(BaseModel):
    token: str
    livekit_url: str
    room_name: str
    participant_identity: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "lingo-api", "mode": "audio-only"}

@app.post("/api/token", response_model=TokenResponse)
def create_token(req: TokenRequest):
    # THIS PRINT IS CRUCIAL - Look for this in your terminal
    print(f"--- DEBUG DATA RECEIVED ---")
    print(f"Room: '{req.room_name}'")
    print(f"Participant: '{req.participant_name}'")
    print(f"Language: '{req.language}'")

    if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        raise HTTPException(status_code=500, detail="Keys missing")

    # Double check values aren't empty
    if not req.room_name or not req.participant_name:
         raise HTTPException(status_code=400, detail="Missing room or name")

    identity = f"{req.participant_name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"

    # Building the token step-by-step to be safe
    token = AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
    token.with_identity(identity)
    token.with_name(req.participant_name)
    
    grants = VideoGrants(
        room_join=True,
        room=req.room_name # Make sure this is the clean variable
    )
    token.with_grants(grants)
    
    try:
        jwt_token = token.to_jwt()
        return TokenResponse(
            token=jwt_token,
            livekit_url=LIVEKIT_URL or "",
            room_name=req.room_name,
            participant_identity=identity,
        )
    except Exception as e:
        print(f"JWT Error: {e}")
        raise HTTPException(status_code=500, detail="JWT generation failed")

@app.get("/api/rooms/new")
def new_room():
    """Generate a fresh random room name."""
    words = ["swift", "amber", "nova", "cedar", "echo", "flair", "grove", "haven",
             "ridge", "slate", "crest", "forge", "bloom", "delta", "nexus", "trace"]
    name = f"{random.choice(words)}-{random.choice(words)}-{random.randint(100, 999)}"
    return {"room_name": name}
