'use client'

import { useNavigate } from '@/lib/navigation'

export default function OrdersPage({ orders, theme = 'light' }) {
  const navigate = useNavigate()

  return (
    <section className={theme === 'dark' ? 'w-full px-0 py-10 sm:py-14 bg-[#1F1F1F]' : 'w-full px-0 py-10 sm:py-14'}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className={theme === 'dark' ? 'text-xl sm:text-2xl font-semibold tracking-tight text-[#FFD400]' : 'text-xl sm:text-2xl font-semibold tracking-tight text-stone-900'}>My Orders</h1>
            <p className={theme === 'dark' ? 'mt-1 text-xs sm:text-sm text-stone-400' : 'mt-1 text-xs sm:text-sm text-stone-500'}>
              Track your orders and view details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={theme === 'dark' ? 'text-xs font-semibold text-stone-400 underline underline-offset-4 hover:text-stone-200' : 'text-xs font-semibold text-stone-500 underline underline-offset-4 hover:text-stone-800'}
          >
            Back
          </button>
        </div>

        {orders.length === 0 ? (
          <div className={theme === 'dark' ? 'mt-6 rounded-2xl border border-dashed border-stone-700 bg-[#2A2A2A] p-6 text-center text-sm text-stone-400' : 'mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500'}>
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={theme === 'dark' ? 'rounded-2xl border border-stone-700 bg-[#2A2A2A] p-4 sm:p-5 shadow-sm' : 'rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm'}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className={theme === 'dark' ? 'text-sm font-semibold text-stone-100' : 'text-sm font-semibold text-stone-900'}>Order #{order.id}</p>
                    <p className={theme === 'dark' ? 'mt-1 text-xs text-stone-400' : 'mt-1 text-xs text-stone-500'}>{order.date}</p>
                    {order.city ? (
                      <p className={theme === 'dark' ? 'mt-1 text-xs text-stone-400' : 'mt-1 text-xs text-stone-500'}>{order.city}{order.address ? `, ${order.address}` : ''}</p>
                    ) : null}
                  </div>

                  <div className="sm:text-right">
                    <p className={theme === 'dark' ? 'text-sm font-semibold text-[#FFD400]' : 'text-sm font-semibold text-[#5A2D0C]'}>
                      Rs.{Number(order.total ?? 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {order.status ? (
                      <span className={theme === 'dark' ? 'mt-2 inline-flex rounded-full bg-amber-900/30 px-2 py-1 text-[11px] font-semibold text-[#FFD400]' : 'mt-2 inline-flex rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-[#5A2D0C]'}>
                        {order.status}
                      </span>
                    ) : null}
                  </div>
                </div>

                {Array.isArray(order.items) && order.items.length > 0 ? (
                  <p className={theme === 'dark' ? 'mt-3 text-xs text-stone-400' : 'mt-3 text-xs text-stone-500'}>Items: {order.items.join(', ')}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}