"use client";
import { useState, useEffect } from "react";
import { 
  Plus, Search, Book, Trash2, 
  Edit3, Loader2, X, FileText,
  Workflow, Building2, Tag, ChevronRight,
  ShieldCheck, Info
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

export default function SOPAdminPage() {
  const [sops, setSops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    department: "Operations",
    category: "General",
    content: "",
    version: "1.0",
    isActive: true,
    tags: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sop");
      const data = await res.json();
      if (data.sops) setSops(data.sops);
    } catch (e) {
      toast.error("Failed to load SOPs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = "/api/admin/sop";
      const method = editingId ? "PUT" : "POST";
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(t => t !== "");
      const body = editingId ? { ...form, id: editingId, tags: tagsArray } : { ...form, tags: tagsArray };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) throw new Error("Operation failed");
      
      toast.success(editingId ? "SOP updated!" : "SOP published!");
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
      title: rec.title,
      department: rec.department,
      category: rec.category,
      content: rec.content,
      version: rec.version,
      isActive: rec.isActive,
      tags: (rec.tags || []).join(', ')
    });
    setEditingId(rec._id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      title: "", department: "Operations", category: "General", 
      content: "", version: "1.0", isActive: true, tags: ""
    });
  };

  const deleteSOP = async (id: string) => {
    if (!confirm("Delete this SOP?")) return;
    try {
      const res = await fetch(`/api/admin/sop?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("SOP removed");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = sops.filter(s => 
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Operational SOPs</h1>
          <p className="text-muted-foreground mt-1 font-medium">Standard Operating Procedures for consistent and reliable results.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create SOP
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card rounded-[32px] p-8 border border-white bg-white/70 backdrop-blur-xl animate-fade-in-up shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Workflow className="w-6 h-6 text-indigo-500" />
              {editingId ? "Modify Procedure" : "New Standard Procedure"}
            </h2>
            <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">SOP Title</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g., Server Maintenance Protocol"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" />
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Department</label>
                  <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold">
                     <option value="Operations">Operations</option>
                     <option value="Engineering">Engineering</option>
                     <option value="HR">HR</option>
                     <option value="Finance">Finance</option>
                     <option value="Marketing">Marketing</option>
                     <option value="Legal">Legal</option>
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Category / Tagging</label>
                  <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="e.g., Safety, Tech, Emergency (comma separated)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" />
               </div>

               <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Operational Checklist / Content</label>
                  <textarea rows={8} required value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Detailed step-by-step instructions..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium whitespace-pre-wrap" />
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
               <button type="button" onClick={handleCloseForm} className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95">Discard</button>
               <button type="submit" disabled={submitting} className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingId ? "Save Changes" : "Finalize SOP"}
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      <div className="space-y-6">
        <div className="relative">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input type="text" placeholder="Search procedures by title, department or tags..." value={search} onChange={e => setSearch(e.target.value)}
             className="w-full bg-white border border-slate-200 rounded-[28px] pl-12 pr-6 py-4.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm font-medium" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {loading ? (
             Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card h-64 rounded-[32px] animate-pulse bg-white border border-slate-100" />
             ))
           ) : filtered.length > 0 ? (
             filtered.map((sop) => (
               <div key={sop._id} className="glass-card group p-8 rounded-[40px] border border-slate-100 bg-white hover:border-indigo-100 transition-all shadow-sm hover:shadow-xl relative flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                     <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                        <Workflow className="w-6 h-6" />
                     </div>
                     <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                        v{sop.version}
                     </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-lg mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                     {sop.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                     <Building2 className="w-3.5 h-3.5 text-slate-300" />
                     <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{sop.department}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                     {(sop.tags || []).slice(0, 3).map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-all">#{tag}</span>
                     ))}
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Last Updated</span>
                        <span className="text-xs font-bold text-slate-500">{formatDate(sop.updatedAt)}</span>
                     </div>
                     <div className="flex gap-1.5">
                        <button onClick={() => handleEdit(sop)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                           <Edit3 className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={() => deleteSOP(sop._id)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm">
                           <Trash2 className="w-4.5 h-4.5" />
                        </button>
                     </div>
                  </div>
               </div>
             ))
           ) : (
             <div className="col-span-full py-40 text-center bg-slate-50/50 rounded-[60px] border-2 border-dashed border-slate-200 flex flex-col items-center">
                <Workflow className="w-16 h-16 text-slate-200 mb-6" />
                <h3 className="text-slate-700 text-xl font-black">No Procedures Defined</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-medium">Capture your operational knowledge and create repeatable success blueprints.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
