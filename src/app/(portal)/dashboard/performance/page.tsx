"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Star, Target, Award } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getMonthName, cn } from "@/lib/utils";

export default function PerformancePage() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/performance").then(r => r.json()).then(d => {
      if (d.records) setRecords(d.records);
    });
  }, []);

  const chartData = [...records].reverse().map(r => ({
    label: `${getMonthName(r.month)} ${r.year}`,
    rating: r.rating,
  }));

  const latest = records[0];
  const avg = records.length ? (records.reduce((s, r) => s + r.rating, 0) / records.length).toFixed(1) : "N/A";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="glass-card p-3 rounded-2xl border border-white/10 text-xs">
          <p className="font-bold text-foreground">{label}</p>
          <p className="text-indigo-400">Rating: <b>{payload[0].value}/10</b></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Performance</h1>
        <p className="text-muted-foreground mt-1">Track your monthly performance ratings, goals and manager feedback.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Current Rating</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-indigo-400">{latest?.rating ?? "—"}</p>
            <p className="text-muted-foreground text-sm mb-1">/10</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Avg Rating</p>
          <p className="text-4xl font-bold text-violet-400">{avg}</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Months Tracked</p>
          <p className="text-4xl font-bold text-emerald-400">{records.length}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card rounded-3xl p-8 border border-white/5">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-400" /> Performance Trend</h2>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No performance data recorded yet.</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,10]} tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={2.5} fill="url(#perfGrad)" dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6, fill:"#818cf8" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Monthly Records */}
      <div className="glass-card rounded-3xl p-8 border border-white/5 space-y-6">
        <h2 className="text-lg font-bold">Monthly Reports</h2>
        <div className="space-y-4">
          {records.map((r, i) => (
            <div key={i} className="p-6 rounded-2xl bg-muted/30 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-bold">{getMonthName(r.month)} {r.year}</p>
                <div className="flex items-center gap-2">
                  {[...Array(10)].map((_, si) => (
                    <Star key={si} className={cn("w-3 h-3", si < r.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/20")} />
                  ))}
                  <span className="text-sm font-bold text-yellow-400 ml-1">{r.rating}/10</span>
                </div>
              </div>
              {r.managerRemarks && (
                <div className="p-3 rounded-xl bg-muted/30 border border-white/5">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Manager Remarks</p>
                  <p className="text-sm">{r.managerRemarks}</p>
                </div>
              )}
              {r.goals && (
                <div className="p-3 rounded-xl bg-muted/30 border border-white/5">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Goals</p>
                  <p className="text-sm">{r.goals}</p>
                </div>
              )}
            </div>
          ))}
          {records.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No performance reviews yet. Your manager will add monthly reviews.</p>}
        </div>
      </div>
    </div>
  );
}
