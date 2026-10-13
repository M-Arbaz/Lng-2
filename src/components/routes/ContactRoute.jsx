'use client'

import ContactPage from '@/pages/ContactPage'
import { useAppState } from '@/context/AppStateContext'

export default function ContactRoute() {
  const { theme } = useAppState()
  return <ContactPage theme={theme} />
}
