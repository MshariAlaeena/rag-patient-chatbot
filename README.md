# RAG Patient Chatbot

A full-stack **patient chatbot** application backed by Go (Gin) and Next.js.

<img src="https://console.groq.com/powered-by-groq.svg" style="width: 150px; height: auto;">

## 🚀 Project Overview

* **Backend**

  * Go service with modular structure
  * API entrypoints under `cmd/`
  * Business logic in `internal/`
* **Frontend**

  * Next.js 13 app (App Router)
  * Tailwind CSS + shadcn/ui components

## 🛠️ Features

- **Conversational AI**  
  – Context-aware patient triage and guidance  
- **Vector Search**  
  – Pinecone for fast semantic retrieval of medical knowledge  
- **Multimodal Input**  
  – Support for text, images, and structured prompts  
- **User Dashboard**  
  – Personalized quitting journey:  
    - Progress tracker & streaks  
    - Upcoming reminders & scheduled tips  
    - Motivational quotes & achievement badges  
    - Session history & insights 
- **Extensible Architecture**  
  – Plugin-ready design for adding new LLM models or data sources  

## 📁 Repo Layout

```
/
├── backend/                # Go server
│   ├── cmd/                # entrypoints (e.g. server)
│   ├── internal/           # app logic & handlers
│   ├── Makefile            # build & test for backend
│   ├── go.mod, go.sum
│   └── .env.example        # required env vars
├── frontend/               # Next.js app
│   ├── app/                # Next.js App Router
│   ├── components/
│   ├── public/
│   ├── styles/
│   ├── Makefile            # build & test for frontend
│   └── .env.local.example  # client env vars
├── Makefile                # orchestrate install, build, dev, test, clean
└── README.md               # this file
```

## ⚙️ Prerequisites

* Go 1.20+
* Node.js 18+ & npm (or pnpm/yarn)
* **Groq API Key** (free at [console.groq.com](https://console.groq.com))
* Docker & Docker Compose (optional)
* GNU Make

## 💾 Environment Variables

1. **Backend**
   Copy `backend/.env.example` → `backend/.env` and fill in your keys:

   ```env
   PINECONE_NAMESPACE=…
   PINECONE_API_KEY=…
   …
   ```
2. **Frontend**
   Copy `frontend/.env.local.example` → `frontend/.env.local`:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   ```

> **Note**: Frontend env files do *not* contain secrets—only public-facing URLs.

## 🔧 Setup

From the root, install everything:

```bash
make setup
```

This will:

1. Install Go deps and build the backend toolchain
2. Install Node deps and create your `.env.local` in frontend

## 🏃‍♂️ Development

Spin up both services in parallel:

```bash
make dev
```

* Backend runs on `:8080`
* Frontend runs on `:3000`

Open your browser at [http://localhost:3000](http://localhost:3000).

## 📦 Build & Release

Build both:

```bash
make build
```

Artifacts:

* `backend/patient-chatbot` (binary)
* `frontend/.next/` production bundle

## 🔍 Testing

Run tests in both services:

```bash
make test
```

Or individually:

```bash
make test-backend
make test-frontend
```

## 🧹 Clean

Remove build artifacts and caches:

```bash
make clean
```

## 🐳 Docker (optional)

Build and run via Docker Compose:

```bash
docker-compose up --build
```

You can split into `docker-compose.backend.yml` and `docker-compose.frontend.yml` if desired.

## 🎯 Useful Make Targets

* `make setup`       – install deps
* `make build`       – compile both services
* `make dev`         – run both in dev mode
* `make test`        – run all tests
* `make clean`       – wipe artifacts

Drill down into each subfolder for more specialized targets (`make backend.build`, `make frontend.dev`, etc.).

### Credits
This app was developed by Mshari Alaeena at Groq.