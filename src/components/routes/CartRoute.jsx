'use client'

import CartPage from '@/views/CartPage'
import { useAppState } from '@/context/AppStateContext'
import { useRouter } from 'next/navigation'

export default function CartRoute() {
  const app = useAppState()
  const router = useRouter()
  return (
    <CartPage
      cart={app.cart}
      cartItemsCount={app.cartItemsCount}
      cartTotal={app.cartTotal}
      appliedCoupon={app.appliedCoupon}
      onCouponChange={app.setAppliedCoupon}
      handleRemoveFromCart={app.handleRemoveFromCart}
      handleUpdateCartQuantity={app.handleUpdateCartQuantity}
      onCheckout={() => router.push('/checkout')}
      theme={app.theme}
    />
  )
}
