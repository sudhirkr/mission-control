"use client";

import { useState, useEffect } from "react";

const COLORS = ["#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444"];

export default function PillarTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pillars")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const interval = setInterval(() => {
      fetch("/api/pillars")
        .then((r) => r.json())
        .then(setData)
        .catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const objectives = data?.objectives || [];

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Objective Tracker (Pillars)
        </h2>
        {data?.lastUpdated && (
          <span className="text-xs text-slate-500">
            Updated: {new Date(data.lastUpdated).toLocaleDateString("en-IN")}
          </span>
        )}
      </div>

      {loading && objectives.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">Loading objectives...</div>
      ) : (
        <div className="space-y-3">
          {objectives.map((obj, idx) => {
            const color = COLORS[idx % COLORS.length];
            const statusIcon =
              obj.status === "active"
                ? "🟢"
                : obj.status === "completed"
                ? "✅"
                : "🔵";

            return (
              <div key={obj.id} className="rounded bg-midnight/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium text-white">
                      {obj.id}. {obj.title}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {statusIcon} {obj.status}
                  </span>
                </div>
                {obj.description && (
                  <p className="text-xs text-slate-500 mb-2 ml-4">{obj.description}</p>
                )}
                <div className="ml-4">
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${obj.progress}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {obj.progress}% activity
                  </span>
                </div>
              </div>
            );
          })}

          {objectives.length === 0 && (
            <div className="text-center py-4 text-slate-500 text-sm">
              No objectives found in MEMORY.md
            </div>
          )}
        </div>
      )}
    </div>
  );
}
