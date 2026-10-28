'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { logoutAdmin as logoutAdminAction } from '@/app/actions/auth'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({
  children,
  initialAdminUser = null,
}) {
  const [adminUser, setAdminUser] = useState(initialAdminUser)
  const [error, setError] = useState(null)

  // Update the UI when a verified admin session is supplied.
  useEffect(() => {
    setAdminUser(initialAdminUser)
  }, [initialAdminUser?.email])

  const adminLogout = async () => {
    setError(null)

    try {
      await logoutAdminAction()
      setAdminUser(null)
    } catch (err) {
      setError('Logout failed. Please try again.')
      throw err
    }
  }

  const isAdminLoggedIn = () => Boolean(adminUser)

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        ready: true,
        error,
        adminLogout,
        isAdminLoggedIn,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error(
      'useAdminAuth must be used within AdminAuthProvider'
    )
  }

  return context
}