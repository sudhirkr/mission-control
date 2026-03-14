# Mission Control — Future Sprints TODO

## ✅ Completed
- [x] Persistent Service (pm2 on port 3001)

## 🔲 Remaining

### 1. Telegram Bot Commands
- `/status` — quick agent status from mobile
- `/switch-brain` — switch agent model
- `/approve-all` — bulk approve queued actions
- *Priority: mobile control access*

### 2. Approval → Agent Integration
- Auto-park external actions (emails, tweets, etc.) in approval queue
- Agent checks queue before executing external-facing commands
- *Priority: safety guardrail*

### 3. Session Cost Tracker
- Per-session cost breakdown (token usage, model, duration)
- Historical trends and comparison
- *Priority: cost visibility*

### 4. Tailscale Remote Access
- HTTPS access to dashboard from outside local network
- Run mission-control behind Tailscale funnel or proxy
- *Priority: remote access*

### 5. Pillar Progress Accuracy
- Replace keyword-mention proxy with real tracking
- Options: git activity, milestone files, hybrid approach
- *Priority: trustworthy data*

### 6. Agentic State → Control
- Pause/resume agent from dashboard UI
- Control buttons tied to OpenClaw session management
- *Priority: agent control*

### 7. Alerts/Notifications
- Dashboard notifications for important events
- Alert rules (e.g., new approval, error, high cost)
- *Priority: proactive monitoring*

### 8. Multiple Agent Support
- Show all subagents and their states
- Subagent list, status, and control per agent
- *Priority: visibility into parallel work*
