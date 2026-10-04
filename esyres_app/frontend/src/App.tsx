import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { OwnerGate } from './components/OwnerGate'
import {
  CardsSkeleton,
  FormSkeleton,
  OwnerPageSkeleton,
  OwnerSalonEditSkeleton,
  OwnerSalonsSkeleton,
  OwnerWeekSkeleton,
  RequestDetailSkeleton,
  RowsSkeleton,
  TilesSkeleton,
} from './components/Skeleton'
import { CREATE_SALON_PATH } from './lib/createSalon'
import { RESET_PASSWORD_PATH } from './lib/homepage'
import { CreateSalon } from './pages/CreateSalon'
import { DiscoveryHome } from './pages/DiscoveryHome'
import { Homepage } from './pages/Homepage'
import { MyBookings } from './pages/MyBookings'
import { MyProfile } from './pages/MyProfile'
import { ResetPassword } from './pages/ResetPassword'
import { SalonProfile } from './pages/SalonProfile'

const OwnerHome = lazy(() => import('./pages/OwnerHome').then((m) => ({ default: m.OwnerHome })))
const OwnerChats = lazy(() => import('./pages/OwnerChats').then((m) => ({ default: m.OwnerChats })))
const OwnerStats = lazy(() => import('./pages/OwnerStats').then((m) => ({ default: m.OwnerStats })))
const OwnerRequestDetail = lazy(() =>
  import('./pages/OwnerRequestDetail').then((m) => ({ default: m.OwnerRequestDetail })),
)
const OwnerSalons = lazy(() => import('./pages/OwnerSalons').then((m) => ({ default: m.OwnerSalons })))
const OwnerSalonCreate = lazy(() =>
  import('./pages/OwnerSalonCreate').then((m) => ({ default: m.OwnerSalonCreate })),
)
const OwnerSalonEdit = lazy(() =>
  import('./pages/OwnerSalonEdit').then((m) => ({ default: m.OwnerSalonEdit })),
)
const OwnerSettings = lazy(() => import('./pages/OwnerSettings').then((m) => ({ default: m.OwnerSettings })))
const OwnerPhoneBooking = lazy(() =>
  import('./pages/OwnerPhoneBooking').then((m) => ({ default: m.OwnerPhoneBooking })),
)
const OwnerZapisi = lazy(() => import('./pages/OwnerZapisi').then((m) => ({ default: m.OwnerZapisi })))

function owner(page: ReactNode, preset: ReactNode) {
  return (
    <OwnerGate>
      <Suspense fallback={<OwnerPageSkeleton>{preset}</OwnerPageSkeleton>}>{page}</Suspense>
    </OwnerGate>
  )
}

function customer(page: ReactNode) {
  return <div className="customer-surface min-h-svh">{page}</div>
}

export default function App() {
  return (
    <div className="min-h-svh bg-canvas">
      <Routes>
        <Route path="/" element={customer(<Homepage />)} />
        <Route path="/salons" element={customer(<DiscoveryHome />)} />
        <Route path={CREATE_SALON_PATH} element={<CreateSalon />} />
        <Route path="/salon/:id" element={customer(<SalonProfile />)} />
        <Route path="/bookings" element={customer(<MyBookings />)} />
        <Route path="/my-profile" element={customer(<MyProfile />)} />
        <Route path="/my-profile/settings" element={customer(<MyProfile />)} />
        <Route path={RESET_PASSWORD_PATH} element={<ResetPassword />} />
        <Route path="/owner" element={owner(<OwnerHome />, <OwnerWeekSkeleton />)} />
        <Route path="/owner/chats" element={owner(<OwnerChats />, <RowsSkeleton count={4} />)} />
        <Route path="/owner/stats" element={owner(<OwnerStats />, <TilesSkeleton />)} />
        <Route path="/owner/requests/:id" element={owner(<OwnerRequestDetail />, <RequestDetailSkeleton />)} />
        <Route path="/owner/salons" element={owner(<OwnerSalons />, <OwnerSalonsSkeleton />)} />
        <Route path="/owner/salons/create" element={owner(<OwnerSalonCreate />, <FormSkeleton />)} />
        <Route path="/owner/salons/:id" element={owner(<OwnerSalonEdit />, <OwnerSalonEditSkeleton />)} />
        <Route path="/owner/settings" element={owner(<OwnerSettings />, <FormSkeleton />)} />
        <Route path="/owner/zapisi" element={owner(<OwnerZapisi />, <RowsSkeleton count={4} />)} />
        <Route path="/owner/phone" element={owner(<OwnerPhoneBooking />, <CardsSkeleton />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
