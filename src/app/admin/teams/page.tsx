"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Users, Plus, Search, Calendar, Clock, 
  ChevronRight, Trash2, Edit2, CheckCircle2, 
  MessageSquare, Briefcase, Hash, Info, UserCheck
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function TeamsAdminPage() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    projectName: "",
    projectDeadline: "",
    members: [] as string[],
    shift: {
      type: "Morning",
      startTime: "09:00",
      endTime: "17:00"
    }
  });

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/admin/teams");
      const data = await res.json();
      setTeams(data);
    } catch (error) {
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/admin/employees");
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (error) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingTeam ? `/api/admin/teams/${editingTeam._id}` : "/api/admin/teams";
    const method = editingTeam ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingTeam ? "Team updated" : "Team created");
        setIsModalOpen(false);
        setEditingTeam(null);
        setFormData({
          name: "",
          description: "",
          projectName: "",
          projectDeadline: "",
          members: [],
          shift: { type: "Morning", startTime: "09:00", endTime: "17:00" }
        });
        fetchTeams();
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    try {
      const res = await fetch(`/api/admin/teams/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Team deleted");
        fetchTeams();
      }
    } catch (error) {
      toast.error("Failed to delete team");
    }
  };

  const openEditModal = (team: any) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || "",
      projectName: team.projectName,
      projectDeadline: team.projectDeadline ? new Date(team.projectDeadline).toISOString().split("T")[0] : "",
      members: team.members.map((m: any) => m._id),
      shift: team.shift || { type: "Morning", startTime: "09:00", endTime: "17:00" }
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Header */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Management</h1>
            <p className="text-slate-500 font-medium max-w-md">Oversee project teams, shift timings, and workforce distribution.</p>
          </div>
          <button 
            onClick={() => { setEditingTeam(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all w-fit"
          >
            <Plus className="w-5 h-5" />
            Create New Team
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team._id} className="bg-white group rounded-[32px] border border-slate-200/80 p-8 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-1">
                  <div className="p-2.5 bg-indigo-50 rounded-xl w-fit mb-3">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{team.name}</h3>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Manager: {team.managerId?.name}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(team)} className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(team._id)} className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-md">{team.projectName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span className="text-xs font-bold text-slate-700">{team.shift.type} ({team.shift.startTime} - {team.shift.endTime})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</span>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-700">{team.projectDeadline ? format(new Date(team.projectDeadline), "MMM dd, yyyy") : "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Members</p>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{team.members.length} Members</span>
                  </div>
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 5).map((m: any, idx: number) => (
                      <div key={idx} className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-700 overflow-hidden ring-1 ring-slate-100" title={m.name}>
                        {m.name?.[0]}
                      </div>
                    ))}
                    {team.members.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">
                        +{team.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between group-hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Updates Active</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:gap-2 transition-all cursor-pointer">
                  View Timeline <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 md:p-12 shadow-2xl relative animate-scale-in">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
              <Plus className="w-6 h-6 rotate-45 text-slate-400" />
            </button>
            
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900">{editingTeam ? "Edit Team" : "Create Team"}</h2>
              <p className="text-slate-500 font-medium">Define project scope, assign workforce and set shift timings.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Team Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                    placeholder="e.g., Performance Engineering"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> Project Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.projectName}
                    onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                    placeholder="Project identifier"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Target Deadline
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.projectDeadline}
                    onChange={e => setFormData({ ...formData, projectDeadline: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Shift Assignment
                  </label>
                  <select
                    value={formData.shift.type}
                    onChange={e => setFormData({ ...formData, shift: { ...formData.shift, type: e.target.value as any } })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                  >
                    <option value="Morning">Morning Shift</option>
                    <option value="Evening">Evening Shift</option>
                    <option value="Night">Night Shift</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Start Time
                  </label>
                  <input
                    required
                    type="time"
                    value={formData.shift.startTime}
                    onChange={e => setFormData({ ...formData, shift: { ...formData.shift, startTime: e.target.value } })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" /> End Time
                  </label>
                  <input
                    required
                    type="time"
                    value={formData.shift.endTime}
                    onChange={e => setFormData({ ...formData, shift: { ...formData.shift, endTime: e.target.value } })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3 h-3" /> Assign Members
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 max-h-48 overflow-y-auto">
                  {employees.map(emp => (
                    <label key={emp._id} className={cn(
                      "flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer",
                      formData.members.includes(emp._id) ? "bg-white border-indigo-200 text-indigo-600 shadow-sm" : "border-transparent text-slate-500 hover:bg-white"
                    )}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.members.includes(emp._id)}
                        onChange={() => {
                          const newMembers = formData.members.includes(emp._id)
                            ? formData.members.filter(id => id !== emp._id)
                            : [...formData.members, emp._id];
                          setFormData({ ...formData, members: newMembers });
                        }}
                      />
                      <span className="text-[11px] font-bold truncate">{emp.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {editingTeam ? "Update Team Configuration" : "Initialize Project Team"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
