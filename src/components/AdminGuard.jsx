'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function AdminGuard({ children }) {
  const router = useRouter()
  const { ready, isAdminLoggedIn } = useAdminAuth()

  useEffect(() => {
    if (ready && !isAdminLoggedIn()) router.replace('/admin/login')
  }, [ready, isAdminLoggedIn, router])

  if (!ready) return <div className="min-h-screen bg-gray-50" />
  if (!isAdminLoggedIn()) return <div className="min-h-screen bg-gray-50" />
  return children
}
