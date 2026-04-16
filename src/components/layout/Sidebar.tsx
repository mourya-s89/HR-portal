"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Clock, Calendar, FileText, Megaphone,
  TrendingUp, MessageSquare, UserX, FolderOpen, Receipt,
  BookOpen, CalendarDays, ClipboardList, Users, LogOut,
  ChevronLeft, ChevronRight, Building2, Settings,
} from "lucide-react";
import { useState } from "react";

const employeeNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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

const adminNav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
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

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const role = (session?.user as any)?.role;
  const isAdmin = role === "Admin" || role === "HR";
  const navItems = isAdmin ? adminNav : employeeNav;

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary shrink-0">
          <Building2 className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sidebar-foreground font-semibold text-sm leading-tight truncate">HR Portal</p>
            <p className="text-sidebar-foreground/50 text-xs">{role}</p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-sidebar border border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3 space-y-1 shrink-0">
        {!collapsed && session?.user && (
          <div className="px-2 pb-2">
            <p className="text-sidebar-foreground text-sm font-medium truncate">{session.user.name}</p>
            <p className="text-sidebar-foreground/50 text-xs truncate">{session.user.email}</p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
