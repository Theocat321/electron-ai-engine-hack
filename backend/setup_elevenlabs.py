#!/usr/bin/env python3
"""
Setup script for ElevenLabs TTS integration.
"""

import os
import sys
from pathlib import Path

def setup_elevenlabs():
    """Interactive setup for ElevenLabs TTS."""
    print("🎤 ElevenLabs TTS Setup")
    print("=" * 40)
    
    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("Creating .env file...")
        env_file.touch()
    
    # Check if ELEVENLABS_API_KEY is already set
    from dotenv import load_dotenv
    load_dotenv()
    
    existing_key = os.getenv('ELEVENLABS_API_KEY')
    if existing_key:
        print(f"✅ ElevenLabs API key already configured: {existing_key[:8]}...")
        response = input("Do you want to update it? (y/N): ").lower().strip()
        if response != 'y':
            print("Setup complete!")
            return
    
    print("\n📋 Setup Steps:")
    print("1. Go to https://elevenlabs.io/ and create an account")
    print("2. Navigate to your profile settings")
    print("3. Copy your API key from the API section")
    print("4. Paste it below when prompted")
    
    api_key = input("\n🔑 Enter your ElevenLabs API key: ").strip()
    
    if not api_key:
        print("❌ No API key provided. Setup cancelled.")
        return
    
    # Validate API key format (basic check)
    if len(api_key) < 20:
        print("❌ API key seems too short. Please check and try again.")
        return
    
    # Update .env file
    try:
        # Read existing content
        with open(env_file, 'r') as f:
            lines = f.readlines()
        
        # Remove existing ELEVENLABS_API_KEY line if it exists
        lines = [line for line in lines if not line.startswith('ELEVENLABS_API_KEY=')]
        
        # Add new API key
        lines.append(f'ELEVENLABS_API_KEY={api_key}\n')
        
        # Write back to file
        with open(env_file, 'w') as f:
            f.writelines(lines)
        
        print("✅ API key saved to .env file")
        
    except Exception as e:
        print(f"❌ Error saving API key: {e}")
        return
    
    # Test the setup
    print("\n🧪 Testing setup...")
    try:
        from tts_service import tts_service
        
        # Test API key
        test_result = tts_service.text_to_speech("Hello, this is a test.")
        
        if "error" in test_result:
            print(f"❌ Test failed: {test_result['error']}")
            print("Please check your API key and try again.")
        else:
            print("✅ Setup successful! TTS is working correctly.")
            print(f"Test audio generated: {test_result.get('audio_size_bytes', 0)} bytes")
            
    except ImportError:
        print("❌ TTS service not found. Make sure you've installed the requirements:")
        print("   pip install -r requirements.txt")
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    print("\n🎉 Setup complete!")
    print("\nNext steps:")
    print("1. Start the backend server: python main.py")
    print("2. Start the frontend: npm start (from frontend directory)")
    print("3. The TTS will automatically play instructions when received")

if __name__ == "__main__":
    setup_elevenlabs() 