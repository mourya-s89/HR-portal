"use client";
import { useState, useEffect } from "react";
import { 
  Search, UserX, Calendar, 
  Trash2, Loader2, X, Star, 
  ThumbsUp, ThumbsDown, MessageSquare,
  FileText, ArrowRight, TrendingUp, CheckCircle2, UserRoundX
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

export default function ExitInterviewsAdminPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/exit-interviews");
      const data = await res.json();
      if (data.records) setRecords(data.records);
    } catch (e) {
      toast.error("Failed to load exit interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/exit-interviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedRecord._id, managerFeedback: feedback })
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Feedback recorded");
      setSelectedRecord(null);
      setFeedback("");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Remove this exit interview record?")) return;
    try {
      const res = await fetch(`/api/admin/exit-interviews?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Record deleted");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filteredRecords = records.filter(rec => 
    rec.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    rec.userId?.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Offboarding Intelligence</h1>
          <p className="text-muted-foreground mt-1 font-medium">Analyzing attrition patterns and farewell feedback.</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95 text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
          Refresh List
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* List View */}
        <div className="flex-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or employee ID..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[24px] pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm font-medium"
            />
          </div>

          <div className="space-y-4">
             {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                   <div key={i} className="glass-card h-32 rounded-[32px] animate-pulse bg-white/50 border border-slate-100" />
                ))
             ) : filteredRecords.length > 0 ? (
               filteredRecords.map((rec) => (
                 <div 
                   key={rec._id} 
                   onClick={() => { setSelectedRecord(rec); setFeedback(rec.managerFeedback || ""); }}
                   className={cn(
                     "glass-card group p-6 rounded-[32px] border transition-all cursor-pointer bg-white relative overflow-hidden",
                     selectedRecord?._id === rec._id ? "border-indigo-400 shadow-xl" : "border-slate-100 hover:border-slate-200 shadow-sm"
                   )}
                 >
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all",
                             selectedRecord?._id === rec._id ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400"
                          )}>
                             {rec.userId?.name?.[0]}
                          </div>
                          <div>
                             <p className="font-extrabold text-slate-800 leading-tight">{rec.userId?.name}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rec.userId?.employeeId}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Left {formatDate(rec.lastWorkingDate)}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className={cn(
                             "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                             rec.status === "Submitted" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          )}>
                             {rec.status}
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteRecord(rec._id); }}
                            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 </div>
               ))
             ) : (
               <div className="py-20 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center">
                  <FileText className="w-12 h-12 text-slate-200 mb-4" />
                  <p className="text-slate-500 font-bold">No exit interview data</p>
               </div>
             )}
          </div>
        </div>

        {/* Details View */}
        <div className="lg:w-[450px]">
           <div className="sticky top-8">
              {selectedRecord ? (
                 <div className="glass-card rounded-[40px] border border-slate-200 bg-white overflow-hidden shadow-2xl animate-fade-in-up">
                    <div className="p-8 bg-slate-900 text-white relative">
                       <h3 className="text-xl font-black">Farewell Report</h3>
                       <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-bold">Resigned on {formatDate(selectedRecord.resignationDate)}</p>
                       <div className="absolute top-8 right-8 w-12 h-12 rounded-full border-4 border-slate-700 flex items-center justify-center font-black text-indigo-400">
                          {selectedRecord.overallExperience}/5
                       </div>
                    </div>

                    <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Primary Reason</label>
                          <p className="text-sm font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             {selectedRecord.reasonForLeaving}
                          </p>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                             {selectedRecord.wouldRecommend ? <ThumbsUp className="w-5 h-5 text-emerald-500 mb-2" /> : <ThumbsDown className="w-5 h-5 text-rose-500 mb-2" />}
                             <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Would Recommend</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                             <TrendingUp className="w-5 h-5 text-indigo-500 mb-2" />
                             <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rating: {selectedRecord.overallExperience}/5</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="p-5 bg-indigo-50/50 rounded-[24px] border border-indigo-100 flex gap-4">
                             <div className="p-2 rounded-xl bg-white text-indigo-500 shadow-sm h-fit"><ThumbsUp className="w-4 h-4" /></div>
                             <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">What they liked most</p>
                                <p className="text-xs text-indigo-900 font-medium leading-relaxed">{selectedRecord.likeMost || "Not specified."}</p>
                             </div>
                          </div>
                          <div className="p-5 bg-amber-50/50 rounded-[24px] border border-amber-100 flex gap-4">
                             <div className="p-2 rounded-xl bg-white text-amber-500 shadow-sm h-fit"><MessageSquare className="w-4 h-4" /></div>
                             <div>
                                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Improvement Suggestions</p>
                                <p className="text-xs text-amber-900 font-medium leading-relaxed">{selectedRecord.improvementSuggestions || "No suggestions provided."}</p>
                             </div>
                          </div>
                       </div>

                       <form onSubmit={handleUpdate} className="pt-6 border-t border-slate-100 space-y-4">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block pl-1">HR/Manager Final Remarks</label>
                          <textarea 
                             rows={3}
                             value={feedback}
                             onChange={e => setFeedback(e.target.value)}
                             placeholder="Note down interview conclusions..."
                             className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                          />
                          <button 
                             type="submit"
                             disabled={submitting}
                             className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-100"
                          >
                             {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                             Save Farewell Review
                             <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </button>
                       </form>
                    </div>
                 </div>
              ) : (
                 <div className="glass-card rounded-[40px] border border-slate-100 bg-slate-50/50 p-12 text-center h-[500px] flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 rounded-[2rem] bg-white shadow-inner flex items-center justify-center">
                       <UserRoundX className="w-10 h-10 text-slate-200" />
                    </div>
                    <div>
                       <h3 className="text-slate-800 font-bold">Select a Record</h3>
                       <p className="text-slate-400 text-xs mt-1 max-w-[200px] mx-auto font-medium">Review the complete offboarding report and add administrative notes.</p>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
