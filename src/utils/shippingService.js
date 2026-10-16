import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'

import { db } from './firebase.js'

const SHIPPING_DOC_COLLECTION =
  'settings'

const SHIPPING_DOC_ID =
  'shipping'

const DEFAULT_METHODS = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    enabled: true,
    rateType: 'city',
    flatFee: 0,
    deliveryEstimate:
      '3–5 business days',
    description:
      'Reliable doorstep delivery across supported cities.',
    policy: '',
  },
]

const DEFAULT_SHIPPING_SETTINGS = {
  cities: [],
  methods: DEFAULT_METHODS,
  freeShippingEnabled: true,
  freeShippingThreshold: 15000,
}

function toNonNegativeNumber(
  value,
  fallback = 0
) {
  const parsed =
    Number(value)

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return fallback
  }

  return parsed
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createStableId(
  prefix,
  value,
  index
) {
  const slug =
    slugify(value)

  return `${prefix}-${slug || 'item'}-${index + 1}`
}

function normalizeCity(
  city,
  index
) {
  if (
    !city ||
    typeof city !== 'object'
  ) {
    return null
  }

  const name =
    String(
      city.name || ''
    ).trim()

  if (!name) {
    return null
  }

  return {
    id:
      String(
        city.id || ''
      ).trim() ||
      createStableId(
        'city',
        name,
        index
      ),

    name,

    fee:
      toNonNegativeNumber(
        city.fee,
        0
      ),
  }
}

function normalizeMethod(
  method,
  index
) {
  if (
    !method ||
    typeof method !== 'object'
  ) {
    return null
  }

  const name =
    String(
      method.name || ''
    ).trim()

  if (!name) {
    return null
  }

  const rateType =
    method.rateType ===
      'flat'
      ? 'flat'
      : 'city'

  return {
    id:
      String(
        method.id || ''
      ).trim() ||
      createStableId(
        'method',
        name,
        index
      ),

    name,

    enabled:
      method.enabled !==
      false,

    rateType,

    flatFee:
      toNonNegativeNumber(
        method.flatFee,
        0
      ),

    deliveryEstimate:
      String(
        method.deliveryEstimate ||
        ''
      ).trim(),

    description:
      String(
        method.description ||
        ''
      ).trim(),

    policy:
      String(
        method.policy || ''
      ).trim(),
  }
}

export function normalizeShippingSettings(
  data = {}
) {
  const cities =
    Array.isArray(
      data.cities
    )
      ? data.cities
        .map(
          normalizeCity
        )
        .filter(Boolean)
      : []

  /*
   * Important legacy behavior:
   *
   * Old shipping documents do not
   * contain a `methods` field.
   *
   * In that case we automatically
   * expose Standard Delivery so
   * existing checkout data keeps
   * working.
   *
   * If Admin explicitly saves an
   * empty methods array, however,
   * we respect that choice.
   */
  const methods =
    Array.isArray(
      data.methods
    )
      ? data.methods
        .map(
          normalizeMethod
        )
        .filter(Boolean)
      : DEFAULT_METHODS.map(
        (method) => ({
          ...method,
        })
      )

  return {
    cities,

    methods,

    freeShippingEnabled:
      data.freeShippingEnabled !==
      false,

    freeShippingThreshold:
      toNonNegativeNumber(
        data.freeShippingThreshold,
        DEFAULT_SHIPPING_SETTINGS
          .freeShippingThreshold
      ),

    updatedAt:
      data.updatedAt || null,
  }
}

function createDefaultSettings() {
  return {
    cities: [],

    methods:
      DEFAULT_METHODS.map(
        (method) => ({
          ...method,
        })
      ),

    freeShippingEnabled:
      DEFAULT_SHIPPING_SETTINGS
        .freeShippingEnabled,

    freeShippingThreshold:
      DEFAULT_SHIPPING_SETTINGS
        .freeShippingThreshold,

    updatedAt: null,
  }
}

const shippingService = {
  async getShippingSettings() {
    try {
      const ref =
        doc(
          db,
          SHIPPING_DOC_COLLECTION,
          SHIPPING_DOC_ID
        )

      const snapshot =
        await getDoc(ref)

      if (
        !snapshot.exists()
      ) {
        return createDefaultSettings()
      }

      return normalizeShippingSettings(
        snapshot.data()
      )
    } catch (error) {
      console.error(
        'Error fetching shipping settings:',
        error
      )

      return createDefaultSettings()
    }
  },

  async saveShippingSettings(
    settings
  ) {
    const normalized =
      normalizeShippingSettings({
        ...settings,

        /*
         * Passing an explicit array
         * is important so Admin can
         * intentionally save zero
         * shipping methods.
         */
        cities:
          Array.isArray(
            settings?.cities
          )
            ? settings.cities
            : [],

        methods:
          Array.isArray(
            settings?.methods
          )
            ? settings.methods
            : [],
      })

    const payload = {
      cities:
        normalized.cities,

      methods:
        normalized.methods,

      freeShippingEnabled:
        normalized
          .freeShippingEnabled,

      freeShippingThreshold:
        normalized
          .freeShippingThreshold,

      updatedAt:
        new Date().toISOString(),
    }

    const ref =
      doc(
        db,
        SHIPPING_DOC_COLLECTION,
        SHIPPING_DOC_ID
      )

    await setDoc(
      ref,
      payload,
      {
        merge: true,
      }
    )

    return payload
  },

  calculateShippingQuote(
    settings,
    {
      cityName = '',
      methodId = '',
      subtotal = 0,
    } = {}
  ) {
    const normalized =
      normalizeShippingSettings(
        settings || {}
      )

    const activeMethods =
      normalized.methods.filter(
        (method) =>
          method.enabled !==
          false
      )

    const method =
      activeMethods.find(
        (item) =>
          item.id ===
          methodId
      ) || null

    const city =
      normalized.cities.find(
        (item) =>
          String(
            item.name || ''
          )
            .trim()
            .toLowerCase() ===
          String(
            cityName || ''
          )
            .trim()
            .toLowerCase()
      ) || null

    const cleanSubtotal =
      toNonNegativeNumber(
        subtotal,
        0
      )

    const threshold =
      normalized
        .freeShippingThreshold

    const qualifiesForFreeShipping =
      normalized
        .freeShippingEnabled &&
      cleanSubtotal >=
      threshold

    if (!method) {
      return {
        method: null,
        city,
        fee: null,

        qualifiesForFreeShipping,

        freeShippingEnabled:
          normalized
            .freeShippingEnabled,

        freeShippingThreshold:
          threshold,
      }
    }

    if (
      qualifiesForFreeShipping
    ) {
      return {
        method,
        city,
        fee: 0,

        qualifiesForFreeShipping:
          true,

        freeShippingEnabled:
          normalized
            .freeShippingEnabled,

        freeShippingThreshold:
          threshold,
      }
    }

    if (
      method.rateType ===
      'flat'
    ) {
      return {
        method,
        city,

        fee:
          toNonNegativeNumber(
            method.flatFee,
            0
          ),

        qualifiesForFreeShipping:
          false,

        freeShippingEnabled:
          normalized
            .freeShippingEnabled,

        freeShippingThreshold:
          threshold,
      }
    }

    return {
      method,
      city,

      fee:
        city
          ? toNonNegativeNumber(
            city.fee,
            0
          )
          : null,

      qualifiesForFreeShipping:
        false,

      freeShippingEnabled:
        normalized
          .freeShippingEnabled,

      freeShippingThreshold:
        threshold,
    }
  },
}

export {
  DEFAULT_SHIPPING_SETTINGS,
  DEFAULT_METHODS,
}

export default shippingService