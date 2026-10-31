# 🤖 AI Developer Assistant

> A production-style, multi-agent AI software engineering platform built with **React**, **Node.js + Express**, **OpenAI API & Agents SDK**, **MongoDB**, and **GitHub API**.

---

## 🌟 Key Capabilities

1. **Analyze GitHub Repositories**
   - Ingests public or private GitHub repositories via full URL or `owner/repo` notation.
   - Extracts repository metadata, stargazers, forks, active branches, topics, and multi-language distribution.
   - Crawls recursive Git trees without requiring local disk cloning.

2. **Understand Project Structure & Architecture**
   - Autonomous **Repo Analyzer Agent** evaluates manifest files (`package.json`, `requirements.txt`, `go.mod`, `Dockerfile`, etc.).
   - Classifies architecture patterns (MVC, Modular Monolith, Fullstack Client-Server, Microservice).
   - Generates interactive directory tree explorers and code previewers with syntax highlighting.
   - Estimates lines of code, code file distribution, and critical entry points.

3. **Find Bugs & Suggest Automated Fixes**
   - Autonomous **Bug Hunter Agent** scans code files for security vulnerabilities (injection, hardcoded secrets, unsafe `eval`), concurrency issues, and unhandled errors.
   - Generates line ranges, root-cause explanations, suggested fix snippets, and unified Git diff patches.
   - Interactive UI with severity badges (`Critical`, `High`, `Medium`, `Low`).

4. **Generate Living Documentation**
   - Autonomous **Doc Generator Agent** synthesizes production-ready documentation:
     - `README.md` with badges, architecture overview, quick start, prerequisites, and contribution guides.
     - `docs/API.md` for REST API endpoints and payload formats.
     - `docs/ARCHITECTURE.md` for system diagrams and component roles.
   - Built-in live Markdown preview and raw Markdown editor.

5. **Create & Publish Pull Request Drafts**
   - Autonomous **PR Drafter Agent** bundles selected bug fixes or documentation updates into isolated feature branches (`ai-fix/patch-xxxx`).
   - Generates structured PR descriptions (Overview, Changes Summary, Verification Checklist).
   - Direct one-click publishing to GitHub via Octokit REST API with verified branches and commits.

---

## 🛠️ Architecture & Tech Stack

```
AI Developer Assistant/
├── client/                     # Frontend (React 18, Vite, Tailwind CSS, Lucide Icons)
│   ├── src/
│   │   ├── components/         # ArchitectureView, BugHunterView, DocGeneratorView, PRDraftView, AgentTerminal
│   │   ├── services/api.js     # REST & SSE Client
│   │   ├── App.jsx             # Main Application Shell
│   │   └── main.jsx
│   └── vite.config.js
│
├── server/                     # Backend (Node.js 22, Express.js, MongoDB/Mongoose)
│   ├── src/
│   │   ├── config/             # DB & Environment Configuration (Auto MongoDB Memory Server fallback)
│   │   ├── models/             # Mongoose Schemas (Repository, Analysis, BugReport, Documentation, PullRequestDraft, AgentSession)
│   │   ├── services/
│   │   │   ├── github.service.js   # Octokit GitHub REST API wrapper
│   │   │   ├── ai.service.js       # OpenAI API + Heuristic intelligence fallback
│   │   │   ├── agents/             # Autonomous Agents (RepoAnalyzer, BugHunter, DocGenerator, PRDrafter)
│   │   │   └── agentOrchestrator.service.js  # Agent lifecycle & real-time SSE dispatcher
│   │   ├── controllers/        # REST Controllers
│   │   ├── routes/             # Express API Endpoints
│   │   └── index.js            # Server entry point
│   └── test/
└── package.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **npm** or **pnpm**
- *(Optional)* MongoDB instance (if not running locally, the application automatically launches an in-memory MongoDB instance with zero configuration required!)
- *(Optional)* OpenAI API key and GitHub Personal Access Token (PAT)

### 2. Install Dependencies
```bash
# Install root orchestration tools
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 3. Configure Environment (.env)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your credentials:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_developer_assistant
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
GITHUB_TOKEN=ghp_...
```

### 4. Run the Application
In development mode, launch both backend and frontend concurrently:
```bash
npm run dev
```
- **Backend API & SSE**: `http://localhost:5000`
- **Frontend Web UI**: `http://localhost:3000`

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/repos/ingest` | Ingest and trigger full repository analysis |
| `GET` | `/api/repos` | List all analyzed repositories |
| `GET` | `/api/repos/:id/file?path=...` | Fetch raw source file from GitHub |
| `GET` | `/api/analysis/:repoId` | Retrieve project architecture & tree analysis |
| `GET` | `/api/bugs/:repoId` | List detected bugs and unified diff fixes |
| `POST` | `/api/bugs/:repoId/scan` | Trigger autonomous bug hunter scan |
| `GET` | `/api/docs/:repoId` | Get generated documentation |
| `POST` | `/api/docs/:repoId/generate` | Generate README / API / Architecture docs |
| `GET` | `/api/prs/:repoId` | List pull request drafts |
| `POST` | `/api/prs/:repoId/draft` | Create PR draft & publish to GitHub |
| `GET` | `/api/agent/stream` | Server-Sent Events (SSE) live telemetry feed |

---

## 🔒 Security & Best Practices
- Strict validation of repository strings prevents path traversal.
- Passwords, secrets, and private keys are never committed or exposed in client responses.
- In-memory database fallback prevents unhandled crash states in air-gapped or test environments.
