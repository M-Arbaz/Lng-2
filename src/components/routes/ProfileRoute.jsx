'use client'

import ProfileSection from '@/sections/ProfileSection'
import AuthGuard from '@/components/AuthGuard'
import { useAppState } from '@/context/AppStateContext'

export default function ProfileRoute() {
  const app = useAppState()
  return (
    <AuthGuard>
      <div className="w-full bg-stone-50 min-h-screen p-4 lg:p-6">
        <ProfileSection
          orders={app.orders}
          wishlist={app.wishlist}
          profile={app.user}
          handleProfileChange={app.handleProfileChange}
          onLogout={app.handleLogout}
        />
      </div>
    </AuthGuard>
  )
}
