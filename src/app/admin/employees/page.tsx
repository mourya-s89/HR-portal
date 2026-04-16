"use client";
import { useState, useEffect } from "react";
import { Users, Plus, Search, Filter, Mail, Phone, Building2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";

const ROLE_COLORS: Record<string,string> = { Admin:"bg-red-500/10 text-red-400", HR:"bg-violet-500/10 text-violet-400", Employee:"bg-indigo-500/10 text-indigo-400" };
const STATUS_COLORS: Record<string,string> = { Active:"bg-emerald-500/10 text-emerald-400", Inactive:"bg-orange-500/10 text-orange-400", Resigned:"bg-red-500/10 text-red-400" };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
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
    (!search || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || e.employeeId?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/employees", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Employee added successfully!");
      setShowForm(false);
      setForm({ name:"", email:"", password:"", role:"Employee", department:"Engineering", designation:"", employeeId:"", phone:"" });
      fetchData();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Employee Directory</h1>
          <p className="text-muted-foreground mt-1">{employees.length} total employees across {departments.length - 1} departments.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:opacity-90 transition-all active:scale-95">
          <Plus className="w-4 h-4"/> Add Employee
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-card rounded-3xl p-8 border border-white/5 animate-fade-in-up">
          <h2 className="text-lg font-bold mb-6">Add New Employee</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label:"Full Name", key:"name", type:"text", req:true },
              { label:"Email", key:"email", type:"email", req:true },
              { label:"Password", key:"password", type:"password", req:false, ph:"Default: Welcome@123" },
              { label:"Employee ID", key:"employeeId", type:"text", req:false },
              { label:"Phone", key:"phone", type:"text", req:false },
              { label:"Designation", key:"designation", type:"text", req:false },
            ].map(f => (
              <div key={f.key} className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{f.label}{f.req ? " *" : ""}</label>
                <input type={f.type} required={f.req} placeholder={f.ph || ""} value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                  className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</label>
              <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {["Employee","HR","Admin"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department</label>
              <input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} placeholder="Engineering"
                className="w-full bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-4 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-2xl bg-muted/50 text-muted-foreground font-medium hover:bg-muted transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60">
                {loading ? "Adding..." : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email or ID..."
            className="w-full bg-muted/30 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"/>
        </div>
        <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} className="bg-muted/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((emp, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                {emp.name[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{emp.name}</p>
                <p className="text-xs text-muted-foreground truncate">{emp.designation || emp.role}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase", ROLE_COLORS[emp.role]||"")}>{emp.role}</span>
                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase", STATUS_COLORS[emp.status]||"")}>{emp.status}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-white/5">
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0"/><span className="truncate">{emp.email}</span></div>
              {emp.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0"/><span>{emp.phone}</span></div>}
              <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 shrink-0"/><span>{emp.department}</span></div>
              {emp.employeeId && <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 shrink-0"/><span>{emp.employeeId}</span></div>}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <p className="text-[10px] text-muted-foreground">Joined {formatDate(emp.joiningDate)}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground space-y-3">
            <Users className="w-12 h-12 opacity-30"/>
            <p>No employees found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
