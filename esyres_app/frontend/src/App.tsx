import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import i18n from './i18n'
import { DiscoveryHome } from './pages/DiscoveryHome'
import { MyBookings } from './pages/MyBookings'
import { SalonProfile } from './pages/SalonProfile'

const OwnerHome = lazy(() => import('./pages/OwnerHome').then((m) => ({ default: m.OwnerHome })))
const OwnerRequestDetail = lazy(() =>
  import('./pages/OwnerRequestDetail').then((m) => ({ default: m.OwnerRequestDetail })),
)

export default function App() {
  return (
    <div className="min-h-svh bg-canvas">
      <Routes>
        <Route path="/" element={<DiscoveryHome />} />
        <Route path="/salon/:id" element={<SalonProfile />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route
          path="/owner"
          element={
            <Suspense fallback={<p className="px-5 py-8 text-body">{i18n.t('salon.loading')}</p>}>
              <OwnerHome />
            </Suspense>
          }
        />
        <Route
          path="/owner/requests/:id"
          element={
            <Suspense fallback={<p className="px-5 py-8 text-body">{i18n.t('salon.loading')}</p>}>
              <OwnerRequestDetail />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
