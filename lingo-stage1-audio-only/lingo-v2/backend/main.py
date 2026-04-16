from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from livekit.api import AccessToken, VideoGrants
import os
import uuid
import random

app = FastAPI(title="Lingo API", version="1.0.0")

# --- FIXED CORS SETTINGS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://lingo-21.onrender.com",  # Your live frontend
        "http://localhost:3000",          # Local testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Updated to handle both /api/token and //api/token just in case
@app.api_route("/api/token", methods=["POST", "OPTIONS"])
def create_token(req: TokenRequest):
    # Fetching inside the function ensures Render variables are loaded
    lk_key = os.getenv("LIVEKIT_API_KEY")
    lk_secret = os.getenv("LIVEKIT_API_SECRET")
    lk_url = os.getenv("LIVEKIT_URL")

    print(f"--- DEBUG: TOKEN REQUEST RECEIVED ---")
    print(f"URL: {lk_url} | Room: {req.room_name}")

    if not lk_key or not lk_secret:
        raise HTTPException(status_code=500, detail="LiveKit credentials missing on server")

    identity = f"{req.participant_name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"

    token = AccessToken(lk_key, lk_secret)
    token.with_identity(identity)
    token.with_name(req.participant_name)
    
    grants = VideoGrants(room_join=True, room=req.room_name)
    token.with_grants(grants)
    
    try:
        jwt_token = token.to_jwt()
        return TokenResponse(
            token=jwt_token,
            livekit_url=lk_url or "",
            room_name=req.room_name,
            participant_identity=identity,
        )
    except Exception as e:
        print(f"JWT Error: {e}")
        raise HTTPException(status_code=500, detail="JWT generation failed")

@app.api_route("/api/rooms/new", methods=["GET", "POST"])
def new_room():
    words = ["swift", "amber", "nova", "cedar", "echo", "flair", "grove", "haven",
             "ridge", "slate", "crest", "forge", "bloom", "delta", "nexus", "trace"]
    name = f"{random.choice(words)}-{random.choice(words)}-{random.randint(100, 999)}"
    return {"room_name": name}
