'use client'

import SignupPage from '@/views/SignupPage'
import { useAppState } from '@/context/AppStateContext'

export default function SignupRoute() {
  const { theme } = useAppState()
  return <SignupPage theme={theme} />
}
