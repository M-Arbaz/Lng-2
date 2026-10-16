'use client'

import { useEffect, useState } from 'react'
import PublicContentLayout from '../components/PublicContentLayout'
import shippingPolicyService from '../utils/shippingPolicyService.js'

export default function ShippingPolicyPage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const data =
          await shippingPolicyService.getPolicy()

        if (data?.content) {
          setContent(data.content)
        }
      } catch (error) {
        console.error(
          'Error loading shipping policy:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    loadPolicy()
  }, [])

  return (
    <PublicContentLayout
      title="Shipping Policy"
      description="Everything you need to know about delivery, shipping charges and order fulfilment."
      content={content}
      loading={loading}
      emptyMessage="Shipping policy information will be available soon."
    />
  )
}