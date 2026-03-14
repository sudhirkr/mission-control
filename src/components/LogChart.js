"use client";

import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  DoughnutController,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  DoughnutController
);

export default function LogChart() {
  const activityRef = useRef(null);
  const toolsRef = useRef(null);
  const costRef = useRef(null);
  const chartsRef = useRef([]);
  const [logData, setLogData] = useState(null);

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then(setLogData)
      .catch(() => {});

    const interval = setInterval(() => {
      fetch("/api/logs").then((r) => r.json()).then(setLogData).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!logData) return;

    ChartJS.defaults.color = "#94a3b8";
    ChartJS.defaults.borderColor = "#334155";

    // Destroy existing charts
    chartsRef.current.forEach((chart) => {
      if (chart && typeof chart.destroy === "function") chart.destroy();
    });
    chartsRef.current = [];

    // 1. Activity Line Chart
    if (activityRef.current) {
      const hours = logData?.activity?.hours || Array.from({ length: 24 }, (_, i) => `${i}:00`);
      const messages = logData?.activity?.messages || new Array(24).fill(0);
      const toolCalls = logData?.activity?.toolCalls || new Array(24).fill(0);

      chartsRef.current.push(
        new ChartJS(activityRef.current, {
          type: "line",
          data: {
            labels: hours,
            datasets: [
              {
                label: "Messages",
                data: messages,
                borderColor: "#8b5cf6",
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 0,
              },
              {
                label: "Tool Calls",
                data: toolCalls,
                borderColor: "#06b6d4",
                backgroundColor: "rgba(6, 182, 212, 0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { position: "top" }, title: { display: false } },
            scales: {
              x: { grid: { display: false } },
              y: { beginAtZero: true, grid: { color: "#1e293b" } },
            },
          },
        })
      );
    }

    // 2. Tool Usage Bar Chart
    if (toolsRef.current) {
      const toolData = logData?.toolUsage || [];
      const colors = [
        "rgba(139, 92, 246, 0.7)",
        "rgba(6, 182, 212, 0.7)",
        "rgba(34, 197, 94, 0.7)",
        "rgba(245, 158, 11, 0.7)",
        "rgba(239, 68, 68, 0.7)",
        "rgba(168, 85, 247, 0.7)",
        "rgba(14, 165, 233, 0.7)",
        "rgba(244, 114, 182, 0.7)",
        "rgba(163, 230, 53, 0.7)",
        "rgba(251, 146, 60, 0.7)",
      ];

      chartsRef.current.push(
        new ChartJS(toolsRef.current, {
          type: "bar",
          data: {
            labels: toolData.map((t) => t.name),
            datasets: [
              {
                label: "Calls",
                data: toolData.map((t) => t.count),
                backgroundColor: colors.slice(0, toolData.length),
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            indexAxis: "y",
            plugins: { legend: { display: false } },
            scales: {
              x: { beginAtZero: true, grid: { color: "#1e293b" } },
              y: { grid: { display: false } },
            },
          },
        })
      );
    }

    // 3. Cost Doughnut Chart
    if (costRef.current) {
      const costData = logData?.cost?.byProvider || [];
      const total = logData?.cost?.total || 0;

      chartsRef.current.push(
        new ChartJS(costRef.current, {
          type: "doughnut",
          data: {
            labels: costData.map((c) => c.provider),
            datasets: [
              {
                data: costData.map((c) => c.cost),
                backgroundColor: [
                  "rgba(139, 92, 246, 0.8)",
                  "rgba(6, 182, 212, 0.8)",
                  "rgba(34, 197, 94, 0.8)",
                  "rgba(245, 158, 11, 0.8)",
                ],
                borderColor: "#1e293b",
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { position: "bottom" } },
            cutout: "65%",
          },
        })
      );
    }

    return () => {
      chartsRef.current.forEach((chart) => {
        if (chart && typeof chart.destroy === "function") chart.destroy();
      });
      chartsRef.current = [];
    };
  }, [logData]);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Log Viewer & Analytics
        </h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            {logData?.summary?.sessionsAnalyzed ?? 0} sessions •{" "}
            {logData?.summary?.totalMessages ?? 0} messages •{" "}
            {logData?.summary?.totalToolCalls ?? 0} tool calls
          </span>
          <span>Live</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded bg-midnight/50 p-3">
          <h3 className="text-xs text-slate-400 mb-2">Activity (Last 24h)</h3>
          <div className="h-48">
            <canvas ref={activityRef} />
          </div>
        </div>
        <div className="rounded bg-midnight/50 p-3">
          <h3 className="text-xs text-slate-400 mb-2">Cost by Provider (This Month)</h3>
          <div className="h-48">
            <canvas ref={costRef} />
          </div>
          <div className="text-center text-xs text-slate-500 mt-1">
            Total: ${(logData?.cost?.total ?? 0).toFixed(2)}
          </div>
        </div>
      </div>
      <div className="mt-4 rounded bg-midnight/50 p-3">
        <h3 className="text-xs text-slate-400 mb-2">Tool Usage (Recent)</h3>
        <div className="h-48">
          <canvas ref={toolsRef} />
        </div>
      </div>
    </div>
  );
}
