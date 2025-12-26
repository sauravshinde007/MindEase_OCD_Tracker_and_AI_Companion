# MindEase – OCD Tracker & AI Companion
**This is an open-source project. Please contribute to help improve the lives of people who are living with OCD.**

MindEase is a supportive and privacy-focused web application designed to help people understand their OCD patterns in a calm, structured, and non-judgmental space. It combines traditional mental-health tracking tools with AI-assisted Cognitive Behavioral Therapy (CBT) and Exposure and Response Prevention (ERP) techniques.

The goal is not to diagnose or treat—MindEase simply gives users a safe place to reflect, track, and navigate their daily challenges with a little more clarity.

---

## Features

###  AI & Smart Insights (New!)
- **AI Check-in Coach**: Have a natural conversation to log your mood. The AI automatically extracts anxiety scores and sleep data from your chat.
- **OCD Themes Analyzer**: Visual radar charts detect patterns in your logs (e.g., Contamination, Checking, Harm OCD).
- **Symptom Drift Detection**: AI identifies hidden correlations (e.g., "Anxiety spikes on Sundays" or "Poor sleep triggers compulsions").
- **Tiny Wins**: Micro-celebrations for resisting compulsions, maintaining streaks, and completing exposures.

###  Community Support (New!)
- **Social Stories**: Share your recovery journey and read stories from others.
- **Anonymous Posting**: Option to post stories and comments anonymously for complete privacy.
- **Supportive Environment**: A safe space to feel less alone.

###  Tracking & Awareness
- Daily check-ins for mood, anxiety, and intrusive thoughts
- Compulsion and trigger tracking
- Clear weekly, monthly, and long-term insights
- Visual charts to highlight patterns and progress

###  Private Journal
- Secure, personal space to document thoughts
- Encrypted entries to protect privacy
- Ability to search and revisit reflections over time

###  AI Companion
- Supportive, conversational guidance inspired by CBT principles
- Structured “thought deconstruction” to help analyze intrusive thoughts
- Grounding tools and gentle reframing suggestions
- ERP ladder generator tailored to personal fear themes

###  ERP & Habit Tools
- Create and track ERP exposure tasks
- “Compulsion Timer” to delay and resist urges
- Resistance Score to gamify recovery
- Routine and habit-building tools to encourage consistency

###  UI/UX
- Clean, simple, and calming interface
- Smooth transitions without visual overload
- Fully responsive layout for mobile and desktop
- Quick Hide mode for privacy when needed

---

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, Framer Motion, Recharts
**Backend:** Node.js, Express.js
**Database:** MongoDB (local or in-memory fallback)
**AI Integration:** OpenAI API (configurable)
**Authentication:** JSON Web Tokens (JWT) with HTTP-only cookies

---

## Getting Started

### Prerequisites
*   Node.js (v14 or higher)
*   MongoDB (Optional: The app automatically falls back to an in-memory database if a local MongoDB instance is not found).

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd MindEase_OCD_Tracker_and_AI_Companion
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd ../frontend
    npm install
    ```

### Configuration

1.  **Backend Environment**
    Create a `.env` file in the `backend` folder:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/mindease
    JWT_SECRET=your_super_secret_key
    OPENAI_API_KEY=your_openai_api_key_here
    NODE_ENV=development
    ```
    *Note: If you don't have an OpenAI API key, the app will use mock responses for demonstration purposes.*

### Running the Application

You can run both the frontend and backend with a single command from the **backend** directory:

```bash
cd backend
npm run dev:all
```

*   **Frontend**: http://localhost:5173
*   **Backend**: http://localhost:5000

---

## 📂 Project Structure

```
MindEase/
├── backend/                # Express Server & API
│   ├── controllers/        # Business logic (Auth, AI, Moods, Community, Analytics)
│   ├── models/             # Mongoose Schemas (User, MoodLog, Story, etc.)
│   ├── routes/             # API Routes
│   └── server.js           # Entry point
│
└── frontend/               # React Application
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # Auth Context
    │   ├── pages/          # Main Pages (Dashboard, Community, Analytics, AiCompanion)
    │   └── App.jsx         # Routing configuration
```

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.
