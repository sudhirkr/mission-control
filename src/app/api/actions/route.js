import { NextResponse } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

function safeExec(cmd, timeout = 15000) {
  try {
    return {
      success: true,
      output: execSync(cmd, { timeout, encoding: "utf-8" }).trim(),
    };
  } catch (err) {
    return {
      success: false,
      output: err.message?.slice(0, 500) || "Command failed",
    };
  }
}

const ACTIONS = {
  backup: {
    label: "Run Backup",
    cmd: "bash /home/sudhirk/.openclaw/workspace/backup.sh",
  },
  status: {
    label: "System Status",
    cmd: "openclaw status 2>&1 | head -20",
  },
  restart: {
    label: "Restart Gateway",
    cmd: "openclaw gateway restart 2>&1",
  },
  "cron-run": {
    label: "Trigger Cron",
    cmd: "openclaw cron list 2>&1 | head -20",
  },
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;
  if (!action || !ACTIONS[action]) {
    return NextResponse.json(
      { error: `Unknown action: ${action}. Valid: ${Object.keys(ACTIONS).join(", ")}` },
      { status: 400 }
    );
  }

  const { label, cmd } = ACTIONS[action];
  const result = safeExec(cmd);

  return NextResponse.json({
    action,
    label,
    ...result,
    timestamp: new Date().toISOString(),
  });
}
