"use client";
import { useState, useEffect, useRef } from "react";
import { FolderOpen, Upload, Download, Trash2, FileText, File, Share2, Users, Shield, User, X, Check } from "lucide-react";
import { toast } from "sonner";
import { formatDate, bytesToSize, cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const CATEGORIES = ["All","Personal","Certificate","Contract","Policy","Other"];
const CAT_COLORS: Record<string,string> = { 
  Personal: "bg-blue-500/10 text-blue-400", 
  Certificate: "bg-emerald-500/10 text-emerald-400", 
  Contract: "bg-orange-500/10 text-orange-400", 
  Payslip: "bg-violet-500/10 text-violet-400", 
  Policy: "bg-[#1E6DEB]/10 text-indigo-400", 
  Other: "bg-muted/50 text-muted-foreground" 
};

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [docs, setDocs] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadMeta, setUploadMeta] = useState({ 
    name: "", 
    category: "Personal", 
    shareMode: "Personal", 
    sharedWith: [] as string[] 
  });
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [showUserPicker, setShowUserPicker] = useState(false);

  const fetchDocs = async () => {
    const res = await fetch("/api/documents");
    const data = await res.json();
    if (data.documents) setDocs(data.documents);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users/public");
    const data = await res.json();
    if (data.users) setAvailableUsers(data.users);
  };

  useEffect(() => { 
    fetchDocs(); 
    fetchUsers();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileRef.current?.files?.[0]) { toast.error("Select a file first"); return; }
    setUploading(true);
    
    const fd = new FormData();
    fd.append("file", fileRef.current.files[0]);
    fd.append("name", uploadMeta.name || fileRef.current.files[0].name);
    fd.append("category", uploadMeta.category);
    fd.append("shareMode", uploadMeta.shareMode);
    fd.append("sharedWith", uploadMeta.sharedWith.join(','));

    try {
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Document uploaded and shared!");
      fetchDocs();
      setUploadMeta({ name: "", category: "Personal", shareMode: "Personal", sharedWith: [] });
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

  const toggleUserSelection = (userId: string) => {
    setUploadMeta(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.includes(userId) 
        ? prev.sharedWith.filter(id => id !== userId) 
        : [...prev.sharedWith, userId]
    }));
  };

  const filtered = filter === "All" ? docs : docs.filter(d => d.category === filter);

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">Documents Center</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage your files and share with relevant teams securely.</p>
        </div>
      </div>

      {/* Enhanced Upload form */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16" />
        
        <h2 className="text-lg font-extrabold text-[#111827] mb-8 flex items-center gap-3">
           <div className="p-2.5 rounded-[14px] bg-indigo-50 text-indigo-600"><Upload className="w-5 h-5" /></div>
           Upload & Share Document
        </h2>

        <form onSubmit={handleUpload} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Document Name</label>
              <input 
                value={uploadMeta.name} 
                onChange={e => setUploadMeta({...uploadMeta, name: e.target.value})} 
                placeholder="e.g. Identity Proof"
                className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
              <select 
                value={uploadMeta.category} 
                onChange={e => setUploadMeta({...uploadMeta, category: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
              >
                {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">File Source</label>
              <input 
                ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-4 py-2.5 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-indigo-600 file:text-white hover:file:opacity-90" 
              />
            </div>
          </div>

          <div className="p-6 bg-slate-50/50 rounded-[24px] border border-slate-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[14px] font-extrabold text-[#111827] flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-500" />
                  Who can access this?
                </p>
                <p className="text-[11px] font-bold text-slate-400">Select sharing visibility for this document</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: "Personal", label: "Only Me", icon: User },
                  { id: "HR", label: "HR Team", icon: Shield },
                  { id: "Team", label: "My Team", icon: Users },
                  { id: "Specific", label: "Select People", icon: Share2 }
                ].map(mode => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setUploadMeta({...uploadMeta, shareMode: mode.id});
                      if (mode.id === "Specific") setShowUserPicker(true);
                    }}
                    className={cn(
                      "px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border",
                      uploadMeta.shareMode === mode.id 
                        ? "bg-slate-900 text-white border-transparent shadow-lg scale-105" 
                        : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                    )}
                  >
                    <mode.icon className="w-3.5 h-3.5" />
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selection indicators */}
            {uploadMeta.shareMode === "Specific" && uploadMeta.sharedWith.length > 0 && (
              <div className="flex flex-wrap gap-2 animate-fade-in pt-2">
                {uploadMeta.sharedWith.map(id => {
                  const user = availableUsers.find(u => u._id === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-bold">
                      {user?.name || "User"}
                      <button type="button" onClick={() => toggleUserSelection(id)}><X className="w-3 h-3 hover:text-rose-500" /></button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full md:w-fit px-12 py-4 rounded-full bg-slate-900 text-white font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            {uploading ? "Uploading & Sharing..." : "Confirm & Upload"}
          </button>
        </form>
      </div>

      {/* Docs List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-indigo-500" />
              File Repository
           </h2>
           <div className="flex gap-2">
              {CATEGORIES.map(c => (
                <button 
                  key={c} onClick={() => setFilter(c)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    filter === c ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {c}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doc, i) => {
            const isOwner = doc.userId?._id === session?.user?.id || doc.userId === session?.user?.id;
            return (
              <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                <div className="flex items-start justify-between gap-4 mb-6">
                   <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-[18px] bg-slate-50 text-indigo-500 ring-1 ring-slate-100">
                         <FileText className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                         <p className="text-[14px] font-extrabold text-[#111827] truncate leading-tight mb-1">{doc.name}</p>
                         <p className="text-[10px] font-black text-slate-400 flex items-center gap-2">
                           {bytesToSize(doc.fileSize)}
                           <span className="w-1 h-1 rounded-full bg-slate-200" />
                           {doc.category}
                         </p>
                      </div>
                   </div>
                   {!isOwner && (
                     <div className="px-2 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-amber-100">Shared with you</div>
                   )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400">Uploaded {formatDate(doc.createdAt)}</p>
                      <p className="text-[10px] font-extrabold text-slate-600 truncate max-w-[150px]">By {doc.uploadedBy?.name || "System"}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <a 
                        href={`/api/documents/${doc._id}`} target="_blank" rel="noopener noreferrer"
                        className="p-3 rounded-[14px] bg-slate-50 text-slate-400 hover:bg-[#111827] hover:text-white transition-all shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {isOwner && (
                        <button 
                          onClick={() => handleDelete(doc._id)}
                          className="p-3 rounded-[14px] bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                   </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-[24px] bg-white shadow-sm flex items-center justify-center mb-6">
                  <File className="w-8 h-8 text-slate-200" />
               </div>
               <p className="text-slate-900 font-extrabold">Repository Emtpy</p>
               <p className="text-slate-400 text-xs mt-2 max-w-[200px]">No documents available in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* User Picker Modal */}
      {showUserPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUserPicker(false)} />
          <div className="bg-white rounded-[40px] w-full max-w-xl p-8 shadow-2xl relative animate-fade-in-up border border-slate-100">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-extrabold text-[#111827]">Select Recipients</h3>
               <button onClick={() => setShowUserPicker(false)} className="p-3 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-slate-900">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
               {availableUsers.filter(u => u._id !== session?.user?.id).map(user => (
                 <button 
                   key={user._id}
                   type="button"
                   onClick={() => toggleUserSelection(user._id)}
                   className={cn(
                     "w-full flex items-center justify-between p-4 rounded-[24px] transition-all border group",
                     uploadMeta.sharedWith.includes(user._id) 
                       ? "bg-indigo-50 border-indigo-200 shadow-sm" 
                       : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50"
                   )}
                 >
                   <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm",
                        uploadMeta.sharedWith.includes(user._id) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        {user.name[0]}
                      </div>
                      <div className="text-left">
                        <p className={cn("text-sm font-extrabold", uploadMeta.sharedWith.includes(user._id) ? "text-indigo-900" : "text-slate-800")}>{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role} · {user.department}</p>
                      </div>
                   </div>
                   {uploadMeta.sharedWith.includes(user._id) ? (
                     <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5" />
                     </div>
                   ) : (
                     <div className="w-6 h-6 rounded-full border-2 border-slate-100 group-hover:border-indigo-200" />
                   )}
                 </button>
               ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
               <button 
                 onClick={() => setShowUserPicker(false)}
                 className="w-full py-4 rounded-full bg-[#111827] text-white font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-xl"
               >
                 Confirm {uploadMeta.sharedWith.length} Selection(s)
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
