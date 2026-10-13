'use client'

import CollectionsPage from '@/pages/CollectionsPage'
import { useAppState } from '@/context/AppStateContext'

export default function CollectionsRoute() {
  const { theme } = useAppState()
  return <CollectionsPage theme={theme} />
}
