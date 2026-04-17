"use client";
import { useState, useEffect } from "react";
import { Search, Calendar, ChevronRight, Clock, User, AlertCircle, RefreshCcw, Trash2, Edit3, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";

export default function WorkUpdatesAdminPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ tasksCompleted: "", hoursSpent: 0, blockers: "", nextDayPlan: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/work-updates");
      const data = await res.json();
      if (data.updates) setUpdates(data.updates);
    } catch (e: any) {
      toast.error("Failed to fetch work updates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = () => {
    if (!selectedUpdate) return;
    setEditForm({
      tasksCompleted: selectedUpdate.tasksCompleted,
      hoursSpent: selectedUpdate.hoursSpent,
      blockers: selectedUpdate.blockers || "",
      nextDayPlan: selectedUpdate.nextDayPlan || ""
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/work-updates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, id: selectedUpdate._id })
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Work update updated!");
      setIsEditing(false);
      fetchData();
      // Update local selected state
      setSelectedUpdate({ ...selectedUpdate, ...editForm });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUpdate || !confirm("Are you sure you want to delete this log?")) return;
    try {
      const res = await fetch(`/api/work-updates?id=${selectedUpdate._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Log deleted");
      setSelectedUpdate(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = updates.filter(upd => 
    upd.userId?.name?.toLowerCase().includes(search.toLowerCase()) || 
    upd.tasksCompleted?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Employee Work Updates</h1>
          <p className="text-muted-foreground mt-1">Review daily progress from all team members.</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 hover:bg-muted font-medium transition-all active:scale-95"
        >
          <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: List */}
        <div className="flex-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search by employee name or task content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted/30 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass-card p-6 rounded-3xl animate-pulse border border-white/5 space-y-3">
                  <div className="h-4 w-1/4 bg-white/5 rounded" />
                  <div className="h-12 w-full bg-white/5 rounded" />
                </div>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((upd) => (
                <div 
                  key={upd._id}
                  onClick={() => { setSelectedUpdate(upd); setIsEditing(false); }}
                  className={cn(
                    "glass-card p-6 rounded-3xl border transition-all cursor-pointer group",
                    selectedUpdate?._id === upd._id ? "border-primary/50 bg-primary/5 shadow-lg" : "border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                        {upd.userId?.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{upd.userId?.name || "Unknown User"}</p>
                        <p className="text-xs text-muted-foreground">{upd.userId?.department || "N/A"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground ring-1 ring-white/10 px-2 py-1 rounded-full bg-white/5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(upd.date)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm line-clamp-2 text-slate-300">
                      {upd.tasksCompleted}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-white/5 -mx-6 -mb-6 p-4 rounded-b-3xl">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{upd.hoursSpent} Hours</span>
                      </div>
                      {upd.blockers && (
                        <div className="flex items-center gap-1.5 text-rose-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Has Blockers</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className={cn("w-4 h-4 transition-transform", selectedUpdate?._id === upd._id && "translate-x-1")} />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Calendar className="w-12 h-12 opacity-20 mb-4" />
                <p>No work updates found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Details View */}
        <div className="lg:w-[450px]">
          <div className="sticky top-8">
            {selectedUpdate ? (
              <div className={cn(
                "glass-card rounded-3xl border border-white/5 overflow-hidden transition-all",
                isEditing && "ring-2 ring-indigo-500/50"
              )}>
                <div className="h-32 bg-gradient-to-br from-indigo-600 to-violet-600 p-8 flex flex-col justify-end relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    {!isEditing ? (
                      <>
                        <button onClick={handleEditClick} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={handleDelete} className="p-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-lg text-white transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setIsEditing(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h2 className="text-white text-xl font-bold">{isEditing ? "Editing Update" : "Update Details"}</h2>
                  <p className="text-white/70 text-sm">{formatDate(selectedUpdate.date)}</p>
                </div>
                
                <div className="p-8 space-y-8">
                  {/* User Section */}
                  {!isEditing && (
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-white/5">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold">
                         {selectedUpdate.userId?.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold">{selectedUpdate.userId?.name}</p>
                        <p className="text-[10px] mt-1 text-primary font-bold uppercase tracking-widest">{selectedUpdate.userId?.employeeId}</p>
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Tasks Completed</label>
                        <textarea 
                          required
                          rows={4}
                          value={editForm.tasksCompleted}
                          onChange={e => setEditForm({...editForm, tasksCompleted: e.target.value})}
                          className="w-full bg-muted/20 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Hours Spent</label>
                        <input 
                          type="number"
                          required
                          min={0} max={24}
                          value={editForm.hoursSpent}
                          onChange={e => setEditForm({...editForm, hoursSpent: parseInt(e.target.value)})}
                          className="w-full bg-muted/20 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Blockers</label>
                        <textarea 
                          rows={2}
                          value={editForm.blockers}
                          onChange={e => setEditForm({...editForm, blockers: e.target.value})}
                          className="w-full bg-muted/20 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Next Day Plan</label>
                        <textarea 
                          rows={2}
                          value={editForm.nextDayPlan}
                          onChange={e => setEditForm({...editForm, nextDayPlan: e.target.value})}
                          className="w-full bg-muted/20 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Save Changes
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tasks Completed</h3>
                        <div className="p-4 bg-muted/20 rounded-2xl text-sm leading-relaxed border border-white/5">
                          {selectedUpdate.tasksCompleted}
                        </div>
                      </div>

                      {selectedUpdate.blockers && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest">Blockers & Issues</h3>
                          <div className="p-4 bg-rose-500/5 rounded-2xl text-sm leading-relaxed border border-rose-500/10">
                            {selectedUpdate.blockers}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Next Day Plan</h3>
                        <div className="p-4 bg-muted/20 rounded-2xl text-sm leading-relaxed border border-white/5 italic text-slate-400">
                          {selectedUpdate.nextDayPlan || "No plan provided."}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl border border-white/5 p-12 flex flex-col items-center text-center space-y-4 h-[500px] justify-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <div>
                  <h3 className="font-bold">Select an update</h3>
                  <p className="text-sm text-muted-foreground mt-1">Select an item from the list to view full details, edit content or remove the log.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
