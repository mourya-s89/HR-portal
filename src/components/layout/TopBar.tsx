"use client";
import { useSession } from "next-auth/react";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function TopBar({ title }: { title?: string }) {
  const { data: session } = useSession();
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  // Only start the clock after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const greeting = () => {
    if (!time) return "Welcome";
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
      <div>
        {title && <h1 className="text-lg font-semibold text-foreground">{title}</h1>}
        {!title && (
          <div>
            <p className="text-sm font-semibold text-foreground">
              {greeting()}, {session?.user?.name?.split(" ")[0]} 👋
            </p>
            <p className="text-xs text-muted-foreground">
              {mounted && time
                ? time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                : ""}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Clock — only render after mount to avoid hydration mismatch */}
        <div className="hidden md:flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2 text-sm text-muted-foreground">
          <Search className="w-4 h-4" />
          <span className="text-xs" suppressHydrationWarning>
            {mounted && time
              ? time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "--:--:--"}
          </span>
        </div>

        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
        </div>
      </div>
    </header>
  );
}

