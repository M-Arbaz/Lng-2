import { db } from './firebase'

import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore'

import {
  uploadToXcdn,
} from './xcdnUpload'

const DOC_ID = 'aboutPage'
const COLLECTION = 'settings'

export const ABOUT_SECTION_KEYS = [
  'hero',
  'stats',
  'story',
  'mission',
  'values',
  'milestones',
  'team',
  'cta',
]

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`
}

export function getDefaultAboutData() {
  return {
    sectionOrder: [
      'hero',
      'stats',
      'story',
      'mission',
      'values',
      'milestones',
      'team',
      'cta',
    ],

    sectionVisibility: {
      hero: true,
      stats: true,
      story: true,
      mission: true,
      values: true,
      milestones: true,
      team: true,
      cta: true,
    },

    // Hero
    heroBadge: 'Our Story',

    heroTitle:
      'We Believe Every Home Deserves Warmth',

    heroDescription:
      '<p>Lamp & Glow is more than a brand — it is a celebration of craftsmanship, light, and the beauty of natural materials.</p>',

    heroImage: '',
    heroImageAlt: 'Lamp & Glow',

    heroPrimaryLabel:
      'Explore Collection',

    heroPrimaryLink:
      '/collections',

    heroSecondaryLabel:
      'Get in Touch',

    heroSecondaryLink:
      '/contact',

    // Stats
    stats: [
      {
        id: 'happy-customers',
        value: '8000',
        suffix: '+',
        label: 'Happy Customers',
        isActive: true,
      },
      {
        id: 'products-crafted',
        value: '500',
        suffix: '+',
        label: 'Products Crafted',
        isActive: true,
      },
      {
        id: 'average-rating',
        value: '4.9',
        suffix: '★',
        label: 'Average Rating',
        isActive: true,
      },
      {
        id: 'years-craft',
        value: '3',
        suffix: '+',
        label: 'Years of Craft',
        isActive: true,
      },
    ],

    // Story
    storyEyebrow:
      'Our Beginning',

    storyTitle:
      'From a Small Workshop to Your Living Room',

    storyContent:
      '<p>Lamp & Glow began with a simple idea: create warm, meaningful pieces that make a house feel like home.</p><p>Every design reflects careful craftsmanship, natural materials and attention to detail.</p>',

    storyImage: '',
    storyImageAlt:
      'Lamp & Glow craftsmanship',

    // Mission / Vision
    missionTitle:
      'Our Mission',

    missionContent:
      '<p>To create thoughtful lighting and decor that brings warmth, character and craftsmanship into everyday spaces.</p>',

    visionTitle:
      'Our Vision',

    visionContent:
      '<p>To become a trusted destination for timeless handcrafted home pieces while supporting quality craftsmanship and meaningful design.</p>',

    missionImage: '',
    missionImageAlt:
      'Lamp & Glow mission',

    // Values
    valuesTitle:
      'Our Core Values',

    valuesSubtitle:
      'Every decision we make is guided by these principles.',

    values: [
      {
        id: 'authentic-craft',
        icon: '🪵',
        title: 'Authentic Craft',
        description:
          'Every piece is thoughtfully crafted with attention to materials, finish and detail.',
        isActive: true,
      },
      {
        id: 'timeless-design',
        icon: '🎨',
        title: 'Timeless Design',
        description:
          'We create pieces designed to feel relevant and beautiful for years.',
        isActive: true,
      },
      {
        id: 'community-first',
        icon: '🤝',
        title: 'Community First',
        description:
          'We value the customers and craftspeople who make Lamp & Glow possible.',
        isActive: true,
      },
      {
        id: 'sustainable',
        icon: '🌱',
        title: 'Sustainable Mindset',
        description:
          'We aim to make thoughtful choices around materials, production and waste.',
        isActive: true,
      },
    ],

    // Milestones
    milestonesEyebrow:
      'Our Milestones',

    milestonesTitle:
      'The Journey So Far',

    milestones: [
      {
        id: 'milestone-2021',
        year: '2021',
        title: 'The Spark',
        description:
          'Lamp & Glow began with a passion for handcrafted lighting and wooden decor.',
        isActive: true,
      },
      {
        id: 'milestone-2022',
        year: '2022',
        title: 'First Customers',
        description:
          'Our growing customer community gave us the confidence to expand.',
        isActive: true,
      },
      {
        id: 'milestone-2023',
        year: '2023',
        title: 'Expanded Collection',
        description:
          'The collection grew from lamps into more home decor and furniture pieces.',
        isActive: true,
      },
      {
        id: 'milestone-2024',
        year: '2024',
        title: 'Growing Community',
        description:
          'More homes across Pakistan became part of the Lamp & Glow story.',
        isActive: true,
      },
      {
        id: 'milestone-2025',
        year: '2025',
        title: 'Online Store',
        description:
          'Lamp & Glow expanded its digital experience to make discovering our work easier.',
        isActive: true,
      },
    ],

    // Team
    teamTitle:
      'Meet the Team',

    teamSubtitle:
      'A passionate team behind every piece that reaches your home.',

    team: [
      {
        id: 'team-1',
        name: 'Ayesha Khan',
        role:
          'Founder & Creative Director',
        bio:
          'A passion for handcrafted design and warm interiors inspired the Lamp & Glow journey.',
        image: '',
        imageAlt: 'Team member',
        isActive: true,
      },
      {
        id: 'team-2',
        name: 'Usman Ali',
        role:
          'Head of Craftsmanship',
        bio:
          'Focused on quality, detail and craftsmanship across every piece.',
        image: '',
        imageAlt: 'Team member',
        isActive: true,
      },
      {
        id: 'team-3',
        name: 'Zara Tariq',
        role:
          'Customer Experience',
        bio:
          'Helping customers enjoy a smooth experience from discovery to delivery.',
        image: '',
        imageAlt: 'Team member',
        isActive: true,
      },
    ],

    // CTA
    ctaTitle:
      'Ready to Bring Warmth Into Your Home?',

    ctaDescription:
      '<p>Explore our collection and find the perfect piece for your space.</p>',

    ctaPrimaryLabel:
      'Shop Now',

    ctaPrimaryLink:
      '/collections',

    ctaSecondaryLabel:
      'Contact Us',

    ctaSecondaryLink:
      '/contact',
  }
}

function normalizeArray(
  value,
  fallback,
  prefix
) {
  if (!Array.isArray(value)) {
    return fallback.map(
      (item) => ({
        ...item,
      })
    )
  }

  return value.map(
    (item, index) => ({
      ...item,

      id:
        item?.id ||
        `${prefix}-${index + 1}`,
    })
  )
}

export function normalizeAboutData(
  raw = {}
) {
  const defaults =
    getDefaultAboutData()

  const rawOrder =
    Array.isArray(
      raw.sectionOrder
    )
      ? raw.sectionOrder.filter(
        (key) =>
          ABOUT_SECTION_KEYS.includes(
            key
          )
      )
      : []

  const sectionOrder = [
    ...new Set([
      ...rawOrder,
      ...ABOUT_SECTION_KEYS,
    ]),
  ]

  return {
    ...defaults,
    ...raw,

    sectionOrder,

    sectionVisibility: {
      ...defaults.sectionVisibility,
      ...(raw.sectionVisibility ||
        {}),
    },

    stats: normalizeArray(
      raw.stats,
      defaults.stats,
      'stat'
    ),

    values: normalizeArray(
      raw.values,
      defaults.values,
      'value'
    ),

    milestones:
      normalizeArray(
        raw.milestones,
        defaults.milestones,
        'milestone'
      ),

    team: normalizeArray(
      raw.team,
      defaults.team,
      'team'
    ),
  }
}

export function createAboutItemId(
  prefix
) {
  return makeId(prefix)
}

export const aboutService = {
  getAboutPage: async () => {
    try {
      const docRef = doc(
        db,
        COLLECTION,
        DOC_ID
      )

      const docSnap =
        await getDoc(docRef)

      if (!docSnap.exists()) {
        return normalizeAboutData({})
      }

      return normalizeAboutData(
        docSnap.data()
      )
    } catch (error) {
      console.error(
        'Error getting about page:',
        error
      )

      throw error
    }
  },

  /*
   * Frontend can receive Admin
   * changes without requiring
   * another page reload.
   */
  subscribeAboutPage: (
    callback,
    onError
  ) => {
    const docRef = doc(
      db,
      COLLECTION,
      DOC_ID
    )

    return onSnapshot(
      docRef,

      (snapshot) => {
        const data =
          snapshot.exists()
            ? snapshot.data()
            : {}

        callback(
          normalizeAboutData(
            data
          )
        )
      },

      (error) => {
        console.error(
          'About page realtime subscription failed:',
          error
        )

        if (onError) {
          onError(error)
        }
      }
    )
  },

  updateAboutPage:
    async (data) => {
      try {
        const docRef = doc(
          db,
          COLLECTION,
          DOC_ID
        )

        const docSnap =
          await getDoc(docRef)

        const normalized =
          normalizeAboutData(
            data
          )

        const now =
          new Date().toISOString()

        const payload = {
          ...normalized,
          updatedAt: now,
        }

        if (!docSnap.exists()) {
          payload.createdAt =
            now
        }

        await setDoc(
          docRef,
          payload,
          {
            merge: true,
          }
        )

        return payload
      } catch (error) {
        console.error(
          'Error saving about page:',
          error
        )

        throw error
      }
    },

  uploadImage: async (
    file
  ) => {
    if (!file) {
      throw new Error(
        'No About page image selected'
      )
    }

    try {
      const url =
        await uploadToXcdn(
          file,
          'about'
        )

      if (!url) {
        throw new Error(
          'XCDN did not return an image URL'
        )
      }

      return url
    } catch (error) {
      console.error(
        'Error uploading About page image to XCDN:',
        error
      )

      throw error
    }
  },
}

export default aboutService