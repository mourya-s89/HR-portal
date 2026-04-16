"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold gradient-text">Work Updates</h1>
      </div>
      <div className="glass-card rounded-3xl p-16 border border-white/5 flex flex-col items-center text-muted-foreground space-y-4">
        <p className="text-lg">Admin Work Updates module</p>
        <p className="text-sm">This section uses the same API routes as employee views but with full admin access.</p>
      </div>
    </div>
  );
}
