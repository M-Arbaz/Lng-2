'use client'

import OrdersPage from '@/views/OrdersPage'
import AuthGuard from '@/components/AuthGuard'
import { useAppState } from '@/context/AppStateContext'

export default function OrdersRoute() {
  const app = useAppState()
  return <AuthGuard><OrdersPage orders={app.orders} theme={app.theme} /></AuthGuard>
}
