import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { homeSurface, companyPitchSeen, markCompanyPitchSeen } from '../lib/companyPitch'
import { CompanyPitch } from './CompanyPitch'
import { DiscoveryHome } from './DiscoveryHome'

export function HomeGate() {
  const { pathname } = useLocation()
  const [seen, setSeen] = useState(() => companyPitchSeen(window.localStorage))

  if (homeSurface(pathname, seen) === 'pitch') {
    return (
      <CompanyPitch
        onContinue={() => {
          markCompanyPitchSeen(window.localStorage)
          setSeen(true)
        }}
      />
    )
  }

  return <DiscoveryHome />
}
