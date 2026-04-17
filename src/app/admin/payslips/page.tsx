"use client";
import { useState, useEffect } from "react";
import { Plus, Receipt, Trash2, Search, X, Loader2, CheckCircle2, FileUp, Filter, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

export default function AdminPayslipsPage() {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    userId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    file: null as File | null
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents?category=Payslip");
      const data = await res.json();
      if (data.documents) setPayslips(data.documents);

      const empRes = await fetch("/api/admin/employees");
      const empData = await empRes.json();
      if (empData.employees) setEmployees(empData.employees);
    } catch (e) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file || !form.userId) {
      toast.error("Please select an employee and a file");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", form.file);
      formData.append("userId", form.userId);
      formData.append("category", "Payslip");
      formData.append("month", form.month.toString());
      formData.append("year", form.year.toString());
      formData.append("name", `Payslip_${getMonthName(form.month)}_${form.year}`);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Payslip uploaded successfully!");
      setShowForm(false);
      setForm({...form, file: null});
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getMonthName = (m: number) => {
    return new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' });
  };

  const filtered = payslips.filter(p => 
    p.userId?.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.year.toString().includes(search) ||
    getMonthName(p.month).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Payroll Management</h1>
          <p className="text-muted-foreground mt-1">Upload and manage monthly payslips for employees.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Upload Payslip
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Receipt className="w-5 h-5 text-emerald-500" />
              Generate New Payslip
            </h2>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Target Employee</label>
                <select required value={form.userId} onChange={e => setForm({...form, userId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option value="">Select Employee...</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Month</label>
                  <select value={form.month} onChange={e => setForm({...form, month: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Year</label>
                  <select value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Payslip PDF</label>
                <input type="file" required accept="application/pdf" onChange={e => setForm({...form, file: e.target.files?.[0] || null})}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <FileUp className="w-5 h-5"/>}
                Upload Payslip
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by employee, month or year..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card h-40 rounded-3xl animate-pulse bg-white border border-white/5" />)
          ) : filtered.length > 0 ? (
            filtered.map((p) => (
              <div key={p._id} className="glass-card p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all group bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Receipt className="w-5 h-5" /></div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-widest">{p.year}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 leading-tight mb-1">{getMonthName(p.month)}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{p.userId?.name}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between gap-2">
                   <a href={`/api/documents/${p._id}`} download className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-600 text-[11px] font-bold text-center hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                     Download
                   </a>
                   <button onClick={async () => {
                     if(!confirm("Delete this payslip?")) return;
                     await fetch(`/api/documents/${p._id}`, { method: 'DELETE' });
                     toast.success("Payslip deleted");
                     fetchData();
                   }} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">No payslips found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
