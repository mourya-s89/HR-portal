"use client";
import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, Clock, AlertTriangle, TrendingUp, ChevronRight, CheckCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import Link from "next/link";

function StatCard({ title, value, icon: Icon, color, sub }: any) {
  return (
    <div className={cn("glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all")}>
      <div className={cn("absolute top-0 right-0 w-24 h-24 blur-[60px] rounded-full opacity-15", color)}/>
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-2">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={cn("p-3 rounded-2xl", color?.replace("bg-","text-").replace("/20",""))}>
          <Icon className="w-6 h-6"/>
        </div>
      </div>
    </div>
  );
}

const PIE_COLORS = ["#6366f1","#f97316","#06b6d4","#a855f7"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats").then(r=>r.json()).then(setStats);
    fetch("/api/leaves").then(r=>r.json()).then(d=>{ if(d.leaves) setLeaves(d.leaves.filter((l:any)=>l.status==="Pending")); });
  }, []);

  const pieData = [
    { name: "Present", value: stats.presentToday || 0 },
    { name: "On Leave", value: stats.onLeave || 0 },
    { name: "Late", value: stats.lateToday || 0 },
    { name: "Absent", value: Math.max(0,(stats.totalEmployees||0)-(stats.presentToday||0)-(stats.onLeave||0)) },
  ].filter(d => d.value > 0);

  const handleLeaveAction = async (id: string, action: string) => {
    await fetch(`/api/leaves/${id}`, { method: "PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action }) });
    setLeaves(prev => prev.filter(l => l._id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-indigo-900/40 to-slate-900 p-8 border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[30%] h-[200%] bg-indigo-600/10 blur-[80px]"/>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-2">Real-time workforce overview and management controls.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value={stats.totalEmployees ?? "—"} icon={Users} color="bg-indigo-500/20" sub="Active staff" />
        <StatCard title="Present Today" value={stats.presentToday ?? "—"} icon={UserCheck} color="bg-emerald-500/20" sub="Checked in" />
        <StatCard title="On Leave" value={stats.onLeave ?? "—"} icon={UserX} color="bg-blue-500/20" sub="Today" />
        <StatCard title="Late Arrivals" value={stats.lateToday ?? "—"} icon={Clock} color="bg-orange-500/20" sub="With half-day LOP" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leave Approvals */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-400"/> Pending Leave Approvals</h2>
            <Link href="/admin/leaves" className="text-xs text-indigo-400 font-medium flex items-center gap-1 hover:text-indigo-300">View All <ChevronRight className="w-3 h-3"/></Link>
          </div>
          <div className="space-y-3">
            {leaves.slice(0,5).map((leave, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-white/5">
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-semibold">{leave.userId?.name || "Employee"}</p>
                  <p className="text-xs text-muted-foreground">{leave.type} · {leave.days} day{leave.days>1?"s":""} · {leave.reason}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleLeaveAction(leave._id, "approve")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
                    <CheckCheck className="w-3 h-3"/> Approve
                  </button>
                  <button onClick={() => handleLeaveAction(leave._id, "reject")}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {leaves.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No pending leave requests. All clear! ✅</p>}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 space-y-4">
          <h2 className="text-lg font-bold">Today&apos;s Attendance</h2>
          {pieData.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v,n) => [`${v} employees`,n]} contentStyle={{background:"rgba(15,15,25,0.9)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,fontSize:11}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {pieData.map((d,i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full" style={{background:PIE_COLORS[i%PIE_COLORS.length]}}/>
                      {d.name}
                    </span>
                    <span className="font-bold">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-12">No attendance data for today yet.</p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label:"Employees", href:"/admin/employees", icon:Users },
          { label:"Attendance", href:"/admin/attendance", icon:Clock },
          { label:"Leaves", href:"/admin/leaves", icon:UserX },
          { label:"Performance", href:"/admin/performance", icon:TrendingUp },
          { label:"Documents", href:"/admin/documents", icon:CheckCheck },
          { label:"SOPs", href:"/admin/sop", icon:TrendingUp },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="glass-card p-5 rounded-3xl border border-white/5 hover:border-white/15 transition-all hover:scale-[1.02] flex flex-col items-center gap-3 text-center group">
            <div className="p-3 rounded-2xl bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
              <item.icon className="w-5 h-5 text-indigo-400"/>
            </div>
            <p className="text-xs font-semibold">{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
