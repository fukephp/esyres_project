import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { companyPitchSeen, markCompanyPitchSeen, shouldShowCompanyPitch } from '../lib/companyPitch'
import { CompanyPitch } from './CompanyPitch'
import { DiscoveryHome } from './DiscoveryHome'

export function HomeGate() {
  const { pathname } = useLocation()
  const [seen, setSeen] = useState(() => companyPitchSeen(window.localStorage))

  if (shouldShowCompanyPitch(pathname, seen)) {
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
