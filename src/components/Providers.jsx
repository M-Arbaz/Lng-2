'use client'

import { AuthProvider } from '@/context/AuthContext'
import { AppStateProvider } from '@/context/AppStateContext'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <AppStateProvider>
        {children}
      </AppStateProvider>
    </AuthProvider>
  )
}