"use client";

import { useState, useEffect } from "react";
import BrainMuscleCockpit from "@/components/BrainMuscleCockpit";
import LogChart from "@/components/LogChart";
import PillarTracker from "@/components/PillarTracker";
import QuickActions from "@/components/QuickActions";
import ApprovalQueue from "@/components/ApprovalQueue";
import AgentState from "@/components/AgentState";

export default function Home() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div className="min-h-screen bg-midnight p-4 md:p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            🦞 Mission Control
          </h1>
          <p className="text-sm text-slate-500">Autonomous Company Command Center</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">{timeStr}</span>
          <span className="flex items-center gap-1 text-xs text-accent-success">
            <span className="w-2 h-2 rounded-full bg-accent-success animate-pulse" />
            Gateway Connected
          </span>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - spans 2 */}
        <div className="lg:col-span-2 space-y-4">
          <LogChart />
          <AgentState />
          <ApprovalQueue />
          <QuickActions />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <BrainMuscleCockpit />
          <PillarTracker />
        </div>
      </div>
    </div>
  );
}
