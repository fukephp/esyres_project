import { Navigate, Route, Routes } from 'react-router-dom'
import { DiscoveryHome } from './pages/DiscoveryHome'
import { SalonProfile } from './pages/SalonProfile'

export default function App() {
  return (
    <div className="min-h-svh bg-canvas">
      <Routes>
        <Route path="/" element={<DiscoveryHome />} />
        <Route path="/salon/:id" element={<SalonProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
