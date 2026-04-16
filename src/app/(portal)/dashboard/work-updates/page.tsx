"use client";
import { useState, useEffect } from "react";
import { ClipboardList, Plus, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

export default function WorkUpdatesPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [form, setForm] = useState({ tasksCompleted: "", hoursSpent: 8, blockers: "", nextDayPlan: "" });
  const [loading, setLoading] = useState(false);
  const [todaySubmitted, setTodaySubmitted] = useState(false);

  const fetch_data = async () => {
    const res = await fetch("/api/work-updates");
    const data = await res.json();
    if (data.updates) {
      setUpdates(data.updates);
      const today = new Date(); today.setHours(0,0,0,0);
      const todayRec = data.updates.find((u: any) => new Date(u.date).toDateString() === today.toDateString());
      if (todayRec) { setTodaySubmitted(true); setForm({ tasksCompleted: todayRec.tasksCompleted, hoursSpent: todayRec.hoursSpent, blockers: todayRec.blockers || "", nextDayPlan: todayRec.nextDayPlan || "" }); }
    }
  };

  useEffect(() => { fetch_data(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/work-updates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Work update saved! Great work today! 💪");
      setTodaySubmitted(true);
      fetch_data();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Daily Work Updates</h1>
        <p className="text-muted-foreground mt-1">Submit your end-of-day work summary. Helps your team and manager track progress.</p>
      </div>

      {/* Today form */}
      <div className="glass-card rounded-3xl p-8 border border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold">Today&apos;s Update</h2>
          {todaySubmitted && <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">Saved</span>}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tasks Completed *</label>
            <textarea required value={form.tasksCompleted} onChange={e => setForm({...form, tasksCompleted: e.target.value})} rows={4}
              placeholder="• Completed API integration for login module&#10;• Fixed regression bug in dashboard&#10;• Code review for PR #42"
              className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hours Spent *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input type="number" min={1} max={24} value={form.hoursSpent} onChange={e => setForm({...form, hoursSpent: +e.target.value})}
                  className="w-full bg-muted/30 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400" /> Blockers / Issues
            </label>
            <textarea value={form.blockers} onChange={e => setForm({...form, blockers: e.target.value})} rows={2}
              placeholder="Any blockers, issues or dependencies holding you back..."
              className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Next Day Plan</label>
            <textarea value={form.nextDayPlan} onChange={e => setForm({...form, nextDayPlan: e.target.value})} rows={2}
              placeholder="What do you plan to work on tomorrow?"
              className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-600/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-60">
            {loading ? "Saving..." : todaySubmitted ? "Update Today\'s Log" : "Submit Daily Update"}
          </button>
        </form>
      </div>

      {/* Timeline */}
      <div className="glass-card rounded-3xl p-8 border border-white/5 space-y-6">
        <h2 className="text-lg font-bold">Update History</h2>
        <div className="space-y-4">
          {updates.map((u, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1 shrink-0" />
                {i < updates.length-1 && <div className="w-0.5 flex-1 bg-white/5 mt-1" />}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-bold">{formatDate(u.date)}</p>
                  <span className="text-xs text-muted-foreground">· {u.hoursSpent}h</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{u.tasksCompleted}</p>
                {u.blockers && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-orange-400">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" /><span>{u.blockers}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {updates.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No updates yet. Submit your first daily update above!</p>}
        </div>
      </div>
    </div>
  );
}
