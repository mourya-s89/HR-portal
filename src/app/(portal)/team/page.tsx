"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Users, Calendar, Clock, MessageSquare, 
  Send, Briefcase, Info, CheckCircle2, 
  Layout, History, UserPlus, Shield
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function EmployeeTeamPage() {
  const { data: session } = useSession();
  const [team, setTeam] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUpdate, setNewUpdate] = useState("");

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const [teamRes, leavesRes] = await Promise.all([
        fetch("/api/team"),
        fetch("/api/team/leaves")
      ]);
      const teamData = await teamRes.json();
      const leavesData = await leavesRes.json();
      setTeam(teamData);
      setLeaves(leavesData);
    } catch (error) {
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const postUpdate = async () => {
    if (!newUpdate.trim()) return;
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newUpdate }),
      });
      if (res.ok) {
        toast.success("Project update posted");
        setNewUpdate("");
        fetchTeamData();
      }
    } catch (error) {
      toast.error("Failed to post update");
    }
  };

  if (loading) return <div className="p-8"><div className="h-96 bg-slate-50 animate-pulse rounded-3xl" /></div>;
  if (!team) return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
        <Users className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-black text-slate-900">No Team Assigned</h2>
      <p className="text-slate-500 max-w-sm">You haven't been assigned to a project team yet. Contact your HR manager for more information.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Team Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 md:p-10 border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Project Team
                </span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {team.shift?.type} Shift
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{team.name}</h1>
              <p className="text-slate-500 font-medium max-w-xl">{team.description || "Building the next generation of solutions with a focus on high-performance delivery."}</p>
              
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Briefcase className="w-3 h-3"/>Project</p>
                  <p className="text-sm font-extrabold text-slate-800">{team.projectName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3"/>Deadline</p>
                  <p className="text-sm font-extrabold text-slate-800">{team.projectDeadline ? format(new Date(team.projectDeadline), "MMM dd, yyyy") : "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Shield className="w-3 h-3"/>Manager</p>
                  <p className="text-sm font-extrabold text-slate-800">{team.managerId?.name}</p>
                </div>
              </div>
            </div>
            
            <div className="shrink-0 flex -space-x-3">
              {team.members.map((m: any, idx: number) => (
                <div key={idx} className="w-12 h-12 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-xs font-black text-slate-700 ring-1 ring-slate-100" title={m.name}>
                  {m.name?.[0]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shift Card */}
        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-2xl" />
           <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Timing</p>
                <div className="p-2 bg-indigo-500/20 rounded-xl"><Clock className="w-4 h-4 text-indigo-400" /></div>
              </div>
              <div>
                <p className="text-4xl font-black">{team.shift?.startTime} — {team.shift?.endTime}</p>
                <p className="text-indigo-400 text-xs font-bold mt-2 uppercase tracking-wide">Regular {team.shift?.type} Shift</p>
              </div>
           </div>
           <div className="relative z-10 pt-8 border-t border-white/10">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Leave Policy for Team</p>
              <p className="text-xs font-medium leading-relaxed opacity-70">Please coordinates with team members before applying for leaves reaching project deadlines.</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Timeline & Updates */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm space-y-8">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  Project Updates
                </h2>
                <div className="px-3 py-1 bg-slate-50 text-[10px] font-black text-slate-400 rounded-lg uppercase tracking-wider">{team.updates?.length || 0} Posts</div>
             </div>

             <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input 
                  value={newUpdate}
                  onChange={e => setNewUpdate(e.target.value)}
                  placeholder="Share a project update with the team..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-slate-400"
                />
                <button onClick={postUpdate} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-110 active:scale-95 transition-all">
                  <Send className="w-4 h-4" />
                </button>
             </div>

             <div className="space-y-6 mt-10 relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100" />
                {team.updates?.slice().reverse().map((update: any, idx: number) => (
                  <div key={idx} className="relative pl-14 group">
                    <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 group-hover:scale-125 transition-transform" />
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:border-indigo-100 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-xs font-black text-slate-900">{update.userId?.name}</span>
                         <span className="text-[10px] font-bold text-slate-400">· {format(new Date(update.timestamp), "MMM dd, hh:mm a")}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">{update.content}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Team Activity & Leaves */}
        <div className="space-y-8">
           <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                 <History className="w-5 h-5 text-indigo-500" />
                 Upcoming Leaves
              </h3>
              <div className="space-y-3">
                 {leaves.map((leave, idx) => (
                   <div key={idx} className="flex flex-col p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-700">
                          {leave.userId?.name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">{leave.userId?.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{leave.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                        <span className="text-[10px] font-bold text-slate-500 italic">{format(new Date(leave.startDate), "MMM dd")} — {format(new Date(leave.endDate), "MMM dd")}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                   </div>
                 ))}
                 {leaves.length === 0 && (
                   <p className="text-xs font-bold text-slate-400 text-center py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">No upcoming team leaves</p>
                 )}
              </div>
           </div>

           <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                 <Info className="w-5 h-5 text-indigo-500" />
                 Work Hours Stats
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Avg. Team Consistency</span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">94%</span>
                 </div>
                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[94%]" />
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">Based on active shift attendance for the current project cycle.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
