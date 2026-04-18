"use client";
import { useState, useEffect } from "react";
import { 
  Plus, Search, Calendar as CalendarIcon, 
  Trash2, Loader2, X, Clock, 
  MapPin, Gift, Briefcase, AlertOctagon,
  ChevronLeft, ChevronRight, LayoutGrid, List
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

export default function CalendarAdminPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<"grid" | "list">("list");

  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0],
    type: "Holiday",
    description: "",
    isPublic: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/calendar");
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (e) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to create event");
      toast.success("Event added to calendar");
      setShowForm(false);
      setForm({ title: "", date: new Date().toISOString().split('T')[0], type: "Holiday", description: "", isPublic: true });
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`/api/admin/calendar?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Event removed");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const typeStyles: any = {
    "Holiday": "bg-rose-50 text-rose-600 border-rose-100",
    "Meeting": "bg-indigo-50 text-indigo-600 border-indigo-100",
    "Event": "bg-emerald-50 text-emerald-600 border-emerald-100",
    "Deadline": "bg-amber-50 text-amber-600 border-amber-100",
    "Leave": "bg-slate-50 text-slate-600 border-slate-100",
  };

  const getEventIcon = (type: string) => {
    switch(type) {
      case "Holiday": return <Gift className="w-4 h-4" />;
      case "Meeting": return <Briefcase className="w-4 h-4" />;
      case "Deadline": return <AlertOctagon className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Annual Timeline</h1>
          <p className="text-muted-foreground mt-1 font-medium">Coordinate organization-wide events and holiday schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card rounded-[32px] p-8 border border-white bg-white/80 backdrop-blur-xl animate-fade-in-up shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-indigo-500" />
              Schedule New Occasion
            </h2>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Event Title</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g., Annual Strategy Summit"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" />
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Date</label>
                  <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-center" />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Category</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold">
                     <option value="Holiday">Holiday</option>
                     <option value="Event">Event</option>
                     <option value="Meeting">Meeting</option>
                     <option value="Deadline">Deadline</option>
                  </select>
               </div>

               <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Brief Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Location, agenda, or dress code..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium" />
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
               <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95">Discard</button>
               <button type="submit" disabled={submitting} className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  Save Timeline Event
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="glass-card h-48 rounded-[32px] animate-pulse bg-white border border-slate-100" />
            ))
         ) : events.length > 0 ? (
           events.map((event) => (
             <div key={event._id} className="glass-card group p-8 rounded-[40px] border border-slate-100 bg-white hover:border-indigo-100 transition-all shadow-sm hover:shadow-xl relative flex flex-col group overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center">
                         <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                         <span className="text-3xl font-black text-slate-800 leading-none">{new Date(event.date).getDate()}</span>
                      </div>
                      <div className="w-px h-10 bg-slate-100" />
                      <div>
                         <h3 className="font-extrabold text-slate-800 text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                         <div className={cn("px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest w-fit flex items-center gap-1.5", typeStyles[event.type])}>
                            {getEventIcon(event.type)}
                            {event.type}
                         </div>
                      </div>
                   </div>
                </div>

                <p className="text-sm text-slate-500 mt-2 line-clamp-2 font-medium leading-relaxed">
                   {event.description || "No additional details provided for this event."}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{formatDate(event.date)}</span>
                   </div>
                   <button 
                    onClick={() => deleteEvent(event._id)}
                    className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
                   >
                      <Trash2 className="w-4.5 h-4.5" />
                   </button>
                </div>
             </div>
           ))
         ) : (
           <div className="col-span-full py-40 text-center bg-slate-50/50 rounded-[60px] border-2 border-dashed border-slate-200 flex flex-col items-center">
              <CalendarIcon className="w-16 h-16 text-slate-200 mb-6" />
              <h3 className="text-slate-700 text-xl font-black">Calendar Clear</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-medium">No company milestones or holidays are currently scheduled.</p>
           </div>
         )}
      </div>
    </div>
  );
}
