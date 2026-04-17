"use client";
import { useState, useEffect } from "react";
import { Plus, FolderOpen, Trash2, Search, X, Loader2, CheckCircle2, FileUp, Filter, User } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    userId: "",
    name: "",
    category: "Contract",
    file: null as File | null
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all docs (if no userId is passed, the API returns for current user - I should probably update admin API to fetch ALL docs)
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);

      // Fetch employees for dropdown
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
      formData.append("name", form.name || form.file.name);
      formData.append("category", form.category);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Document uploaded successfully!");
      handleCloseForm();
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document permanently?")) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Document removed");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setForm({ userId: "", name: "", category: "Contract", file: null });
  };

  const filtered = documents.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase()) || 
    doc.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Employee Documents</h1>
          <p className="text-muted-foreground mt-1">Manage official documents, certificates, and contracts.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
          >
            <FileUp className="w-5 h-5" />
            Upload Document
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <FolderOpen className="w-5 h-5 text-indigo-500" />
              Upload New Document
            </h2>
            <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Target Employee</label>
                <select required value={form.userId} onChange={e => setForm({...form, userId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="">Select Employee...</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId || "No ID"})</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option>Contract</option>
                  <option>Certificate</option>
                  <option>Personal</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Document Name (Optional)</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Defaults to filename"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">File Selection</label>
                <input type="file" required onChange={e => setForm({...form, file: e.target.files?.[0] || null})}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={handleCloseForm} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <FileUp className="w-5 h-5"/>}
                Upload Document
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & List */}
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by document name or employee..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card h-32 rounded-3xl animate-pulse bg-white border border-white/5" />)
          ) : filtered.length > 0 ? (
            filtered.map((doc) => (
              <div key={doc._id} className="glass-card p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all group bg-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{doc.category}</p>
                    <div className="flex items-center gap-2 mt-3 p-2 bg-slate-50 rounded-lg">
                      <div className="w-6 h-6 rounded bg-indigo-600/10 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {doc.userId?.name?.[0]}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 truncate">{doc.userId?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">{formatDate(doc.createdAt)}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <a href={`/api/documents/${doc._id}`} download className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                      <FileUp className="w-4 h-4 rotate-180" />
                    </a>
                    <button onClick={() => handleDelete(doc._id)} className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">No documents found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
