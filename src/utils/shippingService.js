import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'

// Single settings document holding all shipping configuration.
// NOTE: this assumes `db` (Firestore instance) is exported from utils/firebase.js,
// the same way `storage` is. If your firebase.js exports it under a different
// name, just update the import above.
const SHIPPING_DOC_COLLECTION = 'settings'
const SHIPPING_DOC_ID = 'shipping'

const DEFAULT_SHIPPING_SETTINGS = {
  cities: [],
  freeShippingThreshold: 15000,
}

const shippingService = {
  /**
   * Fetch current shipping settings (cities + their fees, free shipping threshold).
   * Falls back to sane defaults if nothing has been saved yet, or on error.
   */
  async getShippingSettings() {
    try {
      const ref = doc(db, SHIPPING_DOC_COLLECTION, SHIPPING_DOC_ID)
      const snap = await getDoc(ref)

      if (!snap.exists()) {
        return { ...DEFAULT_SHIPPING_SETTINGS }
      }

      const data = snap.data()
      const cities = Array.isArray(data.cities)
        ? data.cities
            .filter((c) => c && typeof c.name === 'string' && c.name.trim())
            .map((c) => ({
              id: c.id || `${c.name}-${Date.now()}`,
              name: c.name,
              fee: typeof c.fee === 'number' ? c.fee : parseFloat(c.fee) || 0,
            }))
        : []

      const freeShippingThreshold =
        typeof data.freeShippingThreshold === 'number'
          ? data.freeShippingThreshold
          : DEFAULT_SHIPPING_SETTINGS.freeShippingThreshold

      return { cities, freeShippingThreshold }
    } catch (err) {
      console.error('Error fetching shipping settings:', err)
      return { ...DEFAULT_SHIPPING_SETTINGS }
    }
  },

  /**
   * Persist shipping settings. `settings` should be { cities, freeShippingThreshold }.
   */
  async saveShippingSettings(settings) {
    const ref = doc(db, SHIPPING_DOC_COLLECTION, SHIPPING_DOC_ID)
    const payload = {
      cities: (settings.cities || []).map((c) => ({
        id: c.id,
        name: c.name,
        fee: typeof c.fee === 'number' ? c.fee : parseFloat(c.fee) || 0,
      })),
      freeShippingThreshold:
        typeof settings.freeShippingThreshold === 'number'
          ? settings.freeShippingThreshold
          : parseFloat(settings.freeShippingThreshold) || 0,
    }
    await setDoc(ref, payload, { merge: true })
    return payload
  },
}

export default shippingService