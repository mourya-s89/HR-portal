"use client";
import { useState, useEffect } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

const CAT_COLORS: Record<string,string> = { "HR Policy":"bg-indigo-500/10 text-indigo-400", "Code of Conduct":"bg-rose-500/10 text-rose-400", "IT Policy":"bg-cyan-500/10 text-cyan-400", "Leave Policy":"bg-emerald-500/10 text-emerald-400", "Other":"bg-muted/50 text-muted-foreground" };

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => { fetch("/api/policies").then(r=>r.json()).then(d=>{ if(d.policies) setPolicies(d.policies); }); }, []);

  const categories = ["All", ...Array.from(new Set(policies.map(p => p.category)))];
  const filtered = filter === "All" ? policies : policies.filter(p => p.category === filter);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Company Policies</h1>
        <p className="text-muted-foreground mt-1">Official company policies, guidelines and code of conduct.</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={cn("px-4 py-2 rounded-2xl text-sm font-medium transition-all",
              filter===c ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:bg-muted/60")}>
            {c}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((policy, i) => (
          <div key={i} className="glass-card rounded-3xl border border-white/5 overflow-hidden">
            <button onClick={() => setExpanded(expanded === policy._id ? null : policy._id)}
              className="w-full flex items-start justify-between gap-4 p-6 text-left hover:bg-muted/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-2xl bg-muted/40 shrink-0 mt-0.5"><BookOpen className="w-5 h-5 text-indigo-400" /></div>
                <div className="space-y-1.5">
                  <p className="font-bold">{policy.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase", CAT_COLORS[policy.category]||CAT_COLORS.Other)}>{policy.category}</span>
                    <span className="text-xs text-muted-foreground">v{policy.version}</span>
                    <span className="text-xs text-muted-foreground">Effective: {formatDate(policy.effectiveDate)}</span>
                  </div>
                </div>
              </div>
              {expanded===policy._id ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0 mt-1"/> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 mt-1"/>}
            </button>
            {expanded === policy._id && (
              <div className="px-6 pb-6 border-t border-white/5">
                <div className="mt-4 p-5 rounded-2xl bg-muted/20 text-sm leading-relaxed whitespace-pre-wrap">{policy.content}</div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12 text-sm">No policies found.</p>}
      </div>
    </div>
  );
}
