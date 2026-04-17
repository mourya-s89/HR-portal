"use client";
import { useState, useEffect } from "react";
import { Search, Calendar, ChevronRight, CheckCheck, X, Loader2, AlertTriangle, User, Filter, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      // In a real app, I'd have a specific admin endpoint for all leaves.
      // For now, I'll fetch from /api/leaves and expect the backend to handle Admin role correctly as I verified earlier.
      const res = await fetch("/api/leaves");
      const data = await res.json();
      if (data.leaves) setLeaves(data.leaves);
    } catch (e) {
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (!res.ok) throw new Error("Operation failed");
      toast.success(`Leave ${action}ed successfully`);
      fetchLeaves();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = leaves.filter(l => {
    const matchesSearch = l.userId?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          l.reason?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || l.status === filter;
    return matchesSearch && matchesFilter;
  });

  const STATUS_COLORS: any = {
    "Pending": "bg-amber-500/10 text-amber-500 border-amber-200",
    "Approved": "bg-emerald-500/10 text-emerald-500 border-emerald-200",
    "Rejected": "bg-rose-500/10 text-rose-500 border-rose-200"
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Leave Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage employee leave applications.</p>
        </div>
        <button onClick={fetchLeaves} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-bold hover:bg-white transition-all">
          <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by employee or reason..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm" />
        </div>
        <div className="flex gap-2">
          {["All", "Pending", "Approved", "Rejected"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                filter === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card h-28 rounded-3xl animate-pulse bg-white border border-white/5" />)
        ) : filtered.length > 0 ? (
          filtered.map((leave) => (
            <div key={leave._id} className="glass-card p-6 rounded-[2rem] border border-white/10 hover:border-white/20 transition-all group bg-white shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl font-bold shadow-sm ring-1 ring-indigo-100">
                    {leave.userId?.name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      {leave.userId?.name}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 uppercase tracking-widest">{leave.userId?.employeeId}</span>
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-400 text-[10px] font-bold uppercase">{leave.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 lg:max-w-md">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reason</p>
                   <p className="text-sm text-slate-600 line-clamp-2">{leave.reason}</p>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0">
                  <div className={cn("px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest", STATUS_COLORS[leave.status])}>
                    {leave.status}
                  </div>
                  
                  {leave.status === "Pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(leave._id, "approve")}
                        className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200 active:scale-95">
                        <CheckCheck className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleAction(leave._id, "reject")}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No leave requests found.</p>
            <p className="text-slate-400 text-sm mt-1 font-medium">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
