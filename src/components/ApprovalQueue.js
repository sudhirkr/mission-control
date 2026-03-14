"use client";

import { useState, useEffect } from "react";

export default function ApprovalQueue() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState({});
  const [historyCount, setHistoryCount] = useState(0);

  const fetchQueue = () => {
    fetch("/api/approvals")
      .then((r) => r.json())
      .then((d) => {
        setPending(d.pending || []);
        setHistoryCount(d.historyCount || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, action) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      if (res.ok) {
        setPending((prev) => prev.filter((p) => p.id !== id));
        if (action === "approve") setHistoryCount((c) => c + 1);
      }
    } catch {}
    setLoading((prev) => ({ ...prev, [id]: false }));
  };

  const PriorityBadge = ({ priority }) => {
    const colors = {
      high: "bg-accent-danger/20 text-accent-danger",
      normal: "bg-accent-brain/20 text-accent-brain",
      low: "bg-slate-700/50 text-slate-500",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${colors[priority] || colors.normal}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          ⚡ Approval Queue
        </h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{pending.length} pending</span>
          <span>{historyCount} resolved</span>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          <span className="text-2xl block mb-2">✅</span>
          No pending approvals — all clear
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((item) => (
            <div
              key={item.id}
              className="rounded bg-midnight/50 p-3 border border-slate-700/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <PriorityBadge priority={item.priority} />
                    <span className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleTimeString("en-IN")}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200">{item.details}</p>
                  <p className="text-xs text-slate-500 mt-1">ID: {item.id}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(item.id, "approve")}
                    disabled={loading[item.id]}
                    className="px-3 py-1 rounded text-xs bg-accent-success/20 text-accent-success border border-accent-success/30 hover:bg-accent-success/30 disabled:opacity-50 transition-colors"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleAction(item.id, "reject")}
                    disabled={loading[item.id]}
                    className="px-3 py-1 rounded text-xs bg-accent-danger/20 text-accent-danger border border-accent-danger/30 hover:bg-accent-danger/30 disabled:opacity-50 transition-colors"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
