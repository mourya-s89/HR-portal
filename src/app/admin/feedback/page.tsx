"use client";
import { useState, useEffect } from "react";
import { 
  Search, MessageSquare, Filter, 
  User, CheckCircle2, Trash2, 
  Loader2, X, Star, Flag, 
  UserRoundCheck, UserRoundX, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

export default function FeedbackAdminPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      if (data.feedbacks) setFeedbacks(data.feedbacks);
    } catch (e) {
      toast.error("Failed to load feedback data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const deleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback forever?")) return;
    try {
      const res = await fetch(`/api/admin/feedback?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Feedback deleted");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesSearch = fb.message?.toLowerCase().includes(search.toLowerCase()) ||
                          fb.fromUser?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || fb.category === filter || fb.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case "Management": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "Work Environment": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Team": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Process": return "bg-violet-50 text-violet-600 border-violet-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Feedback Center</h1>
          <p className="text-muted-foreground mt-1 font-medium">Monitoring employee sentiment and organizational health.</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95 text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
          Refresh Inbox
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-7 h-7" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Submissions</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{feedbacks.length}</p>
           </div>
        </div>
        <div className="glass-card p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner">
              <UserRoundX className="w-7 h-7" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Anonymous</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{feedbacks.filter(f => f.isAnonymous).length}</p>
           </div>
        </div>
        <div className="glass-card p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
              <UserRoundCheck className="w-7 h-7" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Average Rating</p>
              <p className="text-2xl font-black text-slate-800 leading-none">
                 {(feedbacks.reduce((acc, f) => acc + f.rating, 0) / (feedbacks.length || 1)).toFixed(1)} / 5
              </p>
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search feedback content or author..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[28px] pl-12 pr-6 py-4.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm font-medium"
          />
        </div>
        <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-x-auto">
          {["All", "Management", "Work Environment", "Team", "Process", "Anonymous"].map(cat => (
             <button 
               key={cat} 
               onClick={() => setFilter(cat)}
               className={cn(
                 "px-5 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                 filter === cat ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-800 hover:bg-slate-50"
               )}
             >
               {cat}
             </button>
          ))}
        </div>
      </div>

      {/* Inbox */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
           Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card h-40 rounded-[32px] animate-pulse bg-white/50 border border-slate-100" />
           ))
        ) : filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map((fb) => (
            <div key={fb._id} className="glass-card group p-8 rounded-[40px] border border-slate-100 bg-white hover:border-indigo-100 transition-all shadow-sm hover:shadow-xl relative overflow-hidden">
               <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-row md:flex-col items-center md:items-start gap-4 shrink-0">
                     <div className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center font-black text-xl shadow-inner transition-all",
                        fb.isAnonymous ? "bg-slate-900 text-white" : "bg-indigo-50 text-indigo-600"
                     )}>
                        {fb.isAnonymous ? "?" : (fb.fromUser?.name?.[0] || "U")}
                     </div>
                     <div className="md:text-left">
                        <p className="font-extrabold text-slate-800 leading-tight">
                           {fb.isAnonymous ? "Anonymous User" : (fb.fromUser?.name || "Unknown")}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                           {fb.isAnonymous ? "PROTECTED SENDER" : (fb.fromUser?.employeeId || "NO-ID")}
                        </p>
                     </div>
                  </div>

                  <div className="flex-1 space-y-4">
                     <div className="flex items-center flex-wrap gap-3">
                        <span className={cn("px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest", getCategoryColor(fb.category))}>
                           {fb.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                           <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {fb.rating} Rating
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{formatDate(fb.createdAt)}</p>
                     </div>
                     <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {fb.message}
                     </p>
                  </div>

                  <div className="flex flex-row md:flex-col justify-end gap-3 shrink-0">
                     <button 
                        onClick={() => deleteFeedback(fb._id)}
                        className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        title="Delete Feedback"
                     >
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center bg-slate-50/50 rounded-[60px] border-2 border-dashed border-slate-200 flex flex-col items-center">
             <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center mb-6">
                <Flag className="w-10 h-10 text-indigo-300" />
             </div>
             <h3 className="text-slate-600 text-xl font-black">Private Inbox Empty</h3>
             <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-medium">No feedback matching your filters is currently available for review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
