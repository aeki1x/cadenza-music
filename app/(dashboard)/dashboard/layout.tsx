import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({children}:{children:React.ReactNode}){
  const user=await getCurrentUser();
  if(!user) redirect("/login");
  return <div className="shell"><header className="topbar"><div className="brand">Cadenza Music Center</div><div className="actions"><span>{user.profile.full_name} · {user.profile.role.replace("_"," ")}</span><LogoutButton/></div></header><div className="layout"><Sidebar role={user.profile.role}/><main className="main">{children}</main></div></div>
}
