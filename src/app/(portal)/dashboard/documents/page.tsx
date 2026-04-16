"use client";
import { useState, useEffect, useRef } from "react";
import { FolderOpen, Upload, Download, Trash2, FileText, File } from "lucide-react";
import { toast } from "sonner";
import { formatDate, bytesToSize, cn } from "@/lib/utils";

const CATEGORIES = ["All","Personal","Certificate","Contract","Policy","Other"];
const CAT_COLORS: Record<string,string> = { Personal:"bg-blue-500/10 text-blue-400", Certificate:"bg-emerald-500/10 text-emerald-400", Contract:"bg-orange-500/10 text-orange-400", Payslip:"bg-violet-500/10 text-violet-400", Policy:"bg-indigo-500/10 text-indigo-400", Other:"bg-muted/50 text-muted-foreground" };

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadMeta, setUploadMeta] = useState({ name: "", category: "Personal" });

  const fetchDocs = async () => {
    const res = await fetch("/api/documents");
    const data = await res.json();
    if (data.documents) setDocs(data.documents);
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileRef.current?.files?.[0]) { toast.error("Select a file first"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", fileRef.current.files[0]);
    fd.append("name", uploadMeta.name || fileRef.current.files[0].name);
    fd.append("category", uploadMeta.category);
    try {
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Document uploaded successfully!");
      fetchDocs();
      setUploadMeta({ name: "", category: "Personal" });
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    toast.success("Document deleted");
    fetchDocs();
  };

  const filtered = filter === "All" ? docs : docs.filter(d => d.category === filter);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Documents</h1>
        <p className="text-muted-foreground mt-1">Upload and manage your personal and official documents securely.</p>
      </div>

      {/* Upload card */}
      <div className="glass-card rounded-3xl p-8 border border-white/5">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Upload className="w-5 h-5 text-indigo-400" /> Upload Document</h2>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2 md:col-span-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Document Name</label>
            <input value={uploadMeta.name} onChange={e => setUploadMeta({...uploadMeta, name: e.target.value})} placeholder="e.g. Aadhar Card"
              className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
            <select value={uploadMeta.category} onChange={e => setUploadMeta({...uploadMeta, category: e.target.value})}
              className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              {["Personal","Certificate","Contract","Other"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">File</label>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full bg-muted/30 border border-white/10 rounded-2xl px-3 py-2.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30" />
            </div>
            <button type="submit" disabled={uploading}
              className="mt-7 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap">
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={cn("px-4 py-2 rounded-2xl text-sm font-medium transition-all",
              filter === c ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:bg-muted/60")}>
            {c}
          </button>
        ))}
      </div>

      {/* Docs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc, i) => (
          <div key={i} className="glass-card p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-2xl bg-muted/40 shrink-0">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{bytesToSize(doc.fileSize)}</p>
                </div>
              </div>
              <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0", CAT_COLORS[doc.category] || CAT_COLORS.Other)}>{doc.category}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDate(doc.createdAt)}</span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={`/api/documents/${doc._id}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => handleDelete(doc._id)}
                  className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <File className="w-12 h-12 mb-4 opacity-30" />
            <p>No documents found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
