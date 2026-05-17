# 🌌 FlowForge AI

> **An intelligent multi-agent orchestration dashboard that automates complex technical workflows, tracking sub-tasks with real-time risk evaluation metrics.**

Built for the **Google Cloud Rapid Agent Hackathon**, FlowForge AI bridges the "visibility gap" in multi-step AI operations. Instead of running background workflows in a hidden black box, FlowForge AI provides a transparent, intuitive command deck where users don't just prompt an agent—they orchestrate a highly visual, cooperative AI workforce.

🌐 **Live Demo:** [https://flowforage-ai.netlify.app/]

---

## 🧠 The Inspiration

Traditional multi-agent tasks often run within a hidden backend "black box," leaving developers blind when a step in a multi-layered workflow encounters an error or fails to execute cleanly. **FlowForge AI** resolves this visibility gap. We wanted to design a highly intuitive, transparent analytics command deck where developers can visualize, trace, and interact with an autonomous AI workforce in real time.

---

## ✨ Key Features & What It Does

FlowForge AI allows users to break down abstract project concepts (e.g., *"Build a food delivery app in 7 days"*) into a fully mapped operational blueprint:

* **🔮 Multi-Agent Orchestration:** Seamless execution paths combining specialized LLM models leveraging both Gemini and Claude APIs.
* **📈 Real-Time Task Tracking:** Break complex prompt requests down into discrete, executing sub-tasks with responsive visual status cards.
* **🎛️ System Observability Deck:** High-contrast analytics UI to monitor active operational health indicators, throughput metrics, and automated risk assessment flags (detecting logic deadlocks or rate boundaries).
* **🔌 Enterprise Tool Integration:** Hooks directly into GitLab to auto-generate issue tracking logs, tracks global task states, and persists state handling cleanly inside MongoDB.
* **⚡ Monorepo Architecture:** Clean directory separation keeping the execution logic independent and highly scalable.

---

## 🏗️ Architecture & Tech Stack

FlowForge AI is built using a modern, performant frontend workspace coupled with modular asynchronous service connectors:

* **Frontend Framework:** Next.js (App Router) & TypeScript
* **UI/UX Strategy:** Styled using Tailwind CSS with an ultra-clean, high-contrast dark theme configuration designed for instant scannability and layout clarity.
* **AI Intelligence Layer:** Engineered asynchronous service logic utilizing the **Gemini API** for strategic prompt generation and structural analysis alongside the **Claude API** for granular sub-task handling.
* **Deployment & CI/CD:** Monorepo deployment pipeline automated via a custom root-level `netlify.toml` file to route and compile serverless builds using the `@netlify/plugin-nextjs` runtime framework.

### 📂 Directory Structure

```text
Flow-Forage/
├── flowforge-frontend/       # Next.js App Router Frontend
│   ├── app/
│   │   ├── layout.tsx        # App Metadata & Tab Branding
│   │   └── page.tsx          # Main Analytics Dashboard Command UI
│   ├── services/
│   │   ├── gemini.ts         # Gemini API asynchronous service connectors
│   │   └── gitlab.ts         # GitLab automated issue logger
│   └── public/               # SVG assets and branding media
└── netlify.toml              # Explicit monorepo build configuration file

🚀 Getting Started
Prerequisites
Node.js: v18.x or later

Package Manager: npm or yarn

Local Installation
Clone the repository:

Bash
git clone [https://github.com/Pooja-CG/FlowForge-AI.git](https://github.com/Pooja-CG/FlowForge-AI.git)
cd FlowForge-AI
Navigate to the frontend workspace:

Bash
cd flowforge-frontend
Install dependencies:

Bash
npm install
Configure Environment Variables: Create a .env.local file inside the flowforge-frontend/ directory and add your API credentials:

Code snippet
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
NEXT_PUBLIC_CLAUDE_API_KEY=your_claude_key_here
Run the development server:

Bash
npm run dev
Open http://localhost:3000 in your browser to explore the command deck locally.

🛠️ Production Deployment
This project uses an optimized monorepo workflow managed via netlify.toml at the repository root. Any push to the main branch automatically triggers a fresh, cached Next.js serverless compilation using @netlify/plugin-nextjs.

Ini, TOML
[[plugins]]
  package = "@netlify/plugin-nextjs"

[build]
  base    = "flowforge-frontend"
  command = "npm run build"
  publish = ".next"