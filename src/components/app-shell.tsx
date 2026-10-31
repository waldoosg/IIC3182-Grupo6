import { ChartColumnIcon, DumbbellIcon, HistoryIcon } from "lucide-react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const links = [
  { to: "/", label: "Inicio", icon: DumbbellIcon, end: true },
  { to: "/historial", label: "Historial", icon: HistoryIcon, end: false },
  { to: "/progreso", label: "Progreso", icon: ChartColumnIcon, end: false },
]

export function AppShell() {
  const location = useLocation()

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col">
      <header className="border-b bg-card">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-col">
            <p className="font-heading text-xl font-medium tracking-tight text-primary">entrein</p>
            <p className="text-sm text-muted-foreground">Tu progreso, en cualquier gimnasio.</p>
          </div>
          <Badge variant="secondary">Demo</Badge>
        </div>
      </header>
      <main className="flex flex-1 flex-col px-4 py-4 pb-28">
        <div key={location.pathname} className="motion-page flex flex-1 flex-col gap-6">
          <Outlet />
        </div>
      </main>
      <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 border-t bg-card">
        <div className="mx-auto flex max-w-5xl">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-sm transition-colors duration-200 ease-out",
                  isActive ? "font-medium text-primary" : "text-muted-foreground",
                )
              }
            >
              <link.icon />
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
