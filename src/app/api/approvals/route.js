import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const QUEUE_FILE = path.join(
  process.env.HOME || "/home/sudhirk",
  ".openclaw/workspace/mission-control/approval-queue.json"
);

function loadQueue() {
  try {
    return JSON.parse(fs.readFileSync(QUEUE_FILE, "utf-8"));
  } catch {
    return { pending: [], history: [] };
  }
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

// GET — list pending approvals
export async function GET() {
  const queue = loadQueue();
  return NextResponse.json({
    pending: queue.pending,
    historyCount: queue.history?.length || 0,
    timestamp: new Date().toISOString(),
  });
}

// POST — approve, reject, or add
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, id, details, priority } = body;
  const queue = loadQueue();

  if (action === "add") {
    // Agent parks an action for human approval
    const item = {
      id: id || `approval-${Date.now()}`,
      details: details || "No details provided",
      priority: priority || "normal",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    queue.pending = queue.pending || [];
    queue.pending.push(item);
    saveQueue(queue);
    return NextResponse.json({ ok: true, item });
  }

  if (action === "approve") {
    const idx = (queue.pending || []).findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const [item] = queue.pending.splice(idx, 1);
    item.status = "approved";
    item.approvedAt = new Date().toISOString();
    queue.history = queue.history || [];
    queue.history.push(item);
    saveQueue(queue);
    return NextResponse.json({ ok: true, item });
  }

  if (action === "reject") {
    const idx = (queue.pending || []).findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const [item] = queue.pending.splice(idx, 1);
    item.status = "rejected";
    item.rejectedAt = new Date().toISOString();
    queue.history = queue.history || [];
    queue.history.push(item);
    saveQueue(queue);
    return NextResponse.json({ ok: true, item });
  }

  return NextResponse.json(
    { error: `Unknown action: ${action}. Use: add, approve, reject` },
    { status: 400 }
  );
}
