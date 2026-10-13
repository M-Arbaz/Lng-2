'use client'

import SignupPage from '@/pages/SignupPage'
import { useAppState } from '@/context/AppStateContext'

export default function SignupRoute() {
  const { theme } = useAppState()
  return <SignupPage theme={theme} />
}
