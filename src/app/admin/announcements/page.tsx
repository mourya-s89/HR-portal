"use client";
import { useState, useEffect } from "react";
import { Plus, Megaphone, Trash2, Calendar, Layout, User, Filter, Loader2, Edit3, X } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

export default function AnnouncementsAdminPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "General",
    targetRoles: ["Employee", "HR", "Admin"],
    expiresAt: "",
    pinned: false
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      if (data.announcements) setAnnouncements(data.announcements);
    } catch (e) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = "/api/announcements";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Operation failed");
      }
      
      toast.success(editingId ? "Announcement updated!" : "Announcement posted!");
      handleCloseForm();
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ann: any) => {
    setForm({
      title: ann.title,
      content: ann.content,
      priority: ann.priority,
      targetRoles: ann.targetRoles,
      expiresAt: ann.expiresAt ? new Date(ann.expiresAt).toISOString().split('T')[0] : "",
      pinned: ann.pinned || false
    });
    setEditingId(ann._id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ title: "", content: "", priority: "General", targetRoles: ["Employee", "HR", "Admin"], expiresAt: "", pinned: false });
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement permanently?")) return;
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete announcement");
      toast.success("Announcement removed");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const PRIORITY_COLORS: any = {
    "General": "bg-emerald-500/10 text-emerald-500",
    "Important": "bg-amber-500/10 text-amber-500",
    "Urgent": "bg-rose-500/10 text-rose-500"
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Announcements</h1>
          <p className="text-muted-foreground mt-1">Broadcast important news and updates to the entire team.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-600/20 hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Announcement
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card rounded-3xl p-8 border border-white/5 animate-fade-in-up relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Megaphone className="w-5 h-5 text-indigo-500" />
              {editingId ? "Edit Announcement" : "Create New Announcement"}
            </h2>
            <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Title</label>
                <input 
                  required
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g., Annual Office Retreat 2024"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Message Content</label>
                <textarea 
                  required
                  rows={4}
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                  placeholder="Share details about the announcement..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Priority Level</label>
                <select 
                  value={form.priority}
                  onChange={e => setForm({...form, priority: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="General">General</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Expiry Date (Optional)</label>
                <input 
                  type="date"
                  value={form.expiresAt}
                  onChange={e => setForm({...form, expiresAt: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-sm text-slate-700 block">Pin Announcement</label>
                  <p className="text-xs text-slate-500">Pinned announcements stay at the top of the feed.</p>
                </div>
                <input 
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e => setForm({...form, pinned: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={handleCloseForm}
                className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {submitting ? "Processing..." : editingId ? "Update Announcement" : "Post Announcement"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl animate-pulse border border-white/5 h-48 bg-white" />
          ))
        ) : announcements.length > 0 ? (
          announcements.map((ann) => (
            <div key={ann._id} className="glass-card p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all group relative overflow-hidden bg-white">
              {ann.pinned && (
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              )}
              
              <div className="flex items-start justify-between mb-4">
                <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider", PRIORITY_COLORS[ann.priority])}>
                  {ann.priority}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleEdit(ann)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteAnnouncement(ann._id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors leading-tight">
                {ann.title}
              </h3>
              
              <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                {ann.content}
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(ann.createdAt)}
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  By {ann.postedBy?.name?.split(' ')[0] || "Admin"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
            <Megaphone className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-slate-500 font-bold">No announcements yet</h3>
            <p className="text-slate-400 text-sm mt-1">Start by creating your first company announcement.</p>
          </div>
        )}
      </div>
    </div>
  );
}
