"use client";
import { useState, useEffect } from "react";
import { Calendar, Plus, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

const LEAVE_TYPES = ["CL", "Emergency"];
const STATUS_STYLE: Record<string,string> = { Pending: "bg-yellow-500/10 text-yellow-400", Approved: "bg-emerald-500/10 text-emerald-400", Rejected: "bg-red-500/10 text-red-400" };

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [clBalance, setClBalance] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: "CL", startDate: "", endDate: "", reason: "" });

  const fetch_data = async () => {
    const res = await fetch("/api/leaves");
    const data = await res.json();
    if (data.leaves) setLeaves(data.leaves);
    if (data.clBalance !== undefined) setClBalance(data.clBalance);
  };

  useEffect(() => { fetch_data(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/leaves", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      if (data.leave.isLOP) toast.warning("CL exhausted. This leave will be treated as LOP.");
      else toast.success("Leave application submitted!");
      setShowForm(false);
      setForm({ type: "CL", startDate: "", endDate: "", reason: "" });
      fetch_data();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Leave Management</h1>
          <p className="text-muted-foreground mt-1">1 Casual Leave per year. Additional leaves are Loss of Pay (LOP).</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:opacity-90 transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Apply Leave
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <p className="text-xs text-muted-foreground mb-2 uppercase font-bold tracking-wider">CL Balance</p>
          <p className="text-4xl font-bold text-indigo-400">{clBalance}</p>
          <p className="text-xs text-muted-foreground mt-1">of 1 available</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <p className="text-xs text-muted-foreground mb-2 uppercase font-bold tracking-wider">LOP Taken</p>
          <p className="text-4xl font-bold text-orange-400">{leaves.filter(l => l.isLOP && l.status === "Approved").reduce((a,l) => a + l.days, 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">days this year</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <p className="text-xs text-muted-foreground mb-2 uppercase font-bold tracking-wider">Pending</p>
          <p className="text-4xl font-bold text-yellow-400">{leaves.filter(l => l.status === "Pending").length}</p>
          <p className="text-xs text-muted-foreground mt-1">awaiting approval</p>
        </div>
      </div>

      {/* Apply Form */}
      {showForm && (
        <div className="glass-card rounded-3xl p-8 border border-white/5 animate-fade-in-up">
          <h2 className="text-lg font-bold mb-6">Apply for Leave</h2>
          {clBalance === 0 && (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-6">
              <AlertCircle className="w-5 h-5 shrink-0" />
              Your CL is exhausted. This leave will be marked as <strong>LOP</strong> (Loss of Pay).
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Leave Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}{t==="CL" && clBalance===0 ? " (will be LOP)" : ""}</option>)}
              </select>
            </div>
            <div />
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">From Date</label>
              <input type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">To Date</label>
              <input type="date" required value={form.endDate} min={form.startDate} onChange={e => setForm({...form, endDate: e.target.value})}
                className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reason</label>
              <textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={3}
                placeholder="Please provide a reason for the leave..."
                className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            </div>
            <div className="md:col-span-2 flex gap-4 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-2xl bg-muted/50 text-muted-foreground font-medium hover:bg-muted transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:opacity-90 transition-all active:scale-95 disabled:opacity-60">
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave History */}
      <div className="glass-card rounded-3xl p-8 border border-white/5 space-y-4">
        <h2 className="text-lg font-bold">Leave History</h2>
        <div className="space-y-3">
          {leaves.map((leave, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-muted/30 border border-white/5 hover:bg-muted/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase", leave.isLOP ? "bg-orange-500/10 text-orange-400" : "bg-indigo-500/10 text-indigo-400")}>{leave.isLOP ? "LOP" : leave.type}</span>
                  <span className="text-sm font-semibold">{leave.days} day{leave.days>1?"s":""}</span>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(leave.startDate)} — {formatDate(leave.endDate)}</p>
                <p className="text-xs text-muted-foreground italic">{leave.reason}</p>
              </div>
              <span className={cn("px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-center", STATUS_STYLE[leave.status])}>{leave.status}</span>
            </div>
          ))}
          {leaves.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No leave applications yet.</p>}
        </div>
      </div>
    </div>
  );
}
