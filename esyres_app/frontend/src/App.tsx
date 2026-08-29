import { Navigate, Route, Routes } from 'react-router-dom'
import { SalonProfile } from './pages/SalonProfile'

export default function App() {
  return (
    <div className="min-h-svh bg-canvas">
      <Routes>
        <Route path="/" element={<p className="p-6 text-sm text-muted">Esyres</p>} />
        <Route path="/salon/:id" element={<SalonProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
