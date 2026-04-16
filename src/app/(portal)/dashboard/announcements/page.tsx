"use client";
import { useState, useEffect } from "react";
import { Megaphone, Pin, Clock } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

const PRIORITY_STYLE: Record<string,string> = {
  Urgent: "bg-red-500/10 text-red-400 border-red-500/20",
  General: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Event: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/announcements").then(r => r.json()).then(d => {
      if (d.announcements) setAnnouncements(d.announcements);
    });
  }, []);

  const filtered = filter === "All" ? announcements : announcements.filter(a => a.priority === filter);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Announcements</h1>
        <p className="text-muted-foreground mt-1">Stay informed with the latest company news and updates.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["All","Urgent","General","Event"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-4 py-2 rounded-2xl text-sm font-medium transition-all",
              filter === f ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/40 text-muted-foreground hover:bg-muted/60")}>
            {f}
          </button>
        ))}
      </div>

      {/* Pinned */}
      {filtered.filter(a => a.pinned).length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Pin className="w-3 h-3" /> Pinned</p>
          {filtered.filter(a => a.pinned).map((a, i) => (
            <div key={i} className={cn("p-6 rounded-3xl border glass-card", PRIORITY_STYLE[a.priority])}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border", PRIORITY_STYLE[a.priority])}>{a.priority}</span>
                    <Pin className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold">{a.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a.content}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDate(a.createdAt)} · Posted by {a.postedBy?.name || "HR Team"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">All Announcements</p>
        <div className="space-y-3">
          {filtered.filter(a => !a.pinned).map((a, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border", PRIORITY_STYLE[a.priority])}>{a.priority}</span>
                  </div>
                  <h3 className="text-base font-bold group-hover:text-primary transition-colors">{a.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a.content}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />{formatDate(a.createdAt)} · {a.postedBy?.name || "HR Team"}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-12 text-sm">No announcements in this category.</p>}
        </div>
      </div>
    </div>
  );
}
