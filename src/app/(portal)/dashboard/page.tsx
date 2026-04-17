"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Clock, Calendar, AlertCircle, CheckCircle2,
  TrendingUp, ArrowUpRight, Megaphone,
  Briefcase, Coffee, Video
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
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

// Progress Ring SVG
function CircularProgress({ percentage, label, sublabel }: { percentage: number, label: string, sublabel: string }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-36 h-36 transform -rotate-90">
        <circle cx="72" cy="72" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
        <circle 
          cx="72" cy="72" r={radius} 
          stroke="url(#gradient)" strokeWidth="8" fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out" 
          strokeLinecap="round" 
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black text-slate-800">{label}</span>
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{sublabel}</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, icon: Icon, trend, color, hexColor }: any) {
  return (
    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[24px] border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 relative overflow-hidden group">
      {/* Background soft glow */}
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

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats] = useState({ presentDays: 18, absentDays: 1, lopDays: 0.5, clBalance: 1 });
  const [today, setToday] = useState<any>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch("/api/attendance");
        const data = await res.json();
        if (data.today) setToday(data.today);
      } catch (error) {}
    };
    fetchAttendance();
  }, []);

  // Time based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Top Hero Section */}
      <div className="relative rounded-[32px] bg-white p-8 md:p-12 border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400 via-purple-300 to-cyan-300 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-sky-300 to-indigo-200 blur-[80px] rounded-full translate-y-1/3 -translate-x-1/4" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              {greeting}, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">{session?.user?.name?.split(' ')[0] || 'User'} 👋</span>
            </h1>
            <p className="text-slate-600 font-semibold md:text-base flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              You are <span className="text-slate-900 font-extrabold">92% consistent</span> this month. Keep up the momentum!
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Days Present" value={stats.presentDays} subValue="Current month" icon={CheckCircle2} trend="+12% vs Last" color="text-emerald-600" hexColor="#10b981" />
        <StatCard title="Late Deductions" value={stats.lopDays} subValue="Half-days applied" icon={AlertCircle} color="text-rose-500" hexColor="#f43f5e" />
        <StatCard title="Leaves Balance" value={stats.clBalance} subValue="Available PTO" icon={Calendar} color="text-indigo-500" hexColor="#6366f1" />
        <StatCard title="Performance" value="9.2" subValue="Top 5% of company" icon={TrendingUp} trend="+0.4 Pts" color="text-amber-500" hexColor="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Work Log Panel */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-200/60 shadow-sm relative overflow-hidden">
             
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
                  <span className="p-2.5 bg-indigo-50 rounded-[14px]"><Briefcase className="w-5 h-5 text-indigo-600" /></span>
                  Work Log
                </h2>
                <div className="flex items-center gap-2 w-fit px-3.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest ring-1 ring-emerald-200/50 shadow-sm">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                   {today?.checkIn && !today?.checkOut ? "Live — Checked In" : today?.checkOut ? "Shift Completed" : "Not Checked In"}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Timeline */}
                <div className="md:col-span-3 space-y-2">
                  <div className="relative pl-7 border-l-2 border-slate-100 ml-2">
                    
                    <div className="relative mb-10 group">
                      <div className={cn("absolute -left-[37px] top-1 w-[18px] h-[18px] rounded-full border-4 border-white shadow-sm ring-1 ring-slate-200 transition-colors", today?.checkIn ? "bg-emerald-500" : "bg-slate-200 group-hover:bg-indigo-300")} />
                      <p className="text-[15px] font-extrabold text-slate-900 tracking-tight">Check In</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{today?.checkIn ? formatTime(today.checkIn) : "Awaiting check-in..."}</p>
                      {today?.checkInLocation && (
                        <p className="text-[11px] text-slate-400 font-medium mt-1.5 max-w-[280px] truncate flex items-center gap-1" title={today.checkInLocation.address}>
                          <span className="text-emerald-500">📍</span> {today.checkInLocation.address}
                        </p>
                      )}
                    </div>

                    <div className="relative mb-10">
                      <div className="absolute -left-[37px] top-1 w-[18px] h-[18px] rounded-full border-4 border-white bg-slate-200 shadow-sm ring-1 ring-slate-200" />
                      <p className="text-[15px] font-extrabold text-slate-900 tracking-tight">Lunch Break</p>
                      <p className="text-xs font-semibold text-slate-400 mt-1">Usually 1:00 PM — 2:00 PM</p>
                    </div>

                    <div className="relative group">
                      <div className={cn("absolute -left-[37px] top-1 w-[18px] h-[18px] rounded-full border-4 border-white shadow-sm ring-1 ring-slate-200 transition-colors", today?.checkOut ? "bg-rose-500" : "bg-slate-200 group-hover:bg-rose-300")} />
                      <p className="text-[15px] font-extrabold text-slate-900 tracking-tight">Check Out</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{today?.checkOut ? formatTime(today.checkOut) : "Pending"}</p>
                    </div>

                  </div>
                </div>

                {/* Status Ring & Action */}
                <div className="md:col-span-2 flex flex-col items-center justify-center p-8 bg-slate-50/70 rounded-[28px] border border-slate-100">
                   <CircularProgress 
                      percentage={today?.checkOut ? 100 : today?.checkIn ? 65 : 0} 
                      label={today?.totalHours ? `${today.totalHours}h` : today?.checkIn ? "5.2h" : "0h"} 
                      sublabel="Working Hours" 
                   />
                   
                   <div className="mt-8 w-full">
                      {today?.checkIn && !today?.checkOut ? (
                        <Link href="/dashboard/attendance" className="w-full py-4 rounded-[18px] flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-500 text-white font-extrabold shadow-[0_8px_16px_-6px_rgba(244,63,94,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(244,63,94,0.5)] hover:-translate-y-0.5 transition-all text-sm tracking-wide">
                          Check Out 
                          <span className="flex h-2 w-2 relative ml-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                        </Link>
                      ) : (
                        <Link href="/dashboard/attendance" className={cn(
                           "w-full py-4 rounded-[18px] flex items-center justify-center font-extrabold transition-all tracking-wide text-sm",
                           !today?.checkIn 
                             ? "bg-slate-900 text-white shadow-lg hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl" 
                             : "bg-slate-200 text-slate-400 pointer-events-none"
                        )}>
                           {today?.checkOut ? "Shift Completed" : "Check In First"}
                        </Link>
                      )}
                   </div>
                </div>
             </div>
           </div>

           {/* Announcements */}
           <div className="space-y-6 pt-2">
              <h2 className="text-xl font-extrabold flex items-center gap-3 text-slate-900">
                 <span className="p-2.5 bg-violet-50 rounded-[14px]"><Megaphone className="w-5 h-5 text-violet-600" /></span>
                 Announcements
              </h2>
              <div className="space-y-4">
                 <div className="p-6 rounded-[24px] bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-violet-200 transition-all group cursor-pointer">
                    <div className="flex items-start justify-between gap-6">
                       <div className="space-y-2">
                          <p className="text-sm font-extrabold text-slate-900 group-hover:text-violet-600 transition-colors leading-snug">Quarterly Performance Reviews - Q1 2024</p>
                          <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-[90%]">Reviews will begin from next Monday. Please ensure your personal goals are submitted to HR.</p>
                       </div>
                       <span className="shrink-0 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest mt-1">Urgent</span>
                    </div>
                 </div>
                 <div className="p-6 rounded-[24px] bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-sky-200 transition-all group cursor-pointer">
                    <div className="flex items-start justify-between gap-6">
                       <div className="space-y-2">
                          <p className="text-sm font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">Office Holiday: Festive Season approaching</p>
                          <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-[90%]">The office will be closed on Friday. Enjoy your long weekend and stay safe!</p>
                       </div>
                       <span className="shrink-0 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-[10px] font-black uppercase tracking-widest mt-1">Info</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Col: Communication Panel */}
        <div className="space-y-6">
           <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-slate-200/60 shadow-sm flex flex-col h-full relative overflow-hidden group hover:border-indigo-200 transition-colors duration-500">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-lg font-extrabold text-slate-900">Communication</h2>
                 <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-[10px] text-[10px] font-black uppercase tracking-widest">Connected</span>
              </div>

              {/* Gmail Link */}
              <a 
                href="https://mail.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-6 rounded-[24px] bg-white border border-slate-100 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_24px_-8px_rgba(234,67,53,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden mb-4 group/item flex items-center gap-4"
              >
                 <div className="p-3 bg-red-50 rounded-[14px] text-red-500 group-hover/item:bg-red-500 group-hover/item:text-white transition-all">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-extrabold text-slate-900 tracking-tight">Gmail</p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Check your inbox</p>
                 </div>
                 <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover/item:text-red-500 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all" />
              </a>

              {/* Google Chat Link */}
              <a 
                href="https://chat.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-6 rounded-[24px] bg-white border border-slate-100 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_24px_-8px_rgba(66,133,244,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden mb-8 group/item flex items-center gap-4"
              >
                 <div className="p-3 bg-blue-50 rounded-[14px] text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-7.6 8.38 8.38 0 0 1 3.8.9L22 4l-2.5 7.5z" />
                    </svg>
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-extrabold text-slate-900 tracking-tight">Google Chat</p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Message team</p>
                 </div>
                 <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover/item:text-blue-500 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all" />
              </a>

              <div className="mt-auto p-5 rounded-[22px] bg-slate-50 border border-slate-100/80 flex flex-col gap-3">
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Video Conferencing</p>
                 <a 
                    href="https://meet.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-slate-900 text-white text-[13px] font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                 >
                    <Video className="w-4 h-4" />
                    Start Google Meet
                 </a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
