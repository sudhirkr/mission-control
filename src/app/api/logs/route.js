import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const SESSIONS_DIR = path.join(
  process.env.HOME || "/home/sudhirk",
  ".openclaw/agents/main/sessions"
);

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getLast24hHours() {
  return Array.from({ length: 24 }, (_, i) => {
    const h = (new Date().getHours() - 23 + i + 24) % 24;
    return `${h.toString().padStart(2, "0")}:00`;
  });
}

export async function GET() {
  let files = [];
  try {
    files = fs.readdirSync(SESSIONS_DIR).filter((f) => f.endsWith(".jsonl"));
  } catch {
    return NextResponse.json({ error: "Sessions directory not found" }, { status: 404 });
  }

  // Aggregate data from recent sessions
  const messagesByHour = new Array(24).fill(0);
  const toolCallsByHour = new Array(24).fill(0);
  const toolCounts = {};
  const providerTokens = {};
  let totalMessages = 0;
  let totalToolCalls = 0;
  let totalCost = 0;
  const recentSessions = [];

  // Sort by recency, process max 20 files
  const recentFiles = files
    .map((f) => ({ name: f, mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, 20);

  for (const { name: file } of recentFiles) {
    const filePath = path.join(SESSIONS_DIR, file);
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch {
      continue;
    }

    // Only process files modified in the last 3 days
    const ageDays = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
    if (ageDays > 3) continue;

    let lines = [];
    try {
      lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
    } catch {
      continue;
    }

    let sessionMessages = 0;
    let sessionCost = 0;
    const sessionProviderCost = {}; // Track cost per provider within session

    for (const line of lines) {
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }

      if (entry.type === "session") {
        // Extract session metadata
        continue;
      }

      if (entry.type === "message" && entry.message) {
        const ts = entry.timestamp ? new Date(entry.timestamp) : null;
        const hour = ts ? ts.getHours() : new Date().getHours();
        const hourIdx = (hour - new Date().getHours() + 24) % 24;

        if (entry.message.role === "user") {
          messagesByHour[hourIdx]++;
          totalMessages++;
          sessionMessages++;
        }

        if (entry.message.role === "assistant") {
          // Track provider/model - fields are inside message object
          const model = entry.message.model || entry.model || "";
          const rawProvider = entry.message.provider || entry.provider || entry.message.api || entry.api || "";
          let currentProvider;
          if (rawProvider && rawProvider !== "unknown" && rawProvider !== "null") {
            currentProvider = rawProvider;
          } else if (model) {
            const parts = model.split("/");
            const providerMap = {
              "openrouter": "OpenRouter",
              "openai": "OpenAI",
              "google-antigravity": "Google Antigravity",
              "anthropic": "Anthropic",
              "google": "Google",
            };
            currentProvider = providerMap[parts[0]] || parts[0] || "unknown";
          } else {
            currentProvider = "unknown";
          }

          // Count tool calls
          const contents = entry.message.content || [];
          for (const c of contents) {
            if (c.type === "toolCall") {
              const name = c.name || "unknown";
              toolCounts[name] = (toolCounts[name] || 0) + 1;
              toolCallsByHour[hourIdx]++;
              totalToolCalls++;
            }
          }

          // Track cost per provider (per message, not per session)
          const cost = entry.message?.usage?.cost?.total || 0;
          if (cost > 0) {
            sessionProviderCost[currentProvider] =
              (sessionProviderCost[currentProvider] || 0) + cost;
            sessionCost += cost;
            totalCost += cost;
          }
        }
      }
    }

    // Aggregate provider costs from this session
    for (const [provider, cost] of Object.entries(sessionProviderCost)) {
      providerTokens[provider] = (providerTokens[provider] || 0) + cost;
    }

    // Find primary provider for this session (highest cost)
    const primaryProvider = Object.entries(sessionProviderCost)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "unknown";

    recentSessions.push({
      id: file.replace(".jsonl", ""),
      messages: sessionMessages,
      cost: parseFloat(sessionCost.toFixed(4)),
      provider: primaryProvider,
      modified: stat.mtime.toISOString(),
    });
  }

  // Sort sessions by recency
  recentSessions.sort((a, b) => new Date(b.modified) - new Date(a.modified));

  return NextResponse.json({
    activity: {
      hours: getLast24hHours(),
      messages: messagesByHour,
      toolCalls: toolCallsByHour,
    },
    toolUsage: Object.entries(toolCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count })),
    cost: {
      total: parseFloat(totalCost.toFixed(2)),
      byProvider: Object.entries(providerTokens)
        .map(([provider, cost]) => ({
          provider: ({
            "openrouter": "OpenRouter",
            "openai": "OpenAI",
            "google-antigravity": "Google Antigravity",
            "anthropic": "Anthropic",
            "google": "Google",
          })[provider] || provider,
          cost: parseFloat(cost.toFixed(2)),
        }))
        .sort((a, b) => b.cost - a.cost),
    },
    summary: {
      totalMessages,
      totalToolCalls,
      sessionsAnalyzed: recentSessions.length,
      recentSessions: recentSessions.slice(0, 10),
    },
    timestamp: new Date().toISOString(),
  });
}
