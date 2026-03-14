import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MEMORY_PATH = path.join(
  process.env.HOME || "/home/sudhirk",
  ".openclaw/workspace/MEMORY.md"
);

function parseObjectives(content) {
  const objectives = [];
  const lines = content.split("\n");
  let currentObj = null;

  for (const line of lines) {
    // Match "### 1. Title" or "### 1 Title"
    const objMatch = line.match(/^###\s+(\d+)\.\s+(.+)/);
    if (objMatch) {
      if (currentObj) objectives.push(currentObj);
      currentObj = {
        id: parseInt(objMatch[1]),
        title: objMatch[2].trim(),
        description: "",
        bullets: [],
        status: "planning",
        progress: 0,
      };
      continue;
    }

    if (!currentObj) continue;

    // Match bullet points
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      const text = bulletMatch[1].trim();
      currentObj.bullets.push(text);

      // Track status based on keywords
      if (text.toLowerCase().includes("active") || text.toLowerCase().includes("building")) {
        currentObj.status = "active";
      }
      if (text.toLowerCase().includes("completed") || text.toLowerCase().includes("done")) {
        currentObj.status = "completed";
      }
      continue;
    }

    // Match context/context notes
    const contextMatch = line.match(/\*Context:\s*(.+)\*/);
    if (contextMatch) {
      currentObj.description = contextMatch[1].trim();
    }
  }

  if (currentObj) objectives.push(currentObj);

  return objectives;
}

function getProgressFromActivity(objectiveTitle) {
  // Map objectives to recent session activity (rough proxy)
  const sessionsDir = path.join(
    process.env.HOME || "/home/sudhirk",
    ".openclaw/agents/main/sessions"
  );

  let mentions = 0;
  try {
    const files = fs.readdirSync(sessionsDir).filter((f) => f.endsWith(".jsonl"));
    for (const file of files.slice(0, 10)) {
      const stat = fs.statSync(path.join(sessionsDir, file));
      const ageDays = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
      if (ageDays > 7) continue;

      const content = fs.readFileSync(path.join(sessionsDir, file), "utf-8");
      // Search for keywords from the objective title
      const keywords = objectiveTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      for (const kw of keywords) {
        const matches = content.toLowerCase().split(kw).length - 1;
        mentions += matches;
      }
    }
  } catch {}

  // Map mentions to rough progress
  if (mentions > 100) return 45;
  if (mentions > 50) return 35;
  if (mentions > 20) return 25;
  if (mentions > 10) return 15;
  if (mentions > 0) return 10;
  return 5;
}

export async function GET() {
  let content = "";
  try {
    content = fs.readFileSync(MEMORY_PATH, "utf-8");
  } catch {
    return NextResponse.json({ error: "MEMORY.md not found" }, { status: 404 });
  }

  const objectives = parseObjectives(content);

  // Enhance with activity-based progress
  const enhanced = objectives.map((obj) => ({
    ...obj,
    progress: getProgressFromActivity(obj.title),
    bullets: undefined, // Don't send all bullets to client
  }));

  return NextResponse.json({
    objectives: enhanced,
    lastUpdated: fs.statSync(MEMORY_PATH).mtime.toISOString(),
    timestamp: new Date().toISOString(),
  });
}
