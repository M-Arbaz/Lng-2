'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AuthGuard({ children }) {
  const router = useRouter()
  const { loading, isLoggedIn } = useAuth()

  useEffect(() => {
    if (!loading && !isLoggedIn()) router.replace('/login')
  }, [loading, isLoggedIn, router])

  if (loading || !isLoggedIn()) return <div className="min-h-[50vh]" />
  return children
}
