import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function getConfig() {
  const configPath = path.join(process.env.HOME || "/home/sudhirk", ".openclaw/openclaw.json");
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch {
    return null;
  }
}

export async function GET() {
  const config = getConfig();

  const brainModel = config?.agents?.defaults?.model?.primary || "unknown";
  const availableModels = config?.agents?.defaults?.models || {};
  const modelAliases = Object.entries(availableModels).map(([id, opts]) => ({
    id,
    alias: opts.alias || id,
  }));

  // Get session count
  const sessionsDir = path.join(
    process.env.HOME || "/home/sudhirk",
    ".openclaw/agents/main/sessions"
  );
  let sessionCount = 0;
  try {
    sessionCount = fs.readdirSync(sessionsDir).filter((f) => f.endsWith(".jsonl")).length;
  } catch {}

  return NextResponse.json({
    brain: {
      model: brainModel,
      provider: brainModel.split("/")[0] || "unknown",
      status: "active",
    },
    muscle: {
      model: "google-antigravity/gemini-3-flash",
      provider: "Google Antigravity",
      status: "pending-auth",
    },
    gateway: {
      status: "running",
      port: config?.gateway?.port || 18789,
    },
    models: modelAliases,
    sessionCount,
    timestamp: new Date().toISOString(),
  });
}
