import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const SESSIONS_DIR = path.join(
  process.env.HOME || "/home/sudhirk",
  ".openclaw/agents/main/sessions"
);

function getLatestSession() {
  try {
    const files = fs.readdirSync(SESSIONS_DIR)
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => ({
        name: f,
        mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) return null;

    const lines = fs.readFileSync(
      path.join(SESSIONS_DIR, files[0].name),
      "utf-8"
    ).split("\n").filter(Boolean);

    // Get last few messages to determine current state
    const recent = lines.slice(-20).map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);

    return { file: files[0].name, recent, totalLines: lines.length };
  } catch {
    return null;
  }
}

function deriveState(recent) {
  if (!recent || recent.length === 0) {
    return { state: "idle", detail: "No recent activity", icon: "⏸️" };
  }

  // Look at the last assistant message for tool calls
  const lastAssistant = [...recent].reverse().find(
    (m) => m.type === "message" && m.message?.role === "assistant"
  );

  if (!lastAssistant) {
    const lastUser = [...recent].reverse().find(
      (m) => m.type === "message" && m.message?.role === "user"
    );
    if (lastUser) {
      return { state: "waiting", detail: "Waiting for agent response", icon: "⏳" };
    }
    return { state: "idle", detail: "No recent messages", icon: "⏸️" };
  }

  const contents = lastAssistant.message?.content || [];
  const toolCalls = contents.filter((c) => c.type === "toolCall");
  const textContent = contents.filter((c) => c.type === "text").map((c) => c.text || "").join(" ");

  if (toolCalls.length > 0) {
    const toolName = toolCalls[0].name || "unknown";
    const toolMap = {
      exec: { state: "executing", detail: `Running: ${toolName}`, icon: "⚙️" },
      read: { state: "reading", detail: `Reading file`, icon: "📖" },
      write: { state: "writing", detail: `Writing file`, icon: "✏️" },
      browser: { state: "browsing", detail: `Browser action`, icon: "🌐" },
      web_search: { state: "searching", detail: `Web search`, icon: "🔍" },
      sessions_spawn: { state: "spawning", detail: `Spawning subagent`, icon: "🤖" },
      memory_search: { state: "remembering", detail: `Searching memory`, icon: "🧠" },
      message: { state: "messaging", detail: `Sending message`, icon: "📤" },
      cron: { state: "scheduling", detail: `Managing cron jobs`, icon: "⏰" },
    };
    return toolMap[toolName] || { state: "executing", detail: `Tool: ${toolName}`, icon: "🔧" };
  }

  if (textContent.length > 0) {
    if (textContent.length > 200) {
      return { state: "thinking", detail: "Generating response...", icon: "💭" };
    }
    return { state: "responding", detail: "Composing reply", icon: "💬" };
  }

  return { state: "processing", detail: "Processing...", icon: "⚡" };
}

export async function GET() {
  const session = getLatestSession();
  const state = deriveState(session?.recent);

  // Count total sessions and messages
  let sessionCount = 0;
  let totalMessages = 0;
  try {
    const files = fs.readdirSync(SESSIONS_DIR).filter((f) => f.endsWith(".jsonl"));
    sessionCount = files.length;
    for (const file of files.slice(0, 20)) {
      const lines = fs.readFileSync(path.join(SESSIONS_DIR, file), "utf-8").split("\n");
      totalMessages += lines.filter((l) => {
        try { return JSON.parse(l)?.type === "message"; } catch { return false; }
      }).length;
    }
  } catch {}

  return NextResponse.json({
    ...state,
    session: {
      file: session?.file || null,
      messageCount: session?.totalLines || 0,
    },
    stats: {
      sessionCount,
      totalMessages,
    },
    timestamp: new Date().toISOString(),
  });
}
