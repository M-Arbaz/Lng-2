'use client'

import { useNavigate } from '@/lib/navigation'

export default function CartPage({
  cart,
  cartItemsCount,
  cartTotal,
  handleRemoveFromCart,
  handleUpdateCartQuantity,
  onCheckout,
  theme = 'light',
}) {
  const navigate = useNavigate()

  const formatPrice = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return ''
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <section className={theme === 'dark' ? 'min-h-screen bg-[#1F1F1F] px-4 py-10 sm:px-6 sm:py-14' : 'min-h-screen px-4 py-10 sm:px-6 sm:py-14'}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className={theme === 'dark' ? 'text-xl sm:text-2xl font-semibold tracking-tight text-[#FFD400]' : 'text-xl sm:text-2xl font-semibold tracking-tight text-stone-900'}>Your Cart</h1>
            <p className={theme === 'dark' ? 'mt-1 text-xs sm:text-sm text-stone-400' : 'mt-1 text-xs sm:text-sm text-stone-500'}>
              Review your selected items, adjust quantities, and proceed to checkout.
            </p>
          </div>
          <p className={theme === 'dark' ? 'text-xs sm:text-sm text-stone-400' : 'text-xs sm:text-sm text-stone-500'}>
            {cartItemsCount === 0
              ? 'Your cart is empty.'
              : `${cartItemsCount} item${cartItemsCount > 1 ? 's' : ''} in cart`}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className={theme === 'dark' ? 'rounded-2xl border border-dashed border-stone-700 bg-[#2A2A2A] p-6 text-center text-sm text-stone-400' : 'rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500'}>
            <p>Your cart is empty. Start by adding a lamp, table, or decor piece.</p>
            <div className="mt-4 flex justify-center gap-3 text-xs">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center rounded-full bg-[#5A2D0C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#FFD400]"
              >
                Browse Products
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                View Categories
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 items-start">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className={theme === 'dark' ? 'flex gap-3 rounded-2xl border border-stone-700 bg-[#2A2A2A] p-3 sm:p-4' : 'flex gap-3 rounded-2xl border border-stone-200 bg-white p-3 sm:p-4'}
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 text-xs sm:text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={theme === 'dark' ? 'text-[11px] font-semibold uppercase tracking-wide text-[#FFD400]' : 'text-[11px] font-semibold uppercase tracking-wide text-[#5A2D0C]'}>
                          {item.product.category}
                        </p>
                        <h2 className={theme === 'dark' ? 'text-sm font-semibold text-stone-100' : 'text-sm font-semibold text-stone-900'}>{item.product.name}</h2>
                        {item.bulbOption && (
                          <p className={theme === 'dark' ? 'text-[11px] text-stone-400' : 'text-[11px] text-stone-500'}>{item.bulbOption}</p>
                        )}
                        {item.colorVariant && (
                          <p className={theme === 'dark' ? 'text-[11px] text-stone-400' : 'text-[11px] text-stone-500'}>Color: {item.colorVariant}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className={theme === 'dark' ? 'text-[11px] text-stone-400 hover:text-stone-200' : 'text-[11px] text-stone-500 hover:text-stone-800'}
                      >
                        Remove
                      </button>
                    </div>
                    <p className={theme === 'dark' ? 'text-xs text-stone-400' : 'text-xs text-stone-500'}>Rs.{formatPrice(item.unitPrice ?? item.product.price)} each</p>
                    <div className="mt-2 flex items-center gap-2">
                      <label className={theme === 'dark' ? 'text-[11px] text-stone-400' : 'text-[11px] text-stone-500'} htmlFor={`qty-${item.product.id}`}>
                        Qty
                      </label>
                      <input
                        id={`qty-${item.id}`}
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateCartQuantity(item.id, Number(e.target.value) || 1)
                        }
                        className={theme === 'dark' ? 'w-16 rounded-full border border-stone-600 bg-[#2A2A2A] px-2 py-1 text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#FFD400]' : 'w-16 rounded-full border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#FFD400]'}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className={theme === 'dark' ? 'rounded-2xl border border-[#FFD400]/30 bg-[#2A2A2A] p-4 flex flex-col gap-3 text-sm' : 'rounded-2xl border border-[#FFD400]/30 bg-[#F5F1EA]/70 p-4 flex flex-col gap-3 text-sm'}>
              <h2 className={theme === 'dark' ? 'text-sm font-semibold text-[#FFD400]' : 'text-sm font-semibold text-stone-900'}>Order Summary</h2>
              <div className={theme === 'dark' ? 'space-y-1 text-xs text-stone-300' : 'space-y-1 text-xs text-stone-700'}>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs.{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated shipping</span>
                  <span>{cartTotal >= 15000 ? 'Free' : 'Rs.12'}</span>
                </div>
                <div className={theme === 'dark' ? 'flex justify-between font-semibold pt-1 border-t border-[#FFD400]/30 mt-1 text-[#FFD400]' : 'flex justify-between font-semibold pt-1 border-t border-[#FFD400]/30 mt-1 text-[#5A2D0C]'}>
                  <span>Total</span>
                  <span>
                    Rs.{formatPrice(cartTotal + (cartTotal >= 15000 || cartTotal === 0 ? 0 : 12))}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onCheckout?.()}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-[#5A2D0C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#FFD400]"
              >
                Checkout
              </button>
              <button
                onClick={() => navigate('/')}
                className={theme === 'dark' ? 'inline-flex items-center justify-center rounded-full border border-amber-300 bg-[#2A2A2A] px-4 py-2 text-xs font-medium text-[#FFD400] hover:bg-amber-100' : 'inline-flex items-center justify-center rounded-full border border-amber-300 bg-[#F5F1EA] px-4 py-2 text-xs font-medium text-[#5A2D0C] hover:bg-amber-100'}
              >
                Continue Shopping
              </button>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}