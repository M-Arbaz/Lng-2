
'use client'

import { AuthProvider } from '@/context/AuthContext'
import { AppStateProvider } from '@/context/AppStateContext'
import DomainAccessGuard from '@/components/DomainAccessGuard'

export default function Providers({ children }) {
  return (
    <DomainAccessGuard>
      <AuthProvider>
        <AppStateProvider>
          {children}
        </AppStateProvider>
      </AuthProvider>
    </DomainAccessGuard>
  )
}
