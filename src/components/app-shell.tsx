import { ChartColumnIcon, DumbbellIcon, HistoryIcon } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const links = [
  { to: "/", label: "Inicio", icon: DumbbellIcon, end: true },
  { to: "/historial", label: "Historial", icon: HistoryIcon, end: false },
  { to: "/progreso", label: "Progreso", icon: ChartColumnIcon, end: false },
]

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col">
      <header className="border-b">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">Registro de fuerza</p>
            <p className="font-heading text-xl font-medium">Bitácora</p>
          </div>
          <Badge variant="secondary">Demostración</Badge>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 px-4 py-4 pb-28">
        <Outlet />
      </main>
      <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 border-t bg-background">
        <div className="mx-auto flex max-w-5xl">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-sm",
                  isActive ? "font-medium text-foreground" : "text-muted-foreground",
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
