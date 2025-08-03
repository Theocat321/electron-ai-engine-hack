# Clueless: Turning Tech Troubles into Triumphs

Clueless is a cross-platform desktop AI assistant that guides users step-by-step through digital tasks—empowering anyone to use technology confidently and independently. No more overwhelming tutorials or relying on others—Clueless highlights, explains, and guides you in real time, right on your own screen.

---

## 🚀 Features

- **On-Screen Guidance**: Visual step-by-step highlights and cues over your existing apps.
- **Conversational Interface**: Type or speak your goal—Clueless takes you there.
- **Voice Assistance**: Natural instructions powered by ElevenLabs TTS.
- **Multimodal AI**: Understands and processes text, images, and code using advanced LLMs (Claude/Anthropic, LangChain).
- **Inclusive Design**: Accessible for elderly users, late tech adopters, and anyone struggling with digital tasks.
- **Progressive Learning**: Builds user confidence over time instead of fostering dependency.

---

## 🛠️ Technology Stack

- **Backend**: Python, LangChain, Langraph
- **Frontend**: Electron.js
- **AI & Tools**: ElevenLabs (voice synthesis), aci.dev (AI infrastructure), Anthropic Claude (multimodal LLM: text, code, image)
- **Capabilities**: Real-time UI automation, natural voice instructions, multimodal input/output

---

## 🎯 Who Is Clueless For?

- Elderly individuals & late tech adopters
- Parents re-entering the workforce
- Teachers adapting to digital classrooms
- NGOs, community centers, and digital inclusion programs
- Enterprises looking to streamline and partially automate tech support

---

## 🌟 What Makes Clueless Different?

- **Empowerment, Not Automation**: Teaches users to solve problems, rather than doing it all for them.
- **Works With Existing Apps**: No need to learn new interfaces—guides you right where you are.
- **Enterprise Potential**: Can reduce human tech support needs, saving costs while delivering 24/7 assistance.

---

## 🔮 Future Roadmap

- Multilingual support & advanced accessibility
- Deeper integration with enterprise IT support
- Expansion into new platforms and use cases (education, remote work, more)

---

## ⚡ Challenges

Building a seamless, integrated AI solution in just two days was a huge challenge! We focused on core features, rapid prototyping, and a scalable foundation to move fast and demonstrate impact.

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/clueless.git
cd clueless
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Add your API keys (Anthropic, ElevenLabs) to .env
pip install -r requirements.txt
python setup_elevenlabs.py  # Or manually add ELEVENLABS_API_KEY to .env
python test_tts.py          # Optional: test TTS integration
python main.py              # Start the backend server (http://localhost:8000)
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

---

## 🖥️ Usage

1. **Start the backend and frontend as above.**
2. **Enter your instruction** in the input window (e.g., "Send an email to John on Gmail").
3. **Follow the AI's step-by-step instructions**:
    - Listen to the voice prompt.
    - Click the highlighted hotspot on your screen.
    - Continue until your goal is accomplished.
4. **Control audio and check status** using the conversation interface buttons.

---

## 🛠️ Customization

- **Change Default Voice**: Edit `voice_id` in [`backend/tts_service.py`](backend/tts_service.py).
- **Adjust Audio Volume**: Edit `audio.volume` in [`frontend/components/floatingBox.js`](frontend/components/floatingBox.js).
- **UI Styling**: Modify CSS in [`frontend/styles.css`](frontend/styles.css) or [`frontend/consolidated.css`](frontend/consolidated.css).

---

## 📚 Documentation

- [backend/README.md](backend/README.md): Backend API, endpoints, and architecture.
- [README_TTS.md](README_TTS.md): ElevenLabs TTS integration details.
- [backend/ELEVENLABS_SETUP.md](backend/ELEVENLABS_SETUP.md): TTS setup and troubleshooting.

---

## 🤝 Contributing

1. Fork the repo and create a feature branch.
2. Test your changes (`test_api_endpoints.py`, `test_tts.py`).
3. Update documentation as needed.
4. Submit a pull request.

---

## 📜 License

MIT License

---

**Clueless** – Empowering everyone to master technology,
