# Clueless  
Empowering Businesses with On-the-Go Interactive Workflow Guidance

Clueless is an AI-powered desktop assistant built for businesses to deliver real-time, step-by-step visual guidance and support within their own software. Whether it’s onboarding new customers, answering “how-to” questions instantly, or solving support queries on the go, Clueless transforms static help docs into dynamic, on-screen walkthroughs—making your product intuitive, your customers successful, and your support teams more efficient.

---

## 🚀 Key Features

- **On-the-Go Workflows**: Show users exactly what to do—live, in your own application. Perfect for onboarding, feature adoption, and support.
- **Visual Step Guidance**: Instantly highlight buttons, forms, and next actions with clear visual cues—no more confusion or screen-sharing hassles.
- **Conversational Support**: Users type or speak their question (e.g., “How do I add a user?”) and Clueless walks them through it in real time.
- **Multimodal AI**: Powered by advanced LLMs (Anthropic Claude, LangChain) for smart, context-aware assistance and workflow creation.
- **Voice Instructions**: ElevenLabs TTS delivers natural, accessible voice guidance for every workflow step.
- **Seamless Integration**: Works as an overlay on top of your web or desktop application, requiring no change to your existing UI.

---

## 🛠️ Technology Stack

- **Backend**: Python, LangChain, Langraph
- **Frontend**: Electron.js
- **AI & Tools**: ElevenLabs (voice synthesis), Aci.dev (AI infrastructure), Anthropic Claude (multimodal LLM)
- **Capabilities**: Visual UI automation, conversational workflow engine, voice-guided walkthroughs

---

## 🎯 Use Cases

- **Customer Onboarding**: Guide new users through product setup and first-time tasks, reducing churn and support tickets.
- **Feature Adoption**: Show users how to use new or underutilized features—right inside your app.
- **Live Troubleshooting**: Resolve customer queries instantly with contextual, step-by-step on-screen assistance.
- **Employee Training**: Accelerate internal onboarding and upskilling with interactive, self-paced guides.

---

## 🌟 Why Clueless for B2B?

- **Faster Onboarding**: Dramatically reduce onboarding time and boost customer activation.
- **Reduced Support Load**: Empower users to solve problems independently, cutting down on repetitive support queries.
- **Personalized Experience**: Deliver context-aware, in-app guidance tailored to each workflow or user segment.
- **Scalable**: Roll out updates, new guides, and process changes instantly across your entire customer base or workforce.
- **Actionable Insights**: Track workflow completion, identify friction points, and optimize your onboarding and support flows.

---

## 🔮 Roadmap

- Deeper API integrations for dynamic workflow generation
- Advanced analytics and reporting dashboards
- Mobile and web browser extension support
- Multi-language and accessibility enhancements

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

## 📜 Property Of Developers

- Adam O'Neill
- Jeremy Shorter
- Pratyaksh Mishra


---
