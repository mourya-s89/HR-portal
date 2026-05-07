"use client";
import { useSession, signOut } from "next-auth/react";
import { Bell, Search, Menu, LogOut, Mail, Shield, IdCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useLayout } from "@/context/LayoutContext";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";

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

  const user = session?.user as any;

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-3 -ml-3 rounded-2xl hover:bg-slate-100 lg:hidden text-slate-500 transition-all active:scale-90"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-6 h-6" />
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

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-3 pl-2 ml-2 border-l border-slate-100 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">{user?.role}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">{user?.employeeId || "NO-ID"}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all group-active:scale-90 overflow-hidden">
                {(session?.user?.image || user?.avatar) ? (
                  <img 
                    src={session?.user?.image || user?.avatar} 
                    alt={session?.user?.name ?? "User"} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  session?.user?.name?.[0]?.toUpperCase() ?? "U"
                )}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-2xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-black text-slate-900">{session?.user?.name}</p>
                  <p className="text-xs font-medium text-slate-400 flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-100" />
            
            <div className="p-1 space-y-1">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-100/50">
                 <Shield className="w-4 h-4 text-indigo-500" />
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Access Level</span>
                    <span className="text-xs font-extrabold text-slate-700">{user?.role}</span>
                 </div>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-100/50">
                 <IdCard className="w-4 h-4 text-emerald-500" />
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Employee ID</span>
                    <span className="text-xs font-extrabold text-slate-700">{user?.employeeId || "Not Assigned"}</span>
                 </div>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="flex items-center gap-3 p-3 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
