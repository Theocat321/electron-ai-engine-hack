# ElevenLabs Text-to-Speech Integration

This guide explains how to set up and use the ElevenLabs text-to-speech functionality in the AI engine.

## Setup Instructions

### 1. Get ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io/) and create an account
2. Navigate to your profile settings
3. Copy your API key from the API section

### 2. Configure Environment Variables

Create or update your `.env` file in the backend directory:

```bash
# Add this line to your .env file
ELEVENLABS_API_KEY=your_api_key_here
```

### 3. Install Dependencies

Install the required packages:

```bash
cd backend
pip install -r requirements.txt
```

### 4. Test the Integration

Run the test script to verify everything is working:

```bash
python test_tts.py
```

## How It Works

### Backend Integration

The TTS functionality is integrated into the main workflow:

1. **TTS Service** (`tts_service.py`): Handles communication with ElevenLabs API
2. **Main Server** (`main.py`): Automatically generates audio for task descriptions
3. **API Endpoints**:
    - `/initialize`: Returns task description with audio
    - `/update_screenshot`: Returns next task with audio
    - `/tts/generate`: Manual TTS generation endpoint
    - `/tts/voices`: List available voices

### Frontend Integration

The frontend automatically plays audio when receiving instructions:

1. **Audio Playback**: Converts base64 audio data to audio blob
2. **Automatic Playback**: Plays instructions when received from server
3. **Error Handling**: Gracefully handles TTS failures

## Available Voices

The system uses the default "Rachel" voice (ID: `21m00Tcm4TlvDq8ikWAM`). You can:

1. **List available voices**: GET `/tts/voices`
2. **Use different voice**: POST `/tts/generate` with `voice_id` parameter
3. **Change default voice**: Modify the `voice_id` parameter in the code

## Usage Examples

### Manual TTS Generation

```bash
curl -X POST "http://localhost:8000/tts/generate" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "text=Hello, this is a test message&voice_id=21m00Tcm4TlvDq8ikWAM"
```

### Get Available Voices

```bash
curl "http://localhost:8000/tts/voices"
```

## Troubleshooting

### Common Issues

1. **"API key not configured"**

    - Make sure `ELEVENLABS_API_KEY` is set in your `.env` file
    - Restart the server after adding the key

2. **"Speech generation failed"**

    - Check your internet connection
    - Verify your API key is valid
    - Check your ElevenLabs account credits

3. **Audio not playing in frontend**
    - Check browser console for errors
    - Ensure browser allows audio playback
    - Check if audio format is supported

### Testing

Run the test script to diagnose issues:

```bash
python test_tts.py
```

## Configuration Options

### Voice Settings

You can customize the voice by modifying these parameters:

-   **Voice ID**: Change the default voice
-   **Model**: Use different ElevenLabs models
-   **Volume**: Adjust playback volume in frontend

### Audio Format

The system uses MP3 format for compatibility. ElevenLabs supports:

-   MP3 (default)
-   WAV
-   FLAC

## Security Notes

-   Keep your API key secure and never commit it to version control
-   Monitor your ElevenLabs usage to avoid unexpected charges
-   Consider implementing rate limiting for production use
