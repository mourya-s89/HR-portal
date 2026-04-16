"use client";
import { useState, useEffect } from "react";
import { Receipt, Download, Calendar } from "lucide-react";
import { formatDate, bytesToSize, getMonthName, cn } from "@/lib/utils";

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/documents?category=Payslip").then(r => r.json()).then(d => {
      if (d.documents) setPayslips(d.documents);
    });
  }, []);

  const grouped: Record<number, any[]> = {};
  payslips.forEach(p => {
    const y = p.year || new Date(p.createdAt).getFullYear();
    if (!grouped[y]) grouped[y] = [];
    grouped[y].push(p);
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Payslips</h1>
        <p className="text-muted-foreground mt-1">Download your monthly salary slips. Uploaded by HR.</p>
      </div>

      {Object.entries(grouped).sort(([a],[b]) => +b - +a).map(([year, slips]) => (
        <div key={year} className="glass-card rounded-3xl p-8 border border-white/5 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-400" /> {year}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slips.sort((a,b) => (b.month||0)-(a.month||0)).map((slip, i) => (
              <div key={i} className="p-5 rounded-2xl bg-muted/30 border border-white/5 hover:bg-muted/50 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-bold">{slip.month ? getMonthName(slip.month) : ""} {year}</p>
                    <p className="text-xs text-muted-foreground">{slip.name}</p>
                    <p className="text-xs text-muted-foreground">{bytesToSize(slip.fileSize)}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
                <a href={`/api/documents/${slip._id}`} target="_blank" rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 text-sm font-medium hover:bg-indigo-500/20 transition-colors">
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
      {payslips.length === 0 && (
        <div className="glass-card rounded-3xl p-16 border border-white/5 flex flex-col items-center text-center text-muted-foreground space-y-4">
          <Receipt className="w-12 h-12 opacity-30" />
          <p>No payslips available yet. HR will upload your monthly payslips here.</p>
        </div>
      )}
    </div>
  );
}
