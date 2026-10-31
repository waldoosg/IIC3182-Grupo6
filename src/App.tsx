import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "@/components/app-shell"
import { Toaster } from "@/components/ui/sonner"
import { HistoryPage } from "@/pages/history-page"
import { HomePage } from "@/pages/home-page"
import { ProgressPage } from "@/pages/progress-page"
import { ExercisePage, SessionPage } from "@/pages/session-page"

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="sesion/:sessionId" element={<SessionPage />} />
          <Route path="sesion/:sessionId/ejercicio/:itemId" element={<ExercisePage />} />
          <Route path="historial" element={<HistoryPage />} />
          <Route path="progreso" element={<ProgressPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
