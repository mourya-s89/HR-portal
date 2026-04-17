"use client";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, Search, Calendar, RefreshCcw, 
  CheckCircle2, Clock, UserX, Users, MapPin, 
  Edit3, X, Loader2, ChevronLeft, ChevronRight, AlertCircle,
  MoreVertical, Info
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate, formatTime, cn } from "@/lib/utils";

export default function AdminAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance?date=${date}`);
      const data = await res.json();
      if (data.employees) setEmployees(data.employees);
      if (data.records) setRecords(data.records);
    } catch (e) {
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [date]);

  const stats = {
    total: employees.length,
    present: records.filter(r => r.status === "Present").length,
    late: records.filter(r => r.isLate).length,
    absent: Math.max(0, employees.length - records.length)
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    emp.department?.toLowerCase().includes(search.toLowerCase())
  );

  const getRecordForEmployee = (empId: string) => {
    return records.find(r => r.userId?._id === empId || r.userId === empId);
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRecord)
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Record updated successfully");
      setShowEditModal(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualEntry = (emp: any) => {
    const existing = getRecordForEmployee(emp._id);
    if (existing) {
      setEditingRecord({ ...existing, id: existing._id });
    } else {
      setEditingRecord({
        userId: emp._id,
        date: date,
        status: "Present",
        isLate: false,
        notes: "Manual Entry by Admin"
      });
    }
    setShowEditModal(true);
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 border border-slate-100 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Workforce Participation</h1>
            <p className="text-muted-foreground mt-1 font-medium">Monitoring real-time attendance and site locations.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
            <button 
              onClick={() => {
                const d = new Date(date); d.setDate(d.getDate() - 1);
                setDate(d.toISOString().split('T')[0]);
              }}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 px-2 cursor-pointer"
            />
            <button 
              onClick={() => {
                const d = new Date(date); d.setDate(d.getDate() + 1);
                setDate(d.toISOString().split('T')[0]);
              }}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button onClick={fetchData} className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-lg hover:bg-slate-800 active:scale-95 transition-all">
            <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-[28px] border border-white/5 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Team</p>
            <p className="text-3xl font-black text-slate-800">{stats.total}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-500"><Users className="w-6 h-6" /></div>
        </div>
        <div className="glass-card p-6 rounded-[28px] border border-white/5 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Present</p>
            <p className="text-3xl font-black text-emerald-500">{stats.present}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-500"><CheckCircle2 className="w-6 h-6" /></div>
        </div>
        <div className="glass-card p-6 rounded-[28px] border border-white/5 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Late Arrivals</p>
            <p className="text-3xl font-black text-amber-500">{stats.late}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-500"><Clock className="w-6 h-6" /></div>
        </div>
        <div className="glass-card p-6 rounded-[28px] border border-white/5 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Absent</p>
            <p className="text-3xl font-black text-rose-500">{stats.absent}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-500"><UserX className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Registry */}
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, employee ID or department..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[20px] pl-11 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
          />
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check In/Out</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hours</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Location</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-8 py-8"><div className="h-6 bg-slate-100 rounded-lg w-full" /></td>
                    </tr>
                  ))
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => {
                    const rec = getRecordForEmployee(emp._id);
                    return (
                      <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm shadow-sm">
                              {emp.name[0]}
                            </div>
                            <div>
                               <p className="text-sm font-extrabold text-slate-800 leading-tight">{emp.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{emp.employeeId || "NO-ID"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-2.5 py-1 bg-slate-100 rounded-lg">
                            {emp.department || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {rec?.checkIn ? (
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                In: {formatTime(rec.checkIn)}
                              </p>
                              {rec.checkOut && (
                                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  Out: {formatTime(rec.checkOut)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-300 font-bold italic tracking-wide">—</p>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-slate-800">{rec?.totalHours ? `${rec.totalHours}h` : "—"}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center gap-2">
                             {rec?.checkInLocation?.address && (
                               <div className="relative group/loc">
                                 <button className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition-all">
                                   <MapPin className="w-4 h-4" />
                                 </button>
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 invisible group-hover/loc:opacity-100 group-hover/loc:visible transition-all z-20 shadow-xl">
                                    <p className="font-bold border-b border-white/10 pb-1.5 mb-1.5 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Check In Location
                                    </p>
                                    {rec.checkInLocation.address}
                                 </div>
                               </div>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                            rec?.status === "Present" && !rec.isLate ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50" :
                            rec?.isLate ? "bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-50" :
                            "bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-50"
                          )}>
                             {rec?.status || "Absent"}
                             {rec?.isLate && " (Late)"}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => handleManualEntry(emp)}
                            className="p-3 rounded-xl bg-slate-100 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={7} className="px-8 py-20 text-center"><p className="text-slate-400 font-bold">No matching employees found.</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-10 shadow-2xl animate-fade-in-up border border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
                 <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-500"><Edit3 className="w-5 h-5" /></div>
                 Manual Attendance entry
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleUpdateRecord} className="space-y-8">
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center font-bold text-slate-600">
                    {employees.find(e => e._id === editingRecord?.userId)?.name?.[0]}
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-900">{employees.find(e => e._id === editingRecord?.userId)?.name}</p>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Employee: {employees.find(e => e._id === editingRecord?.userId)?.employeeId}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Status</label>
                  <select 
                    value={editingRecord?.status} 
                    onChange={e => setEditingRecord({...editingRecord, status: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Half-Day">Half-Day</option>
                    <option value="Leave">Leave</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>

                <div className="space-y-3 pt-6 flex flex-col justify-center">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <input 
                       type="checkbox" 
                       checked={editingRecord?.isLate} 
                       onChange={e => setEditingRecord({...editingRecord, isLate: e.target.checked})}
                       className="w-5 h-5 rounded-lg border-slate-300 text-amber-500 focus:ring-amber-500/20"
                    />
                    <label className="text-xs font-bold text-slate-700">Mark as Late</label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Check In Time (Optional)</label>
                  <input 
                    type="time" 
                    onChange={e => {
                      if(!e.target.value) return;
                      const d = new Date(date);
                      const [h,m] = e.target.value.split(':');
                      d.setHours(parseInt(h), parseInt(m));
                      setEditingRecord({...editingRecord, checkIn: d.toISOString()});
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 uppercase" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Check Out Time (Optional)</label>
                  <input 
                    type="time" 
                    onChange={e => {
                      if(!e.target.value) return;
                      const d = new Date(date);
                      const [h,m] = e.target.value.split(':');
                      d.setHours(parseInt(h), parseInt(m));
                      setEditingRecord({...editingRecord, checkOut: d.toISOString()});
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 uppercase" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Admin Remark / Notes</label>
                <textarea 
                  rows={3}
                  value={editingRecord?.notes}
                  onChange={e => setEditingRecord({...editingRecord, notes: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700" 
                  placeholder="Reason for manual entry..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                 <button 
                   type="button" 
                   onClick={() => setShowEditModal(false)}
                   className="flex-1 px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 active:scale-95 transition-all text-sm"
                 >
                   Cancel
                 </button>
                 <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-[2] px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm"
                 >
                   {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                   Save Entry
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
