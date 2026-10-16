'use client'

import LoginPage from '@/views/LoginPage'
import { useAppState } from '@/context/AppStateContext'

export default function LoginRoute() {
  const { theme } = useAppState()
  return <LoginPage theme={theme} />
}
