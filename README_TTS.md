# ElevenLabs Text-to-Speech Integration

This project now includes ElevenLabs text-to-speech functionality that automatically reads out instructions received from the AI server. The TTS integration provides a natural voice interface for the AI assistant.

## 🎯 Features

-   **Automatic Audio Playback**: Instructions are automatically read aloud when received
-   **Volume Control**: Toggle audio on/off with a dedicated button
-   **High-Quality Voices**: Uses ElevenLabs' premium voice synthesis
-   **Error Handling**: Graceful fallback when TTS is unavailable
-   **Multiple Voice Options**: Support for different ElevenLabs voices

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up ElevenLabs

Run the interactive setup script:

```bash
python setup_elevenlabs.py
```

Or manually add your API key to `.env`:

```bash
ELEVENLABS_API_KEY=your_api_key_here
```

### 3. Test the Integration

```bash
python test_tts.py
```

### 4. Start the Application

```bash
# Backend
python main.py

# Frontend (in another terminal)
cd frontend
npm start
```

## 📁 Implementation Overview

### Backend Components

#### `tts_service.py`

-   **Purpose**: Handles ElevenLabs API communication
-   **Key Functions**:
    -   `text_to_speech()`: Converts text to audio
    -   `get_available_voices()`: Lists available voices
-   **Error Handling**: Graceful fallback when API is unavailable

#### `main.py` (Updated)

-   **New Endpoints**:
    -   `/tts/generate`: Manual TTS generation
    -   `/tts/voices`: List available voices
-   **Enhanced Responses**: All task responses now include `audio_base64` field
-   **Automatic TTS**: Task descriptions are automatically converted to speech

### Frontend Components

#### `floatingBox.js` (Updated)

-   **Audio Playback**: `playAudioFromBase64()` function
-   **Volume Control**: Toggle button with visual feedback
-   **Automatic Playback**: Audio plays when instructions are received
-   **Error Handling**: Graceful handling of audio failures

#### `styles.css` (Updated)

-   **Volume Button**: Purple gradient styling
-   **Status Button**: Green gradient styling
-   **Button Container**: Flexbox layout for multiple buttons

## 🎛️ Configuration

### Voice Settings

**Default Voice**: Rachel (`21m00Tcm4TlvDq8ikWAM`)

**Change Voice**:

1. Get available voices: `GET /tts/voices`
2. Use different voice: `POST /tts/generate` with `voice_id` parameter
3. Modify default in code: Update `voice_id` in `tts_service.py`

### Audio Settings

**Volume**: Set to 80% by default (modifiable in `playAudioFromBase64()`)
**Format**: MP3 (ElevenLabs default)
**Quality**: High-quality voice synthesis

## 🔧 API Endpoints

### TTS Endpoints

#### Generate Speech

```bash
POST /tts/generate
Content-Type: application/x-www-form-urlencoded

text=Your text here&voice_id=21m00Tcm4TlvDq8ikWAM
```

**Response**:

```json
{
    "audio_base64": "base64_encoded_audio_data",
    "text": "Your text here",
    "voice_id": "21m00Tcm4TlvDq8ikWAM",
    "model_id": "eleven_monolingual_v1",
    "audio_size_bytes": 12345
}
```

#### Get Available Voices

```bash
GET /tts/voices
```

**Response**:

```json
{
    "voices": [
        {
            "voice_id": "21m00Tcm4TlvDq8ikWAM",
            "name": "Rachel",
            "category": "premade"
        }
    ]
}
```

### Enhanced Task Endpoints

#### Initialize Session

```bash
POST /initialize
```

**Response** (now includes audio):

```json
{
    "x": 100,
    "y": 200,
    "task": "Click the button",
    "task_description": "Please click the blue button in the top right corner",
    "is_completed": false,
    "audio_base64": "base64_encoded_audio_data"
}
```

#### Update Screenshot

```bash
POST /update_screenshot
```

**Response** (now includes audio):

```json
{
    "x": 150,
    "y": 250,
    "task": "Next step",
    "task_description": "Now please fill in the form field",
    "is_completed": false,
    "audio_base64": "base64_encoded_audio_data"
}
```

## 🎮 User Interface

### Volume Control

-   **Button**: 🔊 (enabled) / 🔇 (disabled)
-   **Function**: Toggle audio playback on/off
-   **Visual Feedback**: Button changes icon and tooltip
-   **Persistence**: State maintained during session

### Button Layout

The conversation interface now includes three buttons:

1. **Next**: Continue to next task
2. **Status**: Check current session status
3. **Volume**: Toggle audio on/off

## 🛠️ Troubleshooting

### Common Issues

#### "API key not configured"

```bash
# Solution: Run setup script
python setup_elevenlabs.py
```

#### "Speech generation failed"

-   Check internet connection
-   Verify API key validity
-   Check ElevenLabs account credits

#### "Audio not playing"

-   Check browser console for errors
-   Ensure browser allows audio playback
-   Verify audio format support

### Testing

```bash
# Test TTS functionality
python test_tts.py

# Test API endpoints
curl -X POST "http://localhost:8000/tts/generate" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "text=Test message"
```

## 🔒 Security Considerations

-   **API Key Protection**: Never commit API keys to version control
-   **Rate Limiting**: Consider implementing rate limiting for production
-   **Usage Monitoring**: Monitor ElevenLabs usage to avoid unexpected charges

## 📊 Performance

-   **Audio Generation**: ~1-3 seconds per instruction
-   **Audio Playback**: Immediate after generation
-   **Memory Usage**: Minimal (audio blobs are cleaned up after playback)
-   **Network**: Requires internet connection for TTS generation

## 🔄 Workflow

1. **User Input**: User provides instruction via text input
2. **Screenshot Capture**: System captures current screen
3. **AI Processing**: Backend processes instruction and generates task
4. **TTS Generation**: Task description is converted to speech
5. **Audio Playback**: Frontend automatically plays the audio instruction
6. **Visual Feedback**: Hotspot appears at target coordinates
7. **User Action**: User clicks hotspot to complete task

## 🎨 Customization

### Change Default Voice

Edit `tts_service.py`:

```python
def text_to_speech(self, text, voice_id="YOUR_PREFERRED_VOICE_ID", model_id="eleven_monolingual_v1"):
```

### Adjust Volume

Edit `floatingBox.js`:

```javascript
audio.volume = 0.8; // Change to desired volume (0.0 to 1.0)
```

### Modify Audio Format

Edit `tts_service.py` to use different ElevenLabs models or formats.

## 📝 Development Notes

### Architecture Decisions

1. **Base64 Encoding**: Used for easy transmission over HTTP
2. **Blob URLs**: Efficient audio playback in browser
3. **Error Handling**: Graceful degradation when TTS fails
4. **Volume Control**: User-friendly toggle instead of slider

### Future Enhancements

-   **Voice Selection**: UI for choosing different voices
-   **Speed Control**: Adjustable playback speed
-   **Caching**: Cache frequently used audio
-   **Offline Mode**: Fallback to system TTS when offline

## 🤝 Contributing

When adding TTS-related features:

1. Test with `test_tts.py`
2. Update documentation
3. Handle errors gracefully
4. Consider performance implications
5. Maintain backward compatibility

## 📄 License

This TTS integration uses ElevenLabs API. Please review their terms of service and pricing at https://elevenlabs.io/.
