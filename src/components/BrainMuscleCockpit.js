"use client";

import { useState, useEffect } from "react";

export default function BrainMuscleCockpit() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const interval = setInterval(() => {
      fetch("/api/status")
        .then((r) => r.json())
        .then(setData)
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatusBadge = ({ status }) => {
    const colors = {
      active: "bg-accent-success/20 text-accent-success border-accent-success/30",
      "pending-auth": "bg-accent-warning/20 text-accent-warning border-accent-warning/30",
      inactive: "bg-slate-700/50 text-slate-500 border-slate-600/30",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[status] || colors.inactive}`}>
        {status === "active" ? "● Active" : status === "pending-auth" ? "◐ Pending Auth" : "○ Inactive"}
      </span>
    );
  };

  const ModelCard = ({ model, provider, status, isBrain }) => (
    <div className={`rounded-lg border p-4 ${isBrain ? "border-accent-brain/30 bg-accent-brain/5" : "border-accent-muscle/30 bg-accent-muscle/5"}`}>
      <div className="text-sm text-slate-400 mb-1">
        {isBrain ? "🧠 Brain — Reasoning & Orchestration" : "💪 Muscle — Task Execution"}
      </div>
      <div className="text-lg font-mono font-semibold text-white">
        {loading ? "..." : model}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-500">{loading ? "..." : provider}</span>
        <StatusBadge status={status} />
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
        Brain & Muscle Cockpit
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModelCard
          model={data?.brain?.model || "openrouter/healer-alpha"}
          provider={data?.brain?.provider || "OpenRouter"}
          status={data?.brain?.status || "active"}
          isBrain
        />
        <ModelCard
          model={data?.muscle?.model || "google-antigravity/gemini-3-flash"}
          provider={data?.muscle?.provider || "Google Antigravity"}
          status={data?.muscle?.status || "pending-auth"}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Gateway: {data?.gateway?.status || "..."}</span>
        <span>Sessions: {data?.sessionCount ?? "..."}</span>
        <span>Refreshed: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString("en-IN") : "..."}</span>
      </div>
    </div>
  );
}
