'use client'

import CheckoutPage from '@/pages/CheckoutPage'
import { useAppState } from '@/context/AppStateContext'

export default function CheckoutRoute() {
  const app = useAppState()
  return <CheckoutPage cart={app.cart} cartTotal={app.cartTotal} onPlaceOrder={app.handlePlaceOrder} theme={app.theme} />
}
