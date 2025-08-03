import os
import base64
import tempfile
from elevenlabs import ElevenLabs
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self):
        """Initialize the TTS service with ElevenLabs API key."""
        self.api_key = os.getenv('ELEVENLABS_API_KEY')
        if not self.api_key:
            logger.warning("ELEVENLABS_API_KEY not found in environment variables")
            self.client = None
            return
        
        self.client = ElevenLabs(api_key=self.api_key)
        logger.info("ElevenLabs TTS service initialized")
    
    def text_to_speech(self, text, voice_id="21m00Tcm4TlvDq8ikWAM", model_id="eleven_monolingual_v1"):
        """
        Convert text to speech using ElevenLabs API.
        
        Args:
            text (str): The text to convert to speech
            voice_id (str): ElevenLabs voice ID (default: Rachel voice)
            model_id (str): ElevenLabs model ID
            
        Returns:
            dict: Contains base64 audio data and metadata
        """
        if not self.client:
            return {
                "error": "ElevenLabs API key not configured",
                "audio_base64": None
            }
        
        try:
            logger.info(f"Generating speech for text: {text[:50]}...")
            
            # Generate audio using ElevenLabs client
            audio = self.client.text_to_speech.convert(
                voice_id=voice_id,
                text=text,
                model_id=model_id
            )
            
            # Collect audio bytes
            audio_bytes = b""
            for chunk in audio:
                audio_bytes += chunk
            
            # Convert audio to base64
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            
            logger.info("Speech generation completed successfully")
            
            return {
                "audio_base64": audio_base64,
                "text": text,
                "voice_id": voice_id,
                "model_id": model_id,
                "audio_size_bytes": len(audio_bytes)
            }
            
        except Exception as e:
            logger.error(f"Error generating speech: {str(e)}")
            return {
                "error": f"Speech generation failed: {str(e)}",
                "audio_base64": None
            }
    
    def get_available_voices(self):
        """Get list of available voices from ElevenLabs."""
        if not self.client:
            return {"error": "ElevenLabs API key not configured"}
        
        try:
            available_voices = self.client.voices.get_all()
            return {
                "voices": [
                    {
                        "voice_id": voice.voice_id,
                        "name": voice.name,
                        "category": getattr(voice, 'category', 'unknown')
                    }
                    for voice in available_voices.voices
                ]
            }
        except Exception as e:
            logger.error(f"Error fetching voices: {str(e)}")
            return {"error": f"Failed to fetch voices: {str(e)}"}

# Global TTS service instance
tts_service = TTSService()