"use client";
import { useState, useEffect } from "react";
import { CalendarDays, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string,string> = { Holiday:"bg-emerald-500", Event:"bg-indigo-500", Leave:"bg-blue-500", Meeting:"bg-violet-500", Deadline:"bg-red-500" };

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [current, setCurrent] = useState(new Date());

  useEffect(() => { fetch("/api/calendar").then(r=>r.json()).then(d=>{ if(d.events) setEvents(d.events); }); }, []);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = new Date();

  const eventsForDay = (day: number) => {
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear()===year && d.getMonth()===month && d.getDate()===day;
    });
  };

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Annual Calendar</h1>
        <p className="text-muted-foreground mt-1">Public holidays, company events and important dates.</p>
      </div>

      <div className="glass-card rounded-3xl p-8 border border-white/5">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{monthNames[month]} {year}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrent(new Date(year, month-1,1))} className="p-2 rounded-xl hover:bg-muted/50 transition-colors"><ChevronLeft className="w-5 h-5"/></button>
            <button onClick={() => setCurrent(new Date())} className="px-4 py-2 rounded-xl bg-muted/40 text-sm font-medium hover:bg-muted/60 transition-colors">Today</button>
            <button onClick={() => setCurrent(new Date(year, month+1,1))} className="p-2 rounded-xl hover:bg-muted/50 transition-colors"><ChevronRight className="w-5 h-5"/></button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="text-center text-xs font-bold text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({length: firstDay}).map((_,i) => <div key={`e${i}`}/>)}
          {Array.from({length: daysInMonth}, (_,i) => i+1).map(day => {
            const dayEvents = eventsForDay(day);
            const isToday = day===today.getDate() && month===today.getMonth() && year===today.getFullYear();
            return (
              <div key={day} className={cn("min-h-[80px] p-2 rounded-2xl border border-white/5 hover:border-white/10 transition-all group",
                isToday ? "border-primary/50 bg-primary/5" : "bg-muted/10"
              )}>
                <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold mb-1 transition-colors",
                  isToday ? "bg-primary text-primary-foreground" : "group-hover:bg-muted/40")}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0,2).map((ev,i) => (
                    <div key={i} className={cn("w-full px-1.5 py-0.5 rounded-md text-[9px] font-bold truncate text-white", TYPE_COLORS[ev.type]||"bg-muted")}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && <span className="text-[9px] text-muted-foreground">+{dayEvents.length-2} more</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/5">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("w-3 h-3 rounded-full", color)}/>{type}
            </span>
          ))}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="glass-card rounded-3xl p-8 border border-white/5 space-y-4">
        <h2 className="text-lg font-bold">Upcoming Events</h2>
        <div className="space-y-3">
          {events.filter(e => new Date(e.date) >= new Date()).sort((a,b) => new Date(a.date).getTime()-new Date(b.date).getTime()).slice(0,8).map((ev,i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className={cn("w-2 h-10 rounded-full shrink-0", TYPE_COLORS[ev.type]||"bg-muted")}/>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{ev.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(ev.date).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
              </div>
              <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-muted/40 text-muted-foreground shrink-0">{ev.type}</span>
            </div>
          ))}
          {events.length === 0 && <p className="text-center text-muted-foreground text-sm py-6">No events scheduled. HR will add company holidays and events here.</p>}
        </div>
      </div>
    </div>
  );
}
