"use client";

import { useState, useEffect } from "react";

export default function AgentState() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchState = () => {
    fetch("/api/agent-state")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setHistory((prev) => {
          const updated = [...prev, { state: d.state, time: new Date() }];
          return updated.slice(-20); // Keep last 20 states
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const stateColors = {
    idle: "bg-slate-700/50 text-slate-400 border-slate-600/30",
    waiting: "bg-accent-warning/20 text-accent-warning border-accent-warning/30",
    thinking: "bg-accent-brain/20 text-accent-brain border-accent-brain/30",
    responding: "bg-accent-brain/20 text-accent-brain border-accent-brain/30",
    executing: "bg-accent-muscle/20 text-accent-muscle border-accent-muscle/30",
    reading: "bg-green-500/20 text-green-400 border-green-500/30",
    writing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    browsing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    searching: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    spawning: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    remembering: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    messaging: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    scheduling: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    processing: "bg-accent-muscle/20 text-accent-muscle border-accent-muscle/30",
  };

  const isActive = data?.state && !["idle", "waiting"].includes(data.state);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
        Live Agent State
      </h2>

      {/* Current State */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`rounded-lg border px-4 py-3 ${stateColors[data?.state] || stateColors.idle}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{data?.icon || "⏸️"}</span>
            <div>
              <div className="text-sm font-medium capitalize">{data?.state || "Unknown"}</div>
              <div className="text-xs opacity-80">{data?.detail || "..."}</div>
            </div>
          </div>
        </div>
        {isActive && (
          <div className="w-3 h-3 rounded-full bg-accent-success animate-pulse" />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded bg-midnight/50 p-2 text-center">
          <div className="text-lg font-bold text-white">{data?.stats?.sessionCount ?? "..."}</div>
          <div className="text-xs text-slate-500">Sessions</div>
        </div>
        <div className="rounded bg-midnight/50 p-2 text-center">
          <div className="text-lg font-bold text-white">{data?.stats?.totalMessages ?? "..."}</div>
          <div className="text-xs text-slate-500">Messages</div>
        </div>
        <div className="rounded bg-midnight/50 p-2 text-center">
          <div className="text-lg font-bold text-white">{data?.session?.messageCount ?? "..."}</div>
          <div className="text-xs text-slate-500">Current</div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded bg-midnight/50 p-3">
        <h3 className="text-xs text-slate-400 mb-2">Recent Activity</h3>
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {[...history].reverse().map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-slate-600">
                {new Date(h.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span className={`px-1.5 py-0.5 rounded ${stateColors[h.state] || stateColors.idle}`}>
                {h.state}
              </span>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-xs text-slate-600">Waiting for activity...</div>
          )}
        </div>
      </div>
    </div>
  );
}
