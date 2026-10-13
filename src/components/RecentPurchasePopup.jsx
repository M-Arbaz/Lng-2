'use client'

import { useEffect, useRef, useState } from 'react'
import { Link } from '@/lib/navigation'
import { X } from 'lucide-react'
import { slugify } from '../utils/slugify.js'

const FIRST_NAMES = [
  'Ahmed', 'Ali', 'Hassan', 'Hussain', 'Bilal', 'Usman', 'Zain', 'Hamza',
  'Ayesha', 'Fatima', 'Maryam', 'Noor', 'Hira', 'Sana', 'Iqra', 'Maham',
  'Abdullah', 'Saad', 'Talha', 'Sajid',
];

const LAST_NAMES = [
  'Khan', 'Hamza', 'Malik', 'Butt', 'Chaudhry', 'Sheikh', 'Qureshi',
  'Siddiqui', 'Raza', 'Shah', 'Abbasi', 'Farooq', 'Iqbal', 'Akhtar',
  'Mirza', 'Awan', 'Bukhari', 'Hashmi', 'Ansari', 'Rehan',
];

const LOCATIONS = [
  'Lahore Punjab 25-Mall Road',
  'Karachi Sindh 112-Clifton Block 5',
  'Islamabad ICT 45-Blue Area',
  'Rawalpindi Punjab 88-Murree Road',
  'Faisalabad Punjab 210-D Ground',
  'Multan Punjab 15-Bosan Road',
  'Peshawar KPK 60-University Road',
  'Quetta Balochistan 18-Jinnah Road',
  'Sialkot Punjab 120-Cantt',
  'Gujranwala Punjab 33-GT Road',
  'Hyderabad Sindh 90-Auto Bhan Road',
  'Bahawalpur Punjab 11-Circular Road',
  'Sargodha Punjab 72-University Road',
  'Abbottabad KPK 50-Mansehra Road',
  'Gujrat Punjab 140-Bhimber Road',
];


function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildRandomPurchase(products) {
  const product = randomItem(products)
  return {
    id: `${Date.now()}-${Math.random()}`,
    name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    location: randomItem(LOCATIONS),
    productName: product.name,
    productImage: product.image || (product.images && product.images[0]) || '',
    productLink: `/products/${slugify(product.name)}`,
    minutesAgo: Math.floor(Math.random() * 58) + 2,
  }
}

const VISIBLE_MS = 6000
const MIN_GAP_MS = 10000
const MAX_GAP_MS = 15000
const INITIAL_DELAY_MS = 5000

export default function RecentPurchasePopup({ products }) {
  const [purchase, setPurchase] = useState(null)
  const [visible, setVisible] = useState(false)
  const stoppedRef = useRef(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const validProducts = (products || []).filter((p) => p.name && (p.image || (p.images && p.images[0])))
    if (validProducts.length === 0) return undefined

    const showNext = () => {
      if (stoppedRef.current) return
      setPurchase(buildRandomPurchase(validProducts))
      setVisible(true)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        const gap = MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS)
        timerRef.current = setTimeout(showNext, gap)
      }, VISIBLE_MS)
    }

    timerRef.current = setTimeout(showNext, INITIAL_DELAY_MS)

    return () => {
      clearTimeout(timerRef.current)
    }
  }, [products])

  const handleClose = () => {
    stoppedRef.current = true
    clearTimeout(timerRef.current)
    setVisible(false)
  }

  if (!purchase) return null

  return (
    <div
      className={`fixed z-40 bottom-6 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 sm:w-[380px] transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="relative flex items-center gap-4 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-4 pr-6">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Dismiss"
          className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-white hover:bg-stone-700 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <Link
          to={purchase.productLink}
          className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-stone-50 ring-1 ring-stone-200 hover:ring-[#FFD400] transition-colors"
        >
          {purchase.productImage ? (
            <img src={purchase.productImage} alt={purchase.productName} className="h-full w-full object-cover" />
          ) : null}
        </Link>

        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-stone-500 leading-snug">
            <span className="font-medium text-stone-600">{purchase.name}</span> in {purchase.location} purchased a
          </p>
          <Link
            to={purchase.productLink}
            className="block text-sm sm:text-base font-bold text-stone-900 mt-0.5 truncate hover:text-[#FFA200] transition-colors"
          >
            {purchase.productName}
          </Link>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            About <span className="font-semibold text-[#FFA200]">{purchase.minutesAgo}</span> minutes ago
          </p>
        </div>
      </div>
    </div>
  )
}
