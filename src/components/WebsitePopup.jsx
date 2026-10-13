'use client'

import { useState, useEffect } from 'react'
import { useLocation } from '@/lib/navigation'
import { X } from 'lucide-react'
import websitePopupsService from '../utils/websitePopupsService.js'

const STORAGE_KEY = 'website_popup_dismissed'

function getDismissedId() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function setDismissedId(id) {
  localStorage.setItem(STORAGE_KEY, id)
}

export default function WebsitePopup() {
  const location = useLocation()
  const [popup, setPopup] = useState(null)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  // Only show popup on the homepage
  const isHomepage = location.pathname === '/'

  useEffect(() => {
    const loadPopup = async () => {
      try {
        const popups = await websitePopupsService.getActivePopups()
        if (popups.length > 0) {
          // Use the most recently created active popup
          const target = popups[0]
          const dismissedId = getDismissedId()

          // Show popup if not already dismissed OR if it's a different popup
          if (dismissedId !== target.id) {
            setPopup(target)
            const delay = (target.displayDelay || 0) * 1000
            const timer = setTimeout(() => {
              setVisible(true)
            }, delay)
            return () => clearTimeout(timer)
          }
        }
      } catch (e) {
        console.error('Error loading website popup:', e)
      } finally {
        setLoading(false)
      }
    }
    loadPopup()
  }, [])

  const handleClose = () => {
    setVisible(false)
    if (popup?.id) {
      setDismissedId(popup.id)
    }
  }

  if (!isHomepage || loading || !popup || !visible) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Banner Image */}
        {popup.bannerImage && (
          <div className="w-full h-48 sm:h-56 overflow-hidden">
            <img
              src={popup.bannerImage}
              alt={popup.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            {popup.title}
          </h3>
          {popup.description && (
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
              {popup.description}
            </p>
          )}

          {popup.buttonText && popup.buttonUrl && (
            <a
              href={popup.buttonUrl}
              onClick={handleClose}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold rounded-xl hover:shadow-lg transition"
            >
              {popup.buttonText}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
