"use client";
import { useState, useEffect, useCallback } from "react";
import { Clock, MapPin, CheckCircle, XCircle, AlertTriangle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatTime, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TodayAttendance { checkIn?: string; checkOut?: string; totalHours?: number; isLate?: boolean; lopApplied?: boolean; checkInLocation?: { lat: number; lng: number; address?: string }; }

function MonthCalendar({ records }: { records: any[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const statusMap: Record<number, string> = {};
  records.forEach(r => {
    const d = new Date(r.date).getDate();
    statusMap[d] = r.status;
  });

  const statusColor = (s?: string) => {
    if (!s) return "bg-muted/20";
    if (s === "Present") return "bg-emerald-500/20 text-emerald-400";
    if (s === "Absent") return "bg-red-500/20 text-red-400";
    if (s === "Half-Day") return "bg-orange-500/20 text-orange-400";
    if (s === "Leave") return "bg-blue-500/20 text-blue-400";
    return "bg-muted/20";
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S","M","T","W","T","F","S"].map((d,i) => (
          <div key={i} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {days.map(d => {
          const isToday = d === today.getDate();
          return (
            <div key={d} className={cn("aspect-square flex items-center justify-center rounded-xl text-xs font-medium transition-all", statusColor(statusMap[d]), isToday && "ring-2 ring-primary")}>
              {d}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-4 text-[10px] font-bold">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Present</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>Absent</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block"/>Half-Day (LOP)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/>Leave</span>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const [today, setToday] = useState<TodayAttendance | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [liveTime, setLiveTime] = useState<Date | null>(null);

  useEffect(() => {
    setLiveTime(new Date());
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchAttendance = useCallback(async () => {
    const res = await fetch("/api/attendance");
    const data = await res.json();
    if (data.today) setToday(data.today);
    if (data.records) setRecords(data.records);
  }, []);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const fallbackLocation = async () => {
    try {
      const res = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client");
      const data = await res.json();
      const address = [data.locality, data.principalSubdivision, data.countryCode].filter(Boolean).join(", ");
      setLocationLabel(address || "IP Location");
      return { lat: data.latitude, lng: data.longitude, address };
    } catch {
      throw new Error("Could not determine location. Please check your connection.");
    }
  };

  const getLocation = (): Promise<{ lat: number; lng: number; address?: string }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        fallbackLocation().then(resolve).catch(reject);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async pos => {
          const { latitude: lat, longitude: lng } = pos.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            if (!res.ok) throw new Error("Nominatim blocked/failed");
            const data = await res.json();
            const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setLocationLabel(address);
            resolve({ lat, lng, address });
          } catch {
             // Fallback to BigDataCloud for precise city/state if nominatim is blocked (CORS/User-Agent)
             try {
                const res2 = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
                const data2 = await res2.json();
                const address2 = [data2.locality, data2.principalSubdivision, data2.countryCode].filter(Boolean).join(", ");
                setLocationLabel(address2 || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                resolve({ lat, lng, address: address2 });
             } catch {
                setLocationLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                resolve({ lat, lng });
             }
          }
        },
        () => {
          fallbackLocation().then(resolve).catch(() => reject(new Error("Location access denied or failed.")));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const location = await getLocation();
      const res = await fetch("/api/attendance/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(data.attendance.isLate ? "Checked in! Note: Late arrival → Half-Day LOP applied." : "Checked in successfully! Have a great day! 🚀");
      await fetchAttendance();
    } catch (e: any) {
      toast.error(e.message || "Location access denied. Please allow location to check in.");
    } finally { setLoading(false); }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const location = await getLocation();
      const res = await fetch("/api/attendance/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(`Checked out! Total hours: ${data.attendance.totalHours}h. Great work! 🎉`);
      await fetchAttendance();
    } catch (e: any) {
      toast.error(e.message || "Could not get location.");
    } finally { setLoading(false); }
  };

  const checked_in = !!today?.checkIn;
  const checked_out = !!today?.checkOut;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Attendance</h1>
        <p className="text-muted-foreground mt-1">Office hours: 9:30 AM – 6:30 PM. Late arrivals attract half-day LOP.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Check-in/out Card */}
        <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 space-y-6">
          <div className="text-center space-y-1">
            <p className="text-6xl font-mono font-bold text-foreground tracking-tight" suppressHydrationWarning>
              {liveTime ? liveTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
            </p>
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              {liveTime ? liveTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) : ""}
            </p>
          </div>

          {/* Location indicator */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-muted/30 border border-white/5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="truncate">{locationLabel || "Location will be captured on check-in"}</span>
            </div>
          </div>

          {today?.isLate && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Late arrival detected — Half-day LOP has been applied.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-muted/30 border border-white/5 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Check In</p>
              <p className="text-lg font-bold font-mono">{today?.checkIn ? formatTime(today.checkIn) : "--:--"}</p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-white/5 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Check Out</p>
              <p className="text-lg font-bold font-mono">{today?.checkOut ? formatTime(today.checkOut) : "--:--"}</p>
            </div>
          </div>

          {checked_in && today.totalHours && (
            <div className="text-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
              Total: {today.totalHours}h worked today 🎉
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleCheckIn}
              disabled={checked_in || loading}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95",
                !checked_in
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/20 hover:opacity-90"
                  : "bg-muted/50 text-muted-foreground cursor-not-allowed"
              )}
            >
              {checked_in ? <span className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Checked In</span> : loading ? "Getting Location..." : "🟢 Check In"}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!checked_in || checked_out || loading}
              className={cn(
                "w-full py-4 rounded-2xl font-bold transition-all active:scale-95",
                checked_in && !checked_out
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/20 hover:opacity-90"
                  : "bg-muted/50 text-muted-foreground border border-white/10 cursor-not-allowed"
              )}
            >
              {checked_out ? <span className="flex items-center justify-center gap-2"><XCircle className="w-5 h-5" /> Checked Out</span> : loading ? "Getting Location..." : "🔴 Check Out"}
            </button>
          </div>
        </div>

        {/* Monthly Calendar */}
        <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Monthly Overview
          </h2>
          <MonthCalendar records={records} />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
            {[
              { label: "Present", value: records.filter(r => r.status === "Present").length, color: "text-emerald-400" },
              { label: "LOP Days", value: records.filter(r => r.lopApplied).length, color: "text-orange-400" },
              { label: "Late Logins", value: records.filter(r => r.isLate).length, color: "text-yellow-400" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Log */}
      <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 space-y-4">
        <h2 className="text-lg font-bold">Recent Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-left py-3 pr-4">Date</th>
                <th className="text-left py-3 pr-4">Check In</th>
                <th className="text-left py-3 pr-4">Check Out</th>
                <th className="text-left py-3 pr-4">Hours</th>
                <th className="text-left py-3 pr-4">Status</th>
                <th className="text-left py-3">LOP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.slice().reverse().slice(0, 10).map((r, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 pr-4 font-medium">{formatDate(r.date)}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{r.checkIn ? formatTime(r.checkIn) : "—"}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{r.checkOut ? formatTime(r.checkOut) : "—"}</td>
                  <td className="py-3 pr-4">{r.totalHours ? `${r.totalHours}h` : "—"}</td>
                  <td className="py-3 pr-4">
                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                      r.status === "Present" ? "bg-emerald-500/10 text-emerald-400" :
                      r.status === "Absent" ? "bg-red-500/10 text-red-400" :
                      "bg-orange-500/10 text-orange-400"
                    )}>{r.status}</span>
                  </td>
                  <td className="py-3">
                    {r.lopApplied ? <span className="text-orange-400 font-bold text-xs">Yes</span> : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">No records this month</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
