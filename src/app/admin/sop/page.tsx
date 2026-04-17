"use client";
import { useState, useEffect } from "react";
import { Plus, FileText, Trash2, Edit3, X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

export default function AdminSOPPage() {
  const [sops, setSops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    department: "General",
    isActive: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sop");
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
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;
      const res = await fetch("/api/sop", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Operation failed");
      toast.success(editingId ? "SOP updated!" : "SOP created!");
      handleCloseForm();
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sop: any) => {
    setForm({
      title: sop.title,
      content: sop.content,
      department: sop.department,
      isActive: sop.isActive ?? true
    });
    setEditingId(sop._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this SOP permanently?")) return;
    try {
      const res = await fetch(`/api/sop?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("SOP removed");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ title: "", content: "", department: "General", isActive: true });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Standard Operating Procedures</h1>
          <p className="text-muted-foreground mt-1">Manage official SOPs and operational guidelines.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New SOP
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <FileText className="w-5 h-5 text-violet-500" />
              {editingId ? "Edit SOP" : "Create New SOP"}
            </h2>
            <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">SOP Title</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">SOP Content</label>
                <textarea required rows={6} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-mono" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Department</label>
                <input required value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>

              <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-5 h-5 text-violet-500" />
                <label className="text-sm font-bold text-slate-700">Active / Visible</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={handleCloseForm} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckCircle2 className="w-5 h-5"/>}
                {editingId ? "Update SOP" : "Create SOP"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card h-24 rounded-3xl animate-pulse bg-white border border-white/5" />)
        ) : sops.length > 0 ? (
          sops.map((s) => (
            <div key={s._id} className="glass-card p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all group bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-violet-50 text-violet-500 shrink-0"><FileText className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-3">
                      {s.title}
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-bold uppercase tracking-widest">{s.department}</span>
                    </h3>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400 font-medium">
                      <span>Updated {formatDate(s.updatedAt)}</span>
                      <span>By {s.postedBy?.name || "Admin"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleEdit(s)} className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(s._id)} className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No SOPs found.</p>
            <p className="text-slate-400 text-sm mt-1">Start by adding your first standard operating procedure.</p>
          </div>
        )}
      </div>
    </div>
  );
}
