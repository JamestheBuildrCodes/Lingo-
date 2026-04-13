"""
Lingo! — Stage 3: Translation Engine
──────────────────────────────────────
Two translation engines, automatically selected by language pair:

  LibreTranslate  — fast REST API, free, covers European + common languages
  NLLB-200        — Meta open-source model, offline, covers Yoruba / Igbo /
                    Hausa / Swahili / Mandarin and 200 language pairs total

The router picks LibreTranslate first. If the pair is not supported,
it falls back to NLLB-200. If NLLB is disabled or also fails, it
returns the original text unchanged (graceful degradation).
"""

import asyncio
import logging
import os
import time
from typing import Optional
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline


import requests

logger = logging.getLogger("lingo-translator")

# ─── Language code mappings ───────────────────────────────────────────────────
# LibreTranslate uses ISO 639-1 (en, fr, zh, es...)
# NLLB-200 uses FLORES-200 codes (eng_Latn, fra_Latn, zho_Hans...)

NLLB_CODES: dict[str, str] = {
    "en": "eng_Latn",
    "fr": "fra_Latn",
    "zh": "zho_Hans",   # Simplified Chinese
    "es": "spa_Latn",
    "de": "deu_Latn",
    "ar": "arb_Arab",
    "pt": "por_Latn",
    "ja": "jpn_Jpan",
    "ko": "kor_Hang",
    "yo": "yor_Latn",   # Yoruba — not in LibreTranslate
    "ig": "ibo_Latn",   # Igbo   — not in LibreTranslate
    "ha": "hau_Latn",   # Hausa  — not in LibreTranslate
    "sw": "swh_Latn",   # Swahili
    "am": "amh_Ethi",   # Amharic
}

# Language pairs LibreTranslate handles reliably
LIBRETRANSLATE_PAIRS: set[tuple[str, str]] = {
    ("en", "fr"), ("fr", "en"),
    ("en", "es"), ("es", "en"),
    ("en", "de"), ("de", "en"),
    ("en", "pt"), ("pt", "en"),
    ("en", "zh"), ("zh", "en"),
    ("en", "ar"), ("ar", "en"),
    ("en", "ja"), ("ja", "en"),
    ("en", "ko"), ("ko", "en"),
    ("fr", "es"), ("es", "fr"),
    ("fr", "de"), ("de", "fr"),
    ("fr", "zh"), ("zh", "fr"),
    ("es", "de"), ("de", "es"),
    ("es", "zh"), ("zh", "es"),
    ("de", "zh"), ("zh", "de"),
}

# Pairs that MUST go through NLLB (African + less common)
NLLB_REQUIRED: set[str] = {"yo", "ig", "ha", "sw", "am"}


class TranslationEngine:
    """
    Manages both translation backends.
    Call translate(text, source_lang, target_lang) — it picks the right engine.
    """

    def __init__(self):
        self.libre_url = os.getenv("LIBRETRANSLATE_URL", "https://libretranslate.com")
        self.libre_key = os.getenv("LIBRETRANSLATE_API_KEY", "")
        self.nllb_enabled = os.getenv("NLLB_ENABLED", "true").lower() == "true"
        self.nllb_model_name = os.getenv("NLLB_MODEL", "facebook/nllb-200-distilled-600M")

        self._nllb_pipeline = None
        self._nllb_loaded = False
        self._nllb_loading = False

        # Context windows — last 30s of transcript per speaker, used for coherence
        self._context: dict[str, list[str]] = {}

        logger.info(
            f"TranslationEngine ready. "
            f"LibreTranslate: {self.libre_url} | "
            f"NLLB: {'enabled' if self.nllb_enabled else 'disabled'}"
        )

    # ── Public API ─────────────────────────────────────────────────────────────

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        speaker_identity: str = "",
    ) -> Optional[str]:
        """
        Translate text from source_lang to target_lang.
        Returns translated string, or None if translation failed.

        speaker_identity is used to maintain a rolling context window
        so the translator resolves pronouns and trade terms across turns.
        """
        if not text.strip():
            return None
        if source_lang == target_lang:
            return text

        # Update context window for this speaker
        self._add_to_context(speaker_identity, text)

        # Route to the right engine
        needs_nllb = (
            source_lang in NLLB_REQUIRED or
            target_lang in NLLB_REQUIRED or
            (source_lang, target_lang) not in LIBRETRANSLATE_PAIRS
        )

        if not needs_nllb:
            result = await self._libre_translate(text, source_lang, target_lang)
            if result:
                return result
            logger.warning(f"LibreTranslate failed for {source_lang}→{target_lang}, trying NLLB")

        if self.nllb_enabled:
            result = await self._nllb_translate(text, source_lang, target_lang)
            if result:
                return result

        logger.error(f"All translation engines failed for {source_lang}→{target_lang}")
        return None

    def get_engine_for_pair(self, source: str, target: str) -> str:
        """Returns which engine will handle this pair — for logging/debugging."""
        if source in NLLB_REQUIRED or target in NLLB_REQUIRED:
            return "NLLB-200"
        if (source, target) in LIBRETRANSLATE_PAIRS:
            return "LibreTranslate"
        return "NLLB-200"

    # ── LibreTranslate ─────────────────────────────────────────────────────────

    async def _libre_translate(
        self, text: str, source: str, target: str
    ) -> Optional[str]:
        """Call the LibreTranslate REST API."""
        try:
            payload: dict = {
                "q": text,
                "source": source,
                "target": target,
                "format": "text",
            }
            if self.libre_key:
                payload["api_key"] = self.libre_key

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: requests.post(
                    f"{self.libre_url}/translate",
                    json=payload,
                    timeout=5,
                )
            )
            response.raise_for_status()
            data = response.json()
            translated = data.get("translatedText", "").strip()
            if translated:
                logger.debug(f"LibreTranslate {source}→{target}: {text[:40]} → {translated[:40]}")
                return translated
        except requests.exceptions.Timeout:
            logger.warning("LibreTranslate timeout")
        except requests.exceptions.HTTPError as e:
            logger.warning(f"LibreTranslate HTTP error: {e}")
        except Exception as e:
            logger.warning(f"LibreTranslate error: {e}")
        return None

    # ── NLLB-200 ───────────────────────────────────────────────────────────────

    async def _nllb_translate(
        self, text: str, source: str, target: str
    ) -> Optional[str]:
        """Use Meta's NLLB-200 model (local, offline)."""
        if not self._nllb_loaded:
            await self._load_nllb()

        if self._nllb_pipeline is None:
            return None

        src_code = NLLB_CODES.get(source)
        tgt_code = NLLB_CODES.get(target)

        if not src_code or not tgt_code:
            logger.warning(f"NLLB: no FLORES code for {source} or {target}")
            return None

        try:
            loop = asyncio.get_event_loop()

            def run_inference():
                # We need the tokenizer to get the language ID
                tokenizer = self._nllb_pipeline.tokenizer
                
                result = self._nllb_pipeline(
                    text,
                    src_lang=src_code,
                    tgt_lang=tgt_code,
                    # This line is CRITICAL for NLLB to output the right language
                    forced_bos_token_id=tokenizer.lang_code_to_id[tgt_code],
                    max_length=512,
                )
                return result[0]["generated_text"] # NLLB uses 'generated_text' for this task
            
            translated = await loop.run_in_executor(None, run_inference)
            if translated:
                logger.debug(f"NLLB {source}→{target}: {text[:40]} → {translated[:40]}")
                return translated
        except Exception as e:
            logger.error(f"NLLB inference error: {e}")
        return None

    async def _load_nllb(self):
        """Load NLLB-200 model."""
        if self._nllb_loading:
            while self._nllb_loading:
                await asyncio.sleep(0.5)
            return

        self._nllb_loading = True
        logger.info(f"Loading NLLB-200 model: {self.nllb_model_name}")
        t0 = time.time()

        try:
            loop = asyncio.get_event_loop()

            def load():
                # We use 'translation' as the task for NLLB compatibility
                tokenizer = AutoTokenizer.from_pretrained(self.nllb_model_name)
                model = AutoModelForSeq2SeqLM.from_pretrained(self.nllb_model_name)
                
                return pipeline(
                    "translation", 
                    model=model, 
                    tokenizer=tokenizer,
                    device=-1 # Set to 0 if you have a GPU, -1 for CPU
                )

            self._nllb_pipeline = await loop.run_in_executor(None, load)
            self._nllb_loaded = True
            logger.info(f"NLLB-200 loaded in {time.time() - t0:.1f}s")
        except Exception as e:
            logger.error(f"Failed to load NLLB-200: {e}")
            # Don't set _nllb_loaded to True if it failed, so we can retry
        finally:
            self._nllb_loading = False
    # ── Context window ─────────────────────────────────────────────────────────

    def _add_to_context(self, identity: str, text: str):
        """Maintain a rolling window of the last 5 utterances per speaker."""
        if not identity:
            return
        if identity not in self._context:
            self._context[identity] = []
        self._context[identity].append(text)
        if len(self._context[identity]) > 5:
            self._context[identity].pop(0)

    def get_context(self, identity: str) -> str:
        """Return recent transcript for a speaker (for logging/debugging)."""
        return " | ".join(self._context.get(identity, []))
