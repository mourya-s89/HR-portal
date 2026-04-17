"use client";
import { useSession } from "next-auth/react";
import { Bell, Search, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useLayout } from "@/context/LayoutContext";

export default function TopBar({ title }: { title?: string }) {
  const { data: session } = useSession();
  const { toggleSidebar } = useLayout();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  // Only start the clock after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    if (!time) return "Welcome";
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-xl hover:bg-slate-100 lg:hidden text-slate-500 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          {title && <h1 className="text-lg font-bold text-slate-800 tracking-tight hidden xs:block">{title}</h1>}
          {!title && (
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {greeting()}, {session?.user?.name?.split(" ")[0]} 👋
              </p>
              <p className="text-xs text-slate-500">
                {mounted && time
                  ? time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                  : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Clock — only render after mount to avoid hydration mismatch */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-slate-500 border border-slate-100">
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium" suppressHydrationWarning>
            {mounted && time
              ? time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "--:--:--"}
          </span>
        </div>

        <button className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-2 ml-2 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-none">{(session?.user as any)?.role}</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">{(session?.user as any)?.employeeId || "NO-ID"}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-indigo-500/20">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
