"use client";
import { useState } from "react";
import { MessageSquare, Send, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Work Environment", "Management", "Team", "Process", "Other"];
const TYPES = ["General", "Anonymous"];

export default function FeedbackPage() {
  const [form, setForm] = useState({ type: "General", rating: 4, message: "", isAnonymous: false, category: "Work Environment" });
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, isAnonymous: form.type === "Anonymous" }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Feedback submitted! Thank you for helping us improve 🙏");
      setSubmitted(true);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-fade-in-up">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <MessageSquare className="w-10 h-10 text-emerald-400" />
      </div>
      <h2 className="text-2xl font-bold">Thank you for your feedback!</h2>
      <p className="text-muted-foreground text-center max-w-sm">Your input helps us create a better workplace. HR will review it shortly.</p>
      <button onClick={() => setSubmitted(false)} className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all">Submit Another</button>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Employee Feedback</h1>
        <p className="text-muted-foreground mt-1">Share your thoughts anonymously or openly. Your voice matters!</p>
      </div>

      <div className="glass-card rounded-3xl p-8 border border-white/5">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Feedback Type</label>
            <div className="flex gap-3">
              {TYPES.map(t => (
                <button key={t} type="button" onClick={() => setForm({...form, type: t, isAnonymous: t === "Anonymous"})}
                  className={cn("px-5 py-2.5 rounded-2xl text-sm font-medium transition-all border",
                    form.type === t ? "bg-primary text-primary-foreground border-primary shadow-md" : "border-white/10 text-muted-foreground hover:bg-muted/40")}>
                  {t === "Anonymous" ? "🎭 Anonymous" : "💬 Named"} {t}
                </button>
              ))}
            </div>
            {form.type === "Anonymous" && <p className="text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-xl">Your identity will not be revealed to HR or management.</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => setForm({...form, category: c})}
                  className={cn("px-4 py-2 rounded-2xl text-xs font-medium transition-all border",
                    form.category === c ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" : "border-white/10 text-muted-foreground hover:bg-muted/40")}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button"
                  onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setForm({...form, rating: s})}
                  className="transition-transform hover:scale-110 active:scale-95">
                  <Star className={cn("w-8 h-8 transition-colors",
                    s <= (hoverRating || form.rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30")} />
                </button>
              ))}
              <span className="ml-3 text-sm font-bold text-yellow-400">
                {["","Very Poor","Poor","Okay","Good","Excellent"][form.rating]}
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Feedback *</label>
            <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5}
              placeholder="Share your experience, suggestions, or concerns in detail..."
              className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-indigo-600/20">
            <Send className="w-4 h-4" /> {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
