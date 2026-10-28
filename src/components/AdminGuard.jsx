import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-session'
import { AdminAuthProvider } from '@/context/AdminAuthContext'

export default async function AdminGuard({ children }) {
  const admin = await getAdminSession()

  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <AdminAuthProvider initialAdminUser={admin}>
      {children}
    </AdminAuthProvider>
  )
}