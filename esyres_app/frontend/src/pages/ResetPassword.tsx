import { useQuery } from '@apollo/client'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { TopNav } from '../components/TopNav'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { HOME_HREF } from '../lib/homepage'

export function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { data } = useQuery<MeData>(ME_QUERY)
  const reset = { token: params.get('token') ?? '', email: params.get('email') ?? '' }

  return (
    <div className="flex min-h-svh flex-col bg-page">
      <TopNav me={data?.me ?? null} />
      <AuthShell place="customer" reset={reset} onAuthenticated={() => navigate(HOME_HREF)} />
    </div>
  )
}
