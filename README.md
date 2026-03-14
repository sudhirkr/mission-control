# 🦞 Mission Control

**Autonomous Company Command Center** — A real-time web dashboard for monitoring and controlling an AI-driven autonomous company powered by [OpenClaw](https://docs.openclaw.ai).

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4-f38181)

## Features

### 📊 Log Viewer & Analytics
- **Activity Chart** — Real-time 24h timeline of messages and tool calls
- **Cost by Provider** — Doughnut chart showing spend per model provider
- **Tool Usage** — Horizontal bar chart of most-used tools

### 🧠 Brain & Muscle Cockpit
- Shows the current **Brain** (orchestrator model) and **Muscle** (executor model)
- Live model, provider, and auth status
- Gateway health and session count

### ⚡ Live Agent State
- Polls session logs every 5 seconds
- Shows current agent activity: executing, reading, writing, thinking, etc.
- Activity timeline with last 20 states
- Session and message statistics

### ⚡ Approval Queue
- Human-in-the-loop approval workflow
- Priority badges (high / normal / low)
- Approve or reject with one click
- Agent can park actions via `scripts/request-approval.sh`

### 🏛️ Pillar Tracker
- Reads objectives from `MEMORY.md`
- Progress bars based on real session activity
- Status indicators (active, planning, completed)

### ⚡ Quick Actions
- **Run Backup** — Triggers workspace backup
- **System Status** — Gateway health check
- **Restart Gateway** — Soft restart
- **Trigger Cron** — List scheduled jobs

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
PORT=3001 npm run dev

# Open in browser
open http://localhost:3001
```

## Architecture

```
mission-control/
├── src/
│   ├── app/
│   │   ├── page.js              # Main dashboard layout
│   │   ├── layout.js            # Root layout
│   │   ├── globals.css          # Tailwind styles
│   │   └── api/
│   │       ├── status/route.js  # Model config + gateway status
│   │       ├── logs/route.js    # Session log analytics
│   │       ├── agent-state/route.js  # Live agent activity
│   │       ├── pillars/route.js # MEMORY.md objective parser
│   │       ├── approvals/route.js    # Approval queue CRUD
│   │       └── actions/route.js      # Quick action executor
│   └── components/
│       ├── BrainMuscleCockpit.js
│       ├── LogChart.js
│       ├── AgentState.js
│       ├── ApprovalQueue.js
│       ├── PillarTracker.js
│       └── QuickActions.js
├── scripts/
│   └── request-approval.sh  # Agent integration script
├── browser-test.mjs         # Puppeteer test suite (30 tests)
└── test.sh                  # Shell test suite (37 tests)
```

## Testing

```bash
# Run shell tests (HTTP, content, file checks)
bash test.sh

# Run browser tests (Puppeteer, JavaScript rendering)
node browser-test.mjs
```

## Agent Integration

The agent can park actions for human approval:

```bash
bash scripts/request-approval.sh "Send weekly newsletter" "high"
```

This adds an item to the Approval Queue dashboard for one-click approve/reject.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/status` | GET | Gateway status, models, session count |
| `/api/logs` | GET | Activity, tool usage, cost analytics |
| `/api/agent-state` | GET | Live agent activity state |
| `/api/pillars` | GET | Objectives parsed from MEMORY.md |
| `/api/approvals` | GET | List pending approvals |
| `/api/approvals` | POST | Add / approve / reject |
| `/api/actions` | POST | Execute quick actions |

## Data Sources

- **Session logs** — `~/.openclaw/agents/main/sessions/*.jsonl`
- **Config** — `~/.openclaw/openclaw.json`
- **Objectives** — `~/.openclaw/workspace/MEMORY.md`

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (dark theme)
- **Charts:** Chart.js + react-chartjs-2
- **Testing:** Puppeteer + shell scripts
- **Backend:** Next.js API routes (Node.js)

## License

MIT
