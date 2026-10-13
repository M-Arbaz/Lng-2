'use client'

import { AuthProvider } from '@/context/AuthContext'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { AppStateProvider } from '@/context/AppStateContext'

export default function Providers({ children }) {
  return (
    <AdminAuthProvider>
      <AuthProvider>
        <AppStateProvider>{children}</AppStateProvider>
      </AuthProvider>
    </AdminAuthProvider>
  )
}
