"use client";
import { useState, useEffect } from "react";
import { UserX, Send, Star, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ExitInterviewPage() {
  const [form, setForm] = useState({ resignationDate: "", lastWorkingDate: "", reasonForLeaving: "", overallExperience: 3, likeMost: "", improvementSuggestions: "", wouldRecommend: false, managerFeedback: "", status: "Submitted" });
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<any>(null);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetch("/api/exit-interview").then(r => r.json()).then(d => {
      if (d.interviews?.[0]) { setExisting(d.interviews[0]); }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/exit-interview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Exit interview submitted. Wishing you the very best!");
      setExisting(data.interview);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  if (existing?.status === "Submitted") return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-fade-in-up">
      <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold">Exit Interview Submitted</h2>
      <p className="text-muted-foreground text-center max-w-sm">Thank you for completing the exit interview. HR will review your responses. We wish you the best in your next chapter!</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Exit Interview</h1>
        <p className="text-muted-foreground mt-1">Your honest feedback helps us improve the workplace for everyone.</p>
      </div>

      <div className="glass-card rounded-3xl p-8 border border-white/5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Resignation Date *</label>
              <input required type="date" value={form.resignationDate} onChange={e => setForm({...form, resignationDate: e.target.value})}
                className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Working Date *</label>
              <input required type="date" value={form.lastWorkingDate} onChange={e => setForm({...form, lastWorkingDate: e.target.value})}
                className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Primary Reason for Leaving *</label>
            <textarea required value={form.reasonForLeaving} onChange={e => setForm({...form, reasonForLeaving: e.target.value})} rows={3}
              placeholder="e.g. Better career opportunity, personal reasons, relocation..."
              className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Overall Experience *</label>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button"
                  onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setForm({...form, overallExperience: s})}
                  className="transition-transform hover:scale-110">
                  <Star className={cn("w-8 h-8 transition-colors", s <= (hoverRating || form.overallExperience) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30")} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">What did you like most?</label>
            <textarea value={form.likeMost} onChange={e => setForm({...form, likeMost: e.target.value})} rows={3}
              placeholder="Team culture, projects, learning opportunities..."
              className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Improvement Suggestions</label>
            <textarea value={form.improvementSuggestions} onChange={e => setForm({...form, improvementSuggestions: e.target.value})} rows={3}
              placeholder="What could the company do better?"
              className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Manager Feedback</label>
            <textarea value={form.managerFeedback} onChange={e => setForm({...form, managerFeedback: e.target.value})} rows={2}
              placeholder="Your feedback about your immediate manager..."
              className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-white/10">
            <input type="checkbox" id="recommend" checked={form.wouldRecommend} onChange={e => setForm({...form, wouldRecommend: e.target.checked})}
              className="w-5 h-5 rounded accent-indigo-500" />
            <label htmlFor="recommend" className="text-sm font-medium cursor-pointer">I would recommend this company to others</label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-indigo-600/20">
            <Send className="w-4 h-4" /> {loading ? "Submitting..." : "Submit Exit Interview"}
          </button>
        </form>
      </div>
    </div>
  );
}
