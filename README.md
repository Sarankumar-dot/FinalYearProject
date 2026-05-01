# Sight & Sign — Accessible Learning for All

A multi-role, accessible, web-based education platform for visually impaired and hearing-impaired students.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| File Storage | Cloudinary |
| Speech-to-Text | OpenAI Whisper API |
| Text-to-Speech | Web Speech API (browser built-in) |

## Getting Started

### 1. Backend Setup

```bash
cd server
cp .env.example .env
# Fill in your MongoDB URI, Cloudinary keys, OpenAI API key in .env
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
# App runs on http://localhost:5173
```

### 3. API Keys Required

| Key | Where to Get |
|---|---|
| `MONGO_URI` | [MongoDB Atlas](https://www.mongodb.com/atlas) — free tier |
| `CLOUDINARY_*` | [Cloudinary](https://cloudinary.com) — free tier |
| `OPENAI_API_KEY` | [OpenAI Platform](https://platform.openai.com) — paid, optional |
| `JWT_SECRET` | Any secure random string |

> **Note:** The app works without Cloudinary/OpenAI keys — file upload and auto-transcription will fail gracefully, but all other features work fine.

## User Roles

| Role | Access |
|---|---|
| **Student** | Browse lessons, view in accessible formats, take quizzes, track progress |
| **Teacher** | Upload lessons, create quizzes, view analytics |
| **Admin** | Manage users, manage sign language video library |

## Accessibility Features

1. **Text-to-Speech** — Web Speech API reads any lesson content aloud
2. **Real-Time Captions** — Auto-generated from Whisper transcript, synced with video
3. **Sign Language Library** — Keyword-mapped videos shown alongside lessons
4. **Alt-Text Audio** — Image descriptions read aloud for visually impaired students
5. **Accessible Quizzes** — TTS reads questions; fully keyboard-navigable
6. **Accessibility Panel** — Theme (dark/light/high-contrast), font size, TTS speed, caption style
7. **Student Progress Dashboard** — Completion tracking, quiz scores, bookmarks
8. **WCAG 2.1 Compliant** — Focus indicators, ARIA labels, semantic HTML, colour contrast

## Project Structure

```
Codes/
├── server/           ← Node.js + Express backend
│   ├── src/
│   │   ├── index.js          ← Server entry point
│   │   ├── models/           ← Mongoose models
│   │   ├── routes/           ← API routes
│   │   ├── middleware/       ← Auth & role middleware
│   │   └── services/         ← Cloudinary, Whisper
│   ├── .env                  ← Environment variables
│   └── package.json
└── client/           ← React + Vite frontend
    ├── src/
    │   ├── App.jsx             ← Router
    │   ├── api/               ← Axios instance
    │   ├── context/           ← Auth + Accessibility contexts
    │   ├── components/        ← Shared components
    │   └── pages/             ← All page components
    └── package.json
```

## Seeding Sample Data

After registering an Admin account, go to **Admin → Sign Language Library** and click **"Seed Sample Videos"** to populate the library with demo sign language YouTube videos.

---

*Built as a Final Year Project — 2026*
