"use client";
import { useState, useEffect } from "react";
import { 
  Plus, Search, TrendingUp, Filter, 
  ChevronRight, Calendar, User, 
  Edit3, Trash2, Loader2, X, Star, 
  Trophy, Target, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { getMonthName, cn } from "@/lib/utils";
import Link from "next/link";

export default function PerformanceAdminPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    rating: 5,
    managerRemarks: "",
    goals: "",
    responsibilities: "",
    selfAssessment: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/performance");
      const data = await res.json();
      if (data.records) setRecords(data.records);
      if (data.employees) setEmployees(data.employees);
    } catch (e) {
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = "/api/admin/performance";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) throw new Error("Operation failed");
      
      toast.success(editingId ? "Review updated!" : "Review posted!");
      handleCloseForm();
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (rec: any) => {
    setForm({
      userId: rec.userId?._id || rec.userId,
      month: rec.month,
      year: rec.year,
      rating: rec.rating,
      managerRemarks: rec.managerRemarks || "",
      goals: rec.goals || "",
      responsibilities: rec.responsibilities || "",
      selfAssessment: rec.selfAssessment || ""
    });
    setEditingId(rec._id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      userId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(),
      rating: 5, managerRemarks: "", goals: "", responsibilities: "", selfAssessment: ""
    });
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Delete this performance record?")) return;
    try {
      const res = await fetch(`/api/admin/performance?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Record removed");
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
          <h1 className="text-3xl font-bold gradient-text">Performance Analytics</h1>
          <p className="text-muted-foreground mt-1 font-medium">Evaluate team contributions and track growth milestones.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card rounded-[32px] p-8 border border-white bg-white/70 backdrop-blur-xl animate-fade-in-up shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              {editingId ? "Edit Performance Review" : "Create Monthly Review"}
            </h2>
            <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Employee</label>
                <select 
                  required
                  value={form.userId}
                  onChange={e => setForm({...form, userId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Period (Month & Year)</label>
                <div className="flex gap-2">
                  <select 
                    value={form.month}
                    onChange={e => setForm({...form, month: parseInt(e.target.value)})}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-center"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>
                    ))}
                  </select>
                  <input 
                    type="number"
                    value={form.year}
                    onChange={e => setForm({...form, year: parseInt(e.target.value)})}
                    className="w-24 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-center"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Rating (1 - 10)</label>
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1">
                   <input 
                    type="range" min="1" max="10" step="1"
                    value={form.rating}
                    onChange={e => setForm({...form, rating: parseInt(e.target.value)})}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">{form.rating}</span>
                </div>
              </div>

              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                       <Target className="w-3.5 h-3.5" /> Goals & Objectives
                    </label>
                    <textarea 
                      rows={4}
                      value={form.goals}
                      onChange={e => setForm({...form, goals: e.target.value})}
                      placeholder="Outline key targets achieved..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                       <MessageSquare className="w-3.5 h-3.5" /> Manager Remarks
                    </label>
                    <textarea 
                      rows={4}
                      value={form.managerRemarks}
                      onChange={e => setForm({...form, managerRemarks: e.target.value})}
                      placeholder="Feedback on quality of work, soft skills..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                    />
                 </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={handleCloseForm}
                className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {editingId ? "Update Review" : "Publish Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Registry */}
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or employee ID..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[24px] pl-11 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card h-64 rounded-[32px] animate-pulse bg-white/50 border border-slate-100" />
             ))
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((rec) => (
              <div key={rec._id} className="glass-card group p-8 rounded-[32px] border border-slate-100 bg-white hover:border-indigo-100 transition-all shadow-sm hover:shadow-xl relative overflow-hidden">
                 <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {rec.userId?.name?.[0]}
                       </div>
                       <div>
                          <p className="font-extrabold text-slate-800 truncate max-w-[140px] leading-tight">{rec.userId?.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-widest uppercase">{rec.userId?.employeeId}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="w-12 h-12 rounded-full border-4 border-slate-50 flex items-center justify-center font-black text-indigo-600 bg-indigo-50 shadow-inner group-hover:border-indigo-100 transition-all">
                          {rec.rating}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                       <Calendar className="w-3.5 h-3.5" /> {getMonthName(rec.month)} {rec.year}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 italic font-medium leading-relaxed">
                       "{rec.managerRemarks || "No remarks provided."}"
                    </p>
                 </div>

                 <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex -space-x-2">
                       {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "w-3.5 h-3.5",
                              i < Math.floor(rec.rating / 2) ? "text-amber-400 fill-amber-400" : "text-slate-100 fill-slate-100"
                            )} 
                          />
                       ))}
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleEdit(rec)}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                       >
                          <Edit3 className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => deleteRecord(rec._id)}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
               <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <h3 className="text-slate-500 font-bold">No performance records found</h3>
               <p className="text-slate-400 text-sm mt-1">Start evaluating your workforce performance today.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
