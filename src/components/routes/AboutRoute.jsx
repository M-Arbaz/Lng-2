'use client'

import AboutPage from '@/views/AboutPage'
import { useAppState } from '@/context/AppStateContext'

export default function AboutRoute() {
  const { theme } = useAppState()
  return <AboutPage theme={theme} />
}
