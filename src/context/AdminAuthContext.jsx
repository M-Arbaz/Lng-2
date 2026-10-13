'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

const AdminAuthContext = createContext()

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const storedAdmin = window.localStorage.getItem('adminAuthToken')
      if (storedAdmin) setAdminUser(JSON.parse(storedAdmin))
    } catch {
      window.localStorage.removeItem('adminAuthToken')
    } finally {
      setReady(true)
    }
  }, [])

  const adminLogin = async (email, password) => {
    try {
      setError(null)
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

      if (email !== adminEmail || password !== adminPassword) {
        setError('Invalid admin credentials')
        return null
      }

      const adminData = {
        id: 'admin-001',
        email: adminEmail,
        displayName: 'Admin',
        role: 'admin',
        loginTime: new Date().toISOString(),
      }

      setAdminUser(adminData)
      window.localStorage.setItem('adminAuthToken', JSON.stringify(adminData))
      return { admin: adminData }
    } catch {
      setError('Login failed')
      return null
    }
  }

  const adminLogout = () => {
    setAdminUser(null)
    window.localStorage.removeItem('adminAuthToken')
  }

  const isAdminLoggedIn = () => adminUser !== null

  return (
    <AdminAuthContext.Provider value={{ adminUser, ready, error, adminLogin, adminLogout, isAdminLoggedIn }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return context
}
