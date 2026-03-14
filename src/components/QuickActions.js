"use client";

import { useState } from "react";

const actions = [
  { id: "backup", label: "Run Backup", icon: "💾", desc: "Snapshot workspace" },
  { id: "status", label: "System Status", icon: "📊", desc: "Gateway + model health" },
  { id: "restart", label: "Restart Gateway", icon: "🔄", desc: "Soft restart" },
  { id: "cron-run", label: "Trigger Cron", icon: "⏰", desc: "List cron jobs" },
];

export default function QuickActions() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const handleClick = async (id) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    setResults((prev) => ({ ...prev, [id]: "Running..." }));

    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: id }),
      });
      const data = await res.json();

      if (data.success) {
        setResults((prev) => ({
          ...prev,
          [id]: `✅ ${data.label} done`,
        }));
      } else {
        setResults((prev) => ({
          ...prev,
          [id]: `⚠️ Check logs`,
        }));
      }

      // Show raw output briefly
      if (data.output) {
        console.log(`[${data.label}]`, data.output);
      }
    } catch {
      setResults((prev) => ({ ...prev, [id]: "❌ Failed" }));
    }

    setLoading((prev) => ({ ...prev, [id]: false }));

    // Clear result after 5s
    setTimeout(() => {
      setResults((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 5000);
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => handleClick(a.id)}
            disabled={loading[a.id]}
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-600 bg-slate-700/30 hover:bg-slate-700/60 hover:border-accent-brain/40 transition-all group disabled:opacity-50"
          >
            <span className="text-2xl mb-1">{a.icon}</span>
            <span className="text-sm font-medium text-slate-200 group-hover:text-white">
              {results[a.id] || a.label}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">{a.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
