"use client";
import { useState, useEffect } from "react";
import { 
  Plus, Search, FolderOpen, FileText, 
  Trash2, Download, Eye, Loader2, X,
  Filter, Upload, User, HardDrive, File
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, bytesToSize, cn } from "@/lib/utils";

export default function DocumentCenterAdminPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    userId: "",
    category: "Other",
    file: null as File | null
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/documents");
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);
      if (data.employees) setEmployees(data.employees);
    } catch (e) {
      toast.error("Failed to load documents");
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
      formData.append("category", form.category);
      formData.append("name", form.name || form.file.name);

      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Document uploaded successfully");
      setShowUpload(false);
      setForm({ name: "", userId: "", category: "Other", file: null });
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      const res = await fetch(`/api/admin/documents?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Document removed");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name?.toLowerCase().includes(search.toLowerCase()) ||
    doc.userId?.name?.toLowerCase().includes(search.toLowerCase())
  ).filter(doc => filter === "All" || doc.category === filter);

  const CATEGORIES = ["Personal", "Payslip", "Certificate", "Policy", "Contract", "Other"];

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Document Repository</h1>
          <p className="text-muted-foreground mt-1 font-medium">Securely manage and access employee records and company assets.</p>
        </div>
        {!showUpload && (
          <button 
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Upload className="w-5 h-5" />
            Upload Document
          </button>
        )}
      </div>

      {showUpload && (
        <div className="glass-card rounded-[32px] p-8 border border-white bg-white/80 animate-fade-in-up">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                 <HardDrive className="w-5 h-5 text-indigo-500" />
                 Upload to Secure Cloud
              </h2>
              <button 
                onClick={() => setShowUpload(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
           </div>

           <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Assign to Employee</label>
                    <select 
                      required
                      value={form.userId}
                      onChange={e => setForm({...form, userId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    >
                       <option value="">Select Employee</option>
                       {employees.map(emp => (
                         <option key={emp._id} value={emp._id}>{emp.name}</option>
                       ))}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Category</label>
                    <select 
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    >
                       {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                 </div>
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Document Name / Title</label>
                    <input 
                      type="text"
                      placeholder="e.g., Annual Performance Bonus Letter"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                 </div>
                 <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block mb-2">File Upload</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer relative group">
                       <input 
                         type="file" 
                         required
                         onChange={e => {
                           const file = e.target.files?.[0];
                           if (file) setForm({...form, file, name: form.name || file.name});
                         }}
                         className="absolute inset-0 opacity-0 cursor-pointer" 
                       />
                       <File className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 mb-4 transition-all" />
                       <p className="text-sm font-bold text-slate-600">
                          {form.file ? form.file.name : "Click to browse or drag and drop"}
                       </p>
                       <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">PDF, DOCX, JPG (Max 5MB)</p>
                    </div>
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                 <button type="button" onClick={() => setShowUpload(false)} className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
                 <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                 >
                    {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    Confirm Upload
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* Main View */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by filename or employee..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-[28px] pl-12 pr-6 py-4.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm font-medium"
              />
           </div>
           <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-x-auto">
              {["All", ...CATEGORIES].map(cat => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                 <div key={i} className="glass-card h-56 rounded-[32px] animate-pulse bg-white border border-slate-100" />
              ))
           ) : filteredDocs.length > 0 ? (
             filteredDocs.map((doc) => (
               <div key={doc._id} className="glass-card group p-6 rounded-[32px] border border-slate-100 bg-white hover:border-indigo-100 transition-all shadow-sm hover:shadow-xl relative flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                     <div className="w-12 h-12 rounded-2xl bg-slate-50 text-indigo-500 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <FileText className="w-6 h-6" />
                     </div>
                     <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                        {doc.category}
                     </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-sm mb-1 truncate group-hover:text-indigo-600 transition-colors" title={doc.name}>
                     {doc.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                     <User className="w-3.5 h-3.5 text-slate-300" />
                     <p className="text-[11px] font-bold text-slate-500 truncate">{doc.userId?.name}</p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                     <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bytesToSize(doc.fileSize)}</p>
                        <p className="text-[10px] font-bold text-slate-300 uppercase">{formatDate(doc.createdAt)}</p>
                     </div>
                     <div className="flex gap-1">
                        <a 
                          href={`/api/admin/documents/${doc._id}`} 
                          target="_blank"
                          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                          title="View / Download"
                        >
                           <Eye className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => deleteDocument(doc._id)}
                          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
                          title="Delete"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </div>
             ))
           ) : (
             <div className="col-span-full py-32 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center">
                <FolderOpen className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-slate-600 font-bold">Safe Deposit Box Empty</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-[200px]">Any files you upload to the repository will appear here.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
