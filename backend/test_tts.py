#!/usr/bin/env python3
"""
Test script for ElevenLabs TTS functionality.
"""

import os
from dotenv import load_dotenv
from tts_service import tts_service

def test_tts():
    """Test the TTS service."""
    load_dotenv()
    
    print("Testing ElevenLabs TTS Service...")
    
    # Test 1: Check if API key is configured
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if not api_key:
        print("❌ ELEVENLABS_API_KEY not found in environment variables")
        print("Please set your ElevenLabs API key in the .env file")
        return False
    
    print("✅ API key found")
    
    # Test 2: Test voice generation
    test_text = "Hello! I'm your AI assistant. I'll help you with your tasks."
    print(f"Testing TTS with text: '{test_text}'")
    
    result = tts_service.text_to_speech(test_text)
    
    if "error" in result:
        print(f"❌ TTS generation failed: {result['error']}")
        return False
    
    print("✅ TTS generation successful")
    print(f"Audio size: {result.get('audio_size_bytes', 0)} bytes")
    
    # Test 3: Test getting available voices
    print("Testing voice list retrieval...")
    voices_result = tts_service.get_available_voices()
    
    if "error" in voices_result:
        print(f"❌ Voice list retrieval failed: {voices_result['error']}")
        return False
    
    voices = voices_result.get("voices", [])
    print(f"✅ Found {len(voices)} available voices")
    
    if voices:
        print("Sample voices:")
        for voice in voices[:3]:  # Show first 3 voices
            print(f"  - {voice['name']} (ID: {voice['voice_id']})")
    
    return True

if __name__ == "__main__":
    success = test_tts()
    if success:
        print("\n🎉 All TTS tests passed!")
    else:
        print("\n❌ Some TTS tests failed. Please check your configuration.") 