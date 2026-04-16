"use client";
import { useState, useEffect } from "react";
import { FileText, Search, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

export default function SOPPage() {
  const [sops, setSops] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [expanded, setExpanded] = useState<string|null>(null);

  useEffect(() => { fetch("/api/sop").then(r=>r.json()).then(d=>{ if(d.sops) setSops(d.sops); }); }, []);

  const departments = ["All", ...Array.from(new Set(sops.map(s => s.department)))];
  const filtered = sops.filter(s =>
    (dept === "All" || s.department === dept) &&
    (!search || s.title.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">SOP Library</h1>
        <p className="text-muted-foreground mt-1">Standard Operating Procedures by department. Your go-to reference guide.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SOPs..."
            className="w-full bg-muted/30 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <select value={dept} onChange={e => setDept(e.target.value)}
          className="bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((sop, i) => (
          <div key={i} className="glass-card rounded-3xl border border-white/5 overflow-hidden">
            <button onClick={() => setExpanded(expanded===sop._id ? null : sop._id)}
              className="w-full flex items-start justify-between gap-4 p-6 text-left hover:bg-muted/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-2xl bg-muted/40 shrink-0 mt-0.5"><FileText className="w-5 h-5 text-violet-400"/></div>
                <div className="space-y-1.5">
                  <p className="font-bold">{sop.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 text-[10px] font-bold uppercase">{sop.department}</span>
                    <span className="px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground text-[10px] font-bold uppercase">{sop.category}</span>
                    <span className="text-xs text-muted-foreground">v{sop.version}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(sop.updatedAt)}</span>
                  </div>
                  {sop.tags?.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Tag className="w-3 h-3 text-muted-foreground"/>
                      {sop.tags.map((t: string) => (
                        <span key={t} className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {expanded===sop._id ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0 mt-1"/> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 mt-1"/>}
            </button>
            {expanded === sop._id && (
              <div className="px-6 pb-6 border-t border-white/5">
                <div className="mt-4 p-5 rounded-2xl bg-muted/20 text-sm leading-relaxed whitespace-pre-wrap font-mono">{sop.content}</div>
                <p className="text-xs text-muted-foreground mt-3">Posted by {sop.postedBy?.name || "HR"}</p>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12 text-sm">No SOPs found{search ? ` for "${search}"` : ""}. HR will add department SOPs here.</p>}
      </div>
    </div>
  );
}
