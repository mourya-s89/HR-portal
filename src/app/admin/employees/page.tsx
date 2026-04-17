"use client";
import { useState, useEffect } from "react";
import { Users, Plus, Search, Filter, Mail, Phone, Building2, Briefcase, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ROLE_COLORS: Record<string,string> = { Admin:"bg-red-500/10 text-red-500", HR:"bg-violet-500/10 text-violet-500", Employee:"bg-indigo-500/10 text-indigo-500" };
const STATUS_COLORS: Record<string,string> = { Active:"bg-emerald-500/10 text-emerald-500", Inactive:"bg-orange-500/10 text-orange-500", Resigned:"bg-red-500/10 text-red-500" };

export default function EmployeesPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "All";

  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"Employee", department:"Engineering", designation:"", employeeId:"", phone:"" });

  const fetchData = async () => {
    const res = await fetch("/api/admin/employees");
    const data = await res.json();
    if (data.employees) setEmployees(data.employees);
  };

  useEffect(() => { fetchData(); }, []);

  const departments = ["All", ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];
  const filtered = employees.filter(e =>
    (deptFilter === "All" || e.department === deptFilter) &&
    (roleFilter === "All" || e.role === roleFilter) &&
    (!search || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || e.employeeId?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;
      
      const res = await fetch("/api/admin/employees", { 
        method, 
        headers:{"Content-Type":"application/json"}, 
        body: JSON.stringify(body) 
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      
      toast.success(editingId ? "Employee updated!" : "Employee added!");
      handleCloseForm();
      fetchData();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const handleEdit = (emp: any) => {
    setForm({
      name: emp.name || "",
      email: emp.email || "",
      password: "", // Don't pre-fill password
      role: emp.role || "Employee",
      department: emp.department || "Engineering",
      designation: emp.designation || "",
      employeeId: emp.employeeId || "",
      phone: emp.phone || ""
    });
    setEditingId(emp._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/employees?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Employee deleted successfully");
      fetchData();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name:"", email:"", password:"", role:"Employee", department:"Engineering", designation:"", employeeId:"", phone:"" });
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold gradient-text text-slate-900">Employee Directory</h1>
          <p className="text-muted-foreground mt-1 font-medium tracking-tight">Managing {employees.length} team members across {departments.length - 1} departments.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95">
            <Plus className="w-5 h-5"/> Add Employee
          </button>
        )}
      </div>

      {/* Role Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        {[
          { label: "Administrators", count: employees.filter(e => e.role === "Admin").length, role: "Admin", color: "from-rose-500 to-red-600", icon: "🛡️" },
          { label: "HR Managers", count: employees.filter(e => e.role === "HR").length, role: "HR", color: "from-violet-500 to-purple-600", icon: "⚖️" },
          { label: "Employees", count: employees.filter(e => e.role === "Employee").length, role: "Employee", color: "from-indigo-500 to-blue-600", icon: "👥" },
        ].map((item, idx) => (
          <button 
            key={idx} 
            onClick={() => setRoleFilter(item.role)}
            className={cn(
              "group relative overflow-hidden rounded-[2rem] p-6 border transition-all duration-300 text-left",
              roleFilter === item.role 
                ? "bg-slate-900 border-slate-900 shadow-xl scale-[1.02]" 
                : "bg-white border-slate-200/60 shadow-sm hover:shadow-lg hover:border-indigo-200"
            )}
          >
            <div className={cn("absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform", item.color)} />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className={cn("text-[10px] font-black uppercase tracking-widest", roleFilter === item.role ? "text-slate-400" : "text-slate-400")}>{item.label}</p>
                <p className={cn("text-3xl font-black", roleFilter === item.role ? "text-white" : "text-slate-900")}>{item.count}</p>
                <p className={cn("text-[9px] font-bold mt-2 flex items-center gap-1", roleFilter === item.role ? "text-indigo-400" : "text-indigo-500 opacity-0 group-hover:opacity-100 transition-all")}>
                   Filter by this role <span>→</span>
                </p>
              </div>
              <div className="text-3xl opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</div>
            </div>
            {roleFilter === item.role && (
               <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500" />
            )}
          </button>
        ))}
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="glass-card rounded-[2rem] p-8 border border-white/10 bg-white animate-fade-in-up shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-500">
                {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              {editingId ? "Modify Employee Record" : "Register New Employee"}
            </h2>
            <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label:"Full Name", key:"name", type:"text", req:true },
              { label:"Email Address", key:"email", type:"email", req:true },
              { label:"Access Password", key:"password", type:"password", req: !editingId, ph: editingId ? "(Leave blank to keep current)" : "Default: Welcome@123" },
              { label:"System Employee ID", key:"employeeId", type:"text", req:false },
              { label:"Contact Number", key:"phone", type:"text", req:false },
              { label:"Designation / Title", key:"designation", type:"text", req:false },
            ].map(f => (
              <div key={f.key} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{f.label}{f.req ? " *" : ""}</label>
                <input type={f.type} required={f.req} placeholder={f.ph || ""} value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700" />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Access Role</label>
              <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700">
                {["Employee","HR","Admin"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Department</label>
              <input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} placeholder="Engineering"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-4 justify-end pt-4">
              <button type="button" onClick={handleCloseForm} className="px-8 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
              <button type="submit" disabled={loading} className="px-10 py-3.5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Update Employee" : "Register Employee"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtering Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email or employee ID..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium shadow-sm"/>
        </div>
        <div className="relative min-w-[150px]">
           <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="w-full appearance-none bg-white border border-slate-200 rounded-2xl pl-11 pr-10 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-600 shadow-sm cursor-pointer">
              {["All", "Admin", "HR", "Employee"].map(r => <option key={r} value={r}>{r}</option>)}
           </select>
        </div>
        <div className="relative min-w-[180px]">
           <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} className="w-full appearance-none bg-white border border-slate-200 rounded-2xl pl-11 pr-10 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-600 shadow-sm cursor-pointer">
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
           </select>
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((emp) => (
          <div key={emp._id} className="glass-card p-6 rounded-[2rem] border border-white/10 hover:border-indigo-100 transition-all group space-y-5 bg-white shadow-sm hover:shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shrink-0 shadow-lg shadow-indigo-100 ring-4 ring-indigo-50">
                {emp.name[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-800 text-lg truncate leading-tight">{emp.name}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{emp.designation || emp.role}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border", ROLE_COLORS[emp.role]||"")}>{emp.role}</span>
                  <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border", STATUS_COLORS[emp.status]||"")}>{emp.status}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2.5 text-[11px] text-slate-500 font-bold pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-400 shrink-0"/><span className="truncate">{emp.email}</span></div>
              {emp.phone && <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400 shrink-0"/><span>{emp.phone}</span></div>}
              <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-slate-400 shrink-0"/><span>{emp.department}</span></div>
              {emp.employeeId && <div className="flex items-center gap-3"><Briefcase className="w-4 h-4 text-slate-400 shrink-0"/><span>{emp.employeeId}</span></div>}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 italic">Joined {formatDate(emp.joiningDate || emp.createdAt)}</p>
              <div className="flex items-center gap-2">
                 <button onClick={() => handleEdit(emp)} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95">
                    <Edit2 className="w-4 h-4" />
                 </button>
                 <button onClick={() => handleDelete(emp._id)} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Users className="w-16 h-16 text-slate-300 mb-4 opacity-50"/>
            <p className="text-slate-500 font-extrabold">No employees found.</p>
            <p className="text-slate-400 text-sm font-medium">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}
