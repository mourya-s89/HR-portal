"use client";
import { useState, useEffect } from "react";
import { 
  Plus, Search, Receipt, Trash2, 
  Download, Eye, Loader2, X,
  Filter, Upload, User, Calendar,
  CreditCard, Send, FileText
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, getMonthName, cn } from "@/lib/utils";

export default function PayslipsAdminPage() {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    file: null as File | null
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Use the newly created admin documents API filtered by category
      const res = await fetch("/api/admin/documents");
      const data = await res.json();
      if (data.documents) {
        setPayslips(data.documents.filter((d: any) => d.category === "Payslip"));
      }
      if (data.employees) setEmployees(data.employees);
    } catch (e) {
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file || !form.userId) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", form.file);
      formData.append("userId", form.userId);
      formData.append("category", "Payslip");
      formData.append("month", form.month.toString());
      formData.append("year", form.year.toString());
      formData.append("name", `Payslip_${getMonthName(form.month)}_${form.year}`);

      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Payslip published successfully");
      setShowUpload(false);
      setForm({ userId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), file: null });
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deletePayslip = async (id: string) => {
    if (!confirm("Remove this payslip?")) return;
    try {
      const res = await fetch(`/api/admin/documents?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Payslip removed");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filteredPayslips = payslips.filter(p => 
    p.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.userId?.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    getMonthName(p.month).toLowerCase().includes(search.toLowerCase()) ||
    p.year.toString().includes(search)
  );

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Payroll Ledger</h1>
          <p className="text-muted-foreground mt-1 font-medium">Distribute monthly compensation statements to the team.</p>
        </div>
        {!showUpload && (
          <button 
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-xl hover:bg-emerald-700 transition-all active:scale-95"
          >
            <Upload className="w-5 h-5" />
            Publish Payslip
          </button>
        )}
      </div>

      {showUpload && (
        <div className="glass-card rounded-[32px] p-8 border border-white bg-white/80 animate-fade-in-up shadow-2xl">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                 <CreditCard className="w-5 h-5 text-emerald-500" />
                 Generate Digital Payslip
              </h2>
              <button 
                onClick={() => setShowUpload(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
           </div>

           <form onSubmit={handleUpload} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Employee</label>
                    <select 
                      required
                      value={form.userId}
                      onChange={e => setForm({...form, userId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                    >
                       <option value="">Select Employee</option>
                       {employees.map(emp => (
                         <option key={emp._id} value={emp._id}>{emp.name}</option>
                       ))}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Month</label>
                    <select 
                      value={form.month}
                      onChange={e => setForm({...form, month: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                    >
                       {Array.from({ length: 12 }, (_, i) => (
                          <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>
                       ))}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Year</label>
                    <input 
                      type="number"
                      value={form.year}
                      onChange={e => setForm({...form, year: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block mb-2">Statement File (PDF)</label>
                 <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-all cursor-pointer relative group">
                    <input 
                      type="file" 
                      required
                      accept="application/pdf"
                      onChange={e => setForm({...form, file: e.target.files?.[0] || null})}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <FileText className="w-10 h-10 text-slate-300 group-hover:text-emerald-400 mb-4 transition-all" />
                    <p className="text-sm font-bold text-slate-600">
                       {form.file ? form.file.name : "Choose Payslip PDF"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Confidential Document Upload</p>
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                 <button type="button" onClick={() => setShowUpload(false)} className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
                 <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-10 py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                 >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Publish Statement
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* Grid View */}
      <div className="space-y-6">
        <div className="relative">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search by employee name, month or year..." 
             value={search} 
             onChange={e => setSearch(e.target.value)}
             className="w-full bg-white border border-slate-200 rounded-[24px] pl-12 pr-6 py-4.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm font-medium"
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                 <div key={i} className="glass-card h-52 rounded-[32px] animate-pulse bg-white border border-slate-100" />
              ))
           ) : filteredPayslips.length > 0 ? (
             filteredPayslips.map((p) => (
               <div key={p._id} className="glass-card group p-6 rounded-[32px] border border-slate-100 bg-white hover:border-emerald-100 transition-all shadow-sm hover:shadow-xl flex flex-col relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold text-lg group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                        <Receipt className="w-6 h-6" />
                     </div>
                     <div className="text-right">
                        <p className="text-[14px] font-black text-slate-800 leading-tight">{p.year}</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{getMonthName(p.month)}</p>
                     </div>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-sm mb-1 truncate group-hover:text-emerald-600 transition-colors" title={p.userId?.name}>
                     {p.userId?.name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{p.userId?.employeeId}</p>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-2">
                     <a 
                       href={`/api/admin/documents/${p._id}`} 
                       target="_blank"
                       className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold text-center hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                     >
                        <Eye className="w-3.5 h-3.5" /> View
                     </a>
                     <button 
                       onClick={() => deletePayslip(p._id)}
                       className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm group-hover:opacity-100"
                       title="Delete"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
             ))
           ) : (
             <div className="col-span-full py-32 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center">
                <Receipt className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-slate-600 font-bold">Payroll Ledger Empty</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-[200px]">No payslips have been published for the selected filters.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
