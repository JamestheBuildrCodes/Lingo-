import asyncio
import json
import logging
import os
import translator

# Create the engine instance once at the top level
engine = translator.TranslationEngine()

from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, stt
from livekit.plugins import deepgram

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lingo-agent")

@dataclass
class TranscriptMessage:
    participant_identity: str
    participant_name: str
    language: str
    text: str
    is_final: bool

    def to_json(self) -> str:
        return json.dumps({
            "type": "transcript",
            "identity": self.participant_identity,
            "name": self.participant_name,
            "language": self.language,
            "text": self.text,
            "is_final": self.is_final,
        })

async def handle_participant(ctx: JobContext, participant: rtc.RemoteParticipant, language: str = "en"):
    logger.info(f"Starting STT for {participant.identity} (language={language})")

    stt_instance = deepgram.STT(model="nova-2", language=language)
    stt_stream = stt_instance.stream()

    async def push_audio():
        try:
            # Look for the microphone track
            for publication in participant.track_publications.values():
                if publication.source == rtc.TrackSource.SOURCE_MICROPHONE:
                    # Wait for track to be subscribed
                    while not publication.track:
                        await asyncio.sleep(0.1)
                    
                    logger.info(f"Subscribing to mic for {participant.identity}")
                    async for audio_event in rtc.AudioStream(publication.track):
                        stt_stream.push_frame(audio_event.frame)
                    break
        except Exception as e:
            logger.error(f"Push audio error for {participant.identity}: {e}")

    async def read_transcripts():
        async for event in stt_stream:
            if event.type not in (stt.SpeechEventType.INTERIM_TRANSCRIPT, stt.SpeechEventType.FINAL_TRANSCRIPT):
                continue
            
            if not event.alternatives or not event.alternatives[0].text:
                continue

            text = event.alternatives[0].text.strip()
            is_final = (event.type == stt.SpeechEventType.FINAL_TRANSCRIPT)

            if is_final:
                try:
                    # Determine codes for NLLB
                    target_code = "fra_Latn" if language == "en" else "eng_Latn"
                    source_code = "eng_Latn" if language == "en" else "fra_Latn"
                    
                    translated_text = await engine.translate(
                        text=text, 
                        source_lang=source_code, 
                        target_lang=target_code
                    )
                    if translated_text:
                        text = translated_text
                except Exception as e:
                    logger.error(f"Translation failed: {e}")

            msg = TranscriptMessage(
                participant_identity=participant.identity,
                participant_name=participant.name or participant.identity,
                language=language,
                text=text,
                is_final=is_final,
            )

            await ctx.room.local_participant.publish_data(
                msg.to_json().encode(),
                reliable=True,
                topic="transcriptions"
            )

    try:
        await asyncio.gather(push_audio(), read_transcripts())
    except Exception as e:
        logger.error(f"Error in handle_participant for {participant.identity}: {e}")

async def entrypoint(ctx: JobContext):
    logger.info(f"Agent connected to room: {ctx.room.name}")
    
    # Connect with audio-only auto-subscribe
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # Identify as agent
    await ctx.room.local_participant.set_metadata(json.dumps({"is_agent": True}))

    def get_user_lang(participant):
        try:
            meta = json.loads(participant.metadata or "{}")
            return meta.get("language", "en")
        except:
            return "en"

    # 1. Handle people already in the room
    for participant in ctx.room.remote_participants.values():
        user_lang = get_user_lang(participant)
        asyncio.create_task(handle_participant(ctx, participant, language=user_lang))

    # 2. Handle people who join later
    @ctx.room.on("participant_connected")
    def on_participant_connected(participant: rtc.RemoteParticipant):
        user_lang = get_user_lang(participant)
        logger.info(f"Participant joined: {participant.identity} (Lang: {user_lang})")
        asyncio.create_task(handle_participant(ctx, participant, language=user_lang))

    # Keep alive loop
    while ctx.room.connection_state == rtc.ConnectionState.CONN_CONNECTED:
        await asyncio.sleep(1)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))