import Link from "next/link";
import type { AppRole } from "@/lib/auth";

const groups = [
  ["Overview", [["Dashboard","/dashboard"]]],
  ["Management", [
    ["Users","/dashboard/users"],["Lesson Packages","/dashboard/lesson-packages"],["Rooms","/dashboard/rooms"],
    ["Instruments","/dashboard/instruments"],["Availability","/dashboard/availability"],["Enrollments","/dashboard/enrollments"],
    ["Schedules","/dashboard/schedules"],["Attendance","/dashboard/attendance"],["Progress","/dashboard/progress"],
    ["Studio Bookings","/dashboard/bookings"],["Instrument Rentals","/dashboard/rentals"],["Billing","/dashboard/billing"],
    ["Payments","/dashboard/payments"],["Announcements","/dashboard/announcements"],["Notifications","/dashboard/notifications"],
    ["Reports","/dashboard/reports"]
  ]]
] as const;

export default function Sidebar({role}:{role:AppRole}) {
  return <aside className="sidebar">
    {groups.map(([title,links])=><div key={title}><div className="nav-title">{title}</div>{links.map(([label,href])=>{
      const hidden = role==="instructor" && ["Users","Billing","Payments"].includes(label);
      const clientHidden = role==="client" && ["Users","Lesson Packages","Rooms","Instruments","Availability","Enrollments","Schedules","Attendance","Progress","Billing","Payments","Announcements","Reports"].includes(label);
      if(hidden || clientHidden) return null;
      return <Link className="nav" href={href} key={href}>{label}</Link>
    })}</div>)}
  </aside>
}
