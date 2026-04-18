"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import React, { useCallback, useMemo } from "react";
import {
  LayoutDashboard, Clock, Calendar, FileText, Megaphone,
  TrendingUp, MessageSquare, UserX, FolderOpen, Receipt,
  BookOpen, CalendarDays, ClipboardList, Users, LogOut,
  ChevronLeft, ChevronRight, Building2, X
} from "lucide-react";
import { useLayout } from "@/context/LayoutContext";

const adminNav = [
  { label: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/admin/employees", icon: Users },
  { label: "Attendance", href: "/admin/attendance", icon: Clock },
  { label: "Leave Approvals", href: "/admin/leaves", icon: Calendar },
  { label: "Work Updates", href: "/admin/work-updates", icon: ClipboardList },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Performance", href: "/admin/performance", icon: TrendingUp },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { label: "Exit Interviews", href: "/admin/exit-interviews", icon: UserX },
  { label: "Documents", href: "/admin/documents", icon: FolderOpen },
  { label: "Payslips", href: "/admin/payslips", icon: Receipt },
  { label: "Policies", href: "/admin/policies", icon: BookOpen },
  { label: "Calendar", href: "/admin/calendar", icon: CalendarDays },
  { label: "SOPs", href: "/admin/sop", icon: FileText },
];

const employeeNav = [
  { label: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/dashboard/attendance", icon: Clock },
  { label: "My Leaves", href: "/dashboard/leaves", icon: Calendar },
  { label: "Work Updates", href: "/dashboard/work-updates", icon: ClipboardList },
  { label: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
  { label: "Performance", href: "/dashboard/performance", icon: TrendingUp },
  { label: "Feedback", href: "/dashboard/feedback", icon: MessageSquare },
  { label: "Exit Interview", href: "/dashboard/exit-interview", icon: UserX },
  { label: "Documents", href: "/dashboard/documents", icon: FolderOpen },
  { label: "Payslips", href: "/dashboard/payslips", icon: Receipt },
  { label: "Policies", href: "/dashboard/policies", icon: BookOpen },
  { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "SOPs", href: "/dashboard/sop", icon: FileText },
];

// Memoized Nav Item for zero-lag hovering and rendering
const NavItem = React.memo(({ item, isActive, isCollapsed, isSidebarOpen, onClick }: any) => (
  <Link
    href={item.href}
    prefetch={false} // Disable prefetching to keep CPU free during navigation
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-bold transition-[background-color,color,box-shadow,transform] duration-150 group relative",
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
        : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    )}
    title={isCollapsed && !isSidebarOpen ? item.label : undefined}
  >
    <item.icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", isActive && "scale-110 text-white")} />
    {(!isCollapsed || isSidebarOpen) && <span className="truncate">{item.label}</span>}
    {isActive && !isCollapsed && !isSidebarOpen && (
       <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
    )}
  </Link>
));

NavItem.displayName = "NavItem";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isSidebarOpen, closeSidebar, isCollapsed, setCollapsed } = useLayout();
  
  const role = (session?.user as any)?.role;
  const navigation = role === "Admin" || role === "HR" ? adminNav : employeeNav;

  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  }, [closeSidebar]);

  return (
    <>
      {/* Mobile Backdrop - Removed backdrop-blur for performance, using high-perf semi-transparent overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-[90] bg-slate-900/60 lg:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeSidebar}
      />

      <aside
        style={{ willChange: "transform, width" }}
        className={cn(
          "fixed inset-y-0 left-0 z-[100] flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:static lg:transition-[width] lg:translate-x-0",
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          "w-72 md:w-80 lg:w-auto" // Balanced mobile width
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary shrink-0 transition-transform hover:rotate-12">
              <Building2 className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            {(!isCollapsed || isSidebarOpen) && (
              <div className="overflow-hidden">
                <p className="text-sidebar-foreground font-black text-sm tracking-tight truncate uppercase italic leading-none">HR Portal</p>
                <p className="text-sidebar-foreground/50 text-[9px] font-bold uppercase tracking-widest mt-1">{role || "Employee"}</p>
              </div>
            )}
          </div>
          <button onClick={closeSidebar} className="p-2 lg:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground">
             <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Toggle button */}
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 z-10 hidden lg:flex items-center justify-center w-6 h-6 rounded-full bg-sidebar border border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-foreground transition-all hover:scale-110 shadow-sm"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-2.5 space-y-1 custom-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <NavItem 
                key={item.href}
                item={item}
                isActive={isActive}
                isCollapsed={isCollapsed}
                isSidebarOpen={isSidebarOpen}
                onClick={handleLinkClick}
              />
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-sidebar-border p-4 space-y-3 shrink-0 bg-sidebar-accent/30">
          {(!isCollapsed || isSidebarOpen) && session?.user && (
            <div className="px-1">
              <p className="text-sidebar-foreground text-[11px] font-black truncate tracking-wide">{session.user.name}</p>
              <p className="text-sidebar-foreground/40 text-[9px] truncate uppercase font-bold tracking-widest">{session.user.email}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[11px] font-bold text-sidebar-foreground/50 bg-sidebar-accent/50 hover:bg-rose-500 hover:text-white transition-[background-color,color] duration-150 ring-1 ring-sidebar-border/50"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isSidebarOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
