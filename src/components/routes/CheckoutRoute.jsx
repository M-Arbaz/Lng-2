'use client'

import CheckoutPage from '@/views/CheckoutPage'
import { useAppState } from '@/context/AppStateContext'

export default function CheckoutRoute() {
  const app = useAppState()
  return (
    <CheckoutPage
      cart={app.cart}
      cartTotal={app.cartTotal}
      appliedCoupon={app.appliedCoupon}
      onCouponChange={app.setAppliedCoupon}
      onPlaceOrder={app.handlePlaceOrder}
      theme={app.theme}
    />
  )
}
