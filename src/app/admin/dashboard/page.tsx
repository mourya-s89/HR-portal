"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Users, UserCheck, UserX, Clock, AlertTriangle, 
  TrendingUp, ChevronRight, CheckCheck, X,
  ArrowUpRight, Building2, Calendar, Video
} from "lucide-react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Sparkline SVG component for KPI cards
function Sparkline({ color }: { color: string }) {
  return (
    <svg className="absolute bottom-0 left-0 w-full h-12 opacity-20 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 30">
      <path d="M0,30 Q20,10 40,20 T70,5 T100,20 L100,30 L0,30 Z" fill={color} />
      <path d="M0,30 Q20,10 40,20 T70,5 T100,20" fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function StatCard({ title, value, subValue, icon: Icon, trend, color, hexColor }: any) {
  return (
    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[24px] border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 relative overflow-hidden group">
      <div className={cn("absolute -top-10 -right-10 w-32 h-32 blur-[50px] rounded-full opacity-20 transition-opacity group-hover:opacity-40", color.replace("text-", "bg-"))} />
      
      <Sparkline color={hexColor} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
          {subValue && <p className="text-[11px] text-slate-400 font-medium">{subValue}</p>}
          {trend && (
             <div className="flex items-center gap-1 mt-3 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full w-fit tracking-wide">
                <ArrowUpRight className="w-3 h-3" />
                {trend}
             </div>
          )}
        </div>
        <div className={cn("p-3.5 rounded-[18px] bg-white shadow-sm ring-1 ring-slate-100", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

const PIE_COLORS = ["#6366f1","#f97316","#06b6d4","#a855f7"];

export default function AdminDashboard() {
  const { data: session } = useSession();
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Top Hero Section */}
      <div className="relative rounded-[32px] bg-white p-8 md:p-12 border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400 via-purple-300 to-cyan-300 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-sky-300 to-indigo-200 blur-[80px] rounded-full translate-y-1/3 -translate-x-1/4" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              {greeting}, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Administration Dashboard</span>
            </h1>
            <p className="text-slate-600 font-semibold md:text-base flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time workforce overview and management controls.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
             <div className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Size</p>
                <p className="text-2xl font-black text-slate-800">{stats.totalEmployees || 0}</p>
             </div>
             <div className="px-5 py-3 rounded-2xl bg-indigo-600 border border-indigo-500 shadow-lg shadow-indigo-200">
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Active Today</p>
                <p className="text-2xl font-black text-white">{stats.presentToday || 0}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Our Workforce Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
             <Users className="w-6 h-6 text-indigo-500" />
             Our Workforce
          </h2>
          <Link href="/admin/employees" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-all">
             View Directory
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Admins", count: stats.adminCount || 0, role: "Admin", color: "from-rose-500 to-red-600", icon: "🛡️" },
            { label: "HR Managers", count: stats.hrCount || 0, role: "HR", color: "from-violet-500 to-purple-600", icon: "⚖️" },
            { label: "Staff Employees", count: stats.employeeCount || 0, role: "Employee", color: "from-indigo-500 to-blue-600", icon: "👥" },
          ].map((item, idx) => (
            <Link 
              key={idx} 
              href={`/admin/employees?role=${item.role}`}
              className="group relative overflow-hidden bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
            >
              <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform", item.color)} />
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-4xl font-black text-slate-900">{item.count}</p>
                  <p className="text-[10px] font-bold text-indigo-500 mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                    See Details <span>→</span>
                  </p>
                </div>
                <div className="text-4xl">{item.icon}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value={stats.totalEmployees ?? "—"} subValue="Active members" icon={Users} trend="+2 New" color="text-indigo-600" hexColor="#6366f1" />
        <StatCard title="Present Today" value={stats.presentToday ?? "—"} subValue="Checked in" icon={UserCheck} trend={`${((stats.presentToday/stats.totalEmployees)*100).toFixed(0)}% Rate`} color="text-emerald-600" hexColor="#10b981" />
        <StatCard title="On Leave" value={stats.onLeave ?? "—"} subValue="Out of office" icon={UserX} color="text-blue-500" hexColor="#3b82f6" />
        <StatCard title="Late Arrivals" value={stats.lateToday ?? "—"} subValue="Corrective action pending" icon={Clock} color="text-orange-500" hexColor="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Pending Approvals */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-slate-200/60 shadow-sm relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-3">
              <span className="p-2.5 bg-rose-50 rounded-[14px]"><AlertTriangle className="w-5 h-5 text-rose-500"/></span>
              Pending Approvals
            </h2>
            <Link href="/admin/leaves" className="text-xs text-indigo-600 font-extrabold flex items-center gap-1 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full transition-all">
              View All <ChevronRight className="w-3.5 h-3.5"/>
            </Link>
          </div>
          
          <div className="space-y-4 flex-1">
            {leaves.slice(0,3).map((leave, i) => (
              <div key={i} className="flex flex-col gap-3 p-4 rounded-[20px] bg-slate-50/50 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center text-sm font-bold text-slate-700">
                    {leave.userId?.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-slate-900 truncate">{leave.userId?.name || "Employee"}</p>
                    <p className="text-[10px] font-semibold text-slate-500">{leave.type} · {leave.days}d</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleLeaveAction(leave._id, "approve")}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-1">
                    <CheckCheck className="w-3 h-3"/> Approve
                  </button>
                  <button onClick={() => handleLeaveAction(leave._id, "reject")}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[10px] font-bold hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all">
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {leaves.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                    <CheckCheck className="w-7 h-7" />
                 </div>
                 <p className="text-slate-900 font-extrabold text-sm">All caught up!</p>
                 <p className="text-slate-400 text-[11px] mt-1 font-medium">No pending leave requests to review.</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Breakdown */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-slate-200/60 shadow-sm flex flex-col h-full relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-extrabold text-slate-900">Attendance Mix</h2>
            <span className="p-2.5 bg-indigo-50 rounded-[14px]"><TrendingUp className="w-5 h-5 text-indigo-600" /></span>
          </div>

          {pieData.length > 0 ? (
            <div className="flex-1 flex flex-col">
              <div className="h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                      {pieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{background:"rgba(255,255,255,0.9)",border:"1px solid rgba(0,0,0,0.05)",borderRadius:16,fontSize:10,fontWeight:700}}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xl font-black text-slate-800">{stats.presentToday || 0}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Present</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pieData.map((d,i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full" style={{background:PIE_COLORS[i%PIE_COLORS.length]}}/>
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{d.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-800 ml-3">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                 <Clock className="w-5 h-5 opacity-20" />
              </div>
              <p className="text-xs font-bold">No data for today</p>
            </div>
          )}
        </div>

        {/* Communication Hub */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-slate-200/60 shadow-sm flex flex-col h-full relative overflow-hidden group hover:border-indigo-200 transition-colors duration-500">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-extrabold text-slate-900">Communication</h2>
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-[10px] text-[10px] font-black uppercase tracking-widest">Connected</span>
          </div>

          <div className="space-y-4">
            <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-red-200 hover:shadow-lg transition-all group/item">
              <div className="p-2.5 bg-red-50 text-red-500 rounded-xl group-hover/item:bg-red-500 group-hover/item:text-white transition-all">
                 <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Gmail</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check Inbox</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover/item:text-red-500 transition-all"/>
            </a>

            <a href="https://chat.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all group/item">
              <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
                 <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-7.6 8.38 8.38 0 0 1 3.8.9L22 4l-2.5 7.5z"/></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Google Chat</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Chat</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover/item:text-blue-500 transition-all"/>
            </a>

            <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer" className="w-full py-3.5 mt-2 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
              <Video className="w-4 h-4" />
              Start Google Meet
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-6 pt-4">
         <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
            <span className="p-2.5 bg-slate-100 rounded-[14px]"><Building2 className="w-5 h-5 text-slate-600" /></span>
            Administration Control
         </h2>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
           {[
             { label:"Employees", href:"/admin/employees", icon:Users, color: "text-indigo-500", bg: "bg-indigo-50" },
             { label:"Attendance", href:"/admin/attendance", icon:Clock, color: "text-emerald-500", bg: "bg-emerald-50" },
             { label:"Leaves", href:"/admin/leaves", icon:Calendar, color: "text-rose-500", bg: "bg-rose-50" },
             { label:"Performance", href:"/admin/performance", icon:TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
             { label:"Documents", href:"/admin/documents", icon:CheckCheck, color: "text-sky-500", bg: "bg-sky-50" },
             { label:"SOPs", href:"/admin/sop", icon:Building2, color: "text-violet-500", bg: "bg-violet-50" },
           ].map(item => (
             <Link key={item.href} href={item.href}
               className="bg-white border border-slate-100 p-6 rounded-[28px] hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center gap-4 text-center group active:scale-95 shadow-sm">
               <div className={cn("p-4 rounded-2xl transition-all group-hover:scale-110", item.bg)}>
                 <item.icon className={cn("w-6 h-6", item.color)}/>
               </div>
               <p className="text-[13px] font-extrabold text-slate-800 tracking-tight">{item.label}</p>
             </Link>
           ))}
         </div>
      </div>
    </div>
  );
}
