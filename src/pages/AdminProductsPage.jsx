'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, AlertCircle, CheckCircle, ImagePlus, Loader2, Tag, Sparkles, Percent } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import RichTextEditor from '../components/RichTextEditor.jsx'
import productsService from '../utils/productsService.js'
import categoriesService from '../utils/categoriesService.js'
import { uploadToXcdn } from '../utils/xcdnUpload.js'
import { calculateFinalPrice } from '../utils/discountHelpers.js'
const htmlToPlainText = (value = '') => {
  return String(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number(code))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16))
    )
    .replace(/\s+/g, ' ')
    .trim()
}
export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [imageUploading, setImageUploading] = useState(false)

  const [colorImageUploading, setColorImageUploading] = useState(false)
  const [shadeImageUploading, setShadeImageUploading] = useState(false)

  const [colorImagePreview, setColorImagePreview] = useState('')
  const [shadeImagePreview, setShadeImagePreview] = useState('')

  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    shortDescription: '',
    images: [],
    stock: '',
    status: 'active',
    discountType: '',
    discountValue: '',
    sku: '',
    productType: '',
    isNewArrival: false,
    isDiscounted: false,
    bulbEnabled: false,
    bulbPrice: '',
    colorVariants: [],
    shadeColors: [],
    dimensions: {
      width: '',
      height: '',
      depth: '',
      weight: '',
      unit: 'cm',
      weightUnit: 'kg',
      notes: ''
    },
    videos: [],
    videoUrl: '',
    whyLoveItems: [
      'Sculptural Simplicity – Smooth, rounded wood base in rich tones that ground your space',
      'Soft Diffused Light – Wide shade offers an elegant glow, ideal for evening ambience',
      'Handcrafted Quality – Each piece is individually made with care and attention to detail',
      'Versatile Placement – Perfect for living rooms, bedrooms, reading corners, and offices'
    ],
    careInstructions: [
      'Wipe wood with a dry or lightly damp cloth',
      'Dust shade gently with a soft brush or lint-free cloth',
      'Avoid exposure to moisture or direct sunlight'
    ],
    noteText: 'Note: Each base is handcrafted and may display subtle variations in wood grain and tone — part of its natural charm.',
    freeShippingContent: 'Free standard shipping on orders over 10,000 PKR\n\nAll in-stock products will be delivered within 3 to 5 days. Custom designs will take 8 to 12 days to complete and ship.',
    freeReturnsContent: 'At Lamp&Glow, we stand by the quality of our handcrafted wooden lamps and want you to be completely satisfied with your purchase.\n\nYou may return most new, unopened items within 7 days of delivery for a full refund. If the return is due to our error, we will cover the return shipping costs.\n\nHow to Initiate a Return:\n1. Log in to your account.\n2. Navigate to the "Complete Orders" section under My Account.\n3. Click the "Return Item(s)" button and follow the instructions.\n4. You will receive an email notification once your return has been processed.',
    ourPromiseContent: 'Every product is handcrafted with premium-quality wood and materials. We ensure:\n\n- Built and shipped within 3-5 business days.\n- Quality check before every dispatch.\n- Dedicated customer support via WhatsApp and email.',
    shippingReturnContent: 'Returns Policy:\nYou may return most new, unopened items within 7 days of delivery for a full refund. We\'ll also pay the return shipping costs if the return is a result of our error (you received an incorrect or defective item, etc.).\n\nYou should expect to receive your refund within four weeks of giving your package to the return shipper.\n\nShipping:\nWe can ship to virtually any address in Pakistan. Free standard shipping on orders over 10,000 PKR. Orders are typically dispatched within 1-2 business days.\n\nAll in-stock products will be delivered within 3 to 5 days. Custom designs will take 8 to 12 days to complete and ship.',
  })

  // Load products from Firebase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await productsService.getAllProducts()
        setProducts(data)
      } catch (e) {
        console.error('Error loading products:', e)
        setMessage({ type: 'error', text: 'Failed to load products from Firebase' })
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Load categories from Firebase for dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true)
        const data = await categoriesService.getAllCategories()
        setCategories(data)
      } catch (e) {
        console.error('Error loading categories:', e)
        setMessage({ type: 'error', text: 'Failed to load categories from Firebase' })
      } finally {
        setCategoriesLoading(false)
      }
    }
    loadCategories()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      // Auto-calculate final price when discount fields change
      if (name === 'price' || name === 'discountType' || name === 'discountValue') {
        const base = parseFloat(next.price)
        if (!Number.isNaN(base) && base > 0 && next.discountType && next.discountValue) {
          next.finalPrice = String(calculateFinalPrice(base, next.discountType, next.discountValue))
        } else {
          next.finalPrice = next.price
        }
      }
      return next
    })
  }

  // Upload images to New CDN by Arbaz Storage and store download URLs
  const handleImageUpload = async (e) => {
    const files =
      Array.from(e.target.files)

    if (files.length === 0) return

    setImageUploading(true)

    try {

      const uploadPromises =
        files.map(
          (file) =>
            uploadToXcdn(
              file,
              'products'
            )
        )

      const urls =
        await Promise.all(
          uploadPromises
        )

      setFormData((prev) => ({
        ...prev,
        images: [
          ...prev.images,
          ...urls,
        ],
      }))

    } catch (err) {

      console.error(
        'Error uploading images:',
        err
      )

      setMessage({
        type: 'error',
        text:
          `Image upload failed: ${err.message}`,
      })

    } finally {

      setImageUploading(false)

      e.target.value = ''
    }
  }

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  // Upload video to Firebase Storage
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-m4v',
    ]
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload a valid video file (MP4, WebM, OGG, MOV)' })
      return
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'Video file size must be less than 50MB' })
      return
    }

    // Check if already have 3 videos
    if (formData.videos.length >= 3) {
      setMessage({ type: 'error', text: 'Maximum 3 videos allowed per product' })
      return
    }

    setImageUploading(true)
    try {
      const url =
        await uploadToXcdn(
          file,
          'product-videos'
        )
      setFormData((prev) => ({
        ...prev,
        videos: [...prev.videos, url],
      }))
      setMessage({ type: 'success', text: 'Video uploaded successfully!' })
    } catch (err) {
      console.error('Error uploading video:', err)
      setMessage({ type: 'error', text: `Video upload failed: ${err.message}` })
    } finally {
      setImageUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveVideo = (index) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }))
  }

  // Helper: upload a base64/data URL image to Firebase Storage
  const uploadBase64Image = async (dataUrl) => {

    const response =
      await fetch(dataUrl)

    const blob =
      await response.blob()

    const ext =
      dataUrl
        .split(';')[0]
        .split('/')[1] || 'png'

    const file =
      new File(
        [blob],
        `image.${ext}`,
        {
          type:
            blob.type ||
            `image/${ext}`,
        }
      )

    return uploadToXcdn(
      file,
      'products'
    )
  }
  const saveProduct = async (statusOverride = null) => {
    if (!formData.name.trim() || !formData.category.trim() || !formData.price.trim() || !formData.stock.trim()) {
      setMessage({ type: 'error', text: 'Please fill all required fields (Name, Category, Price, Stock)' })
      return
    }

    setSaving(true)

    try {
      // Migrate any base64 images to Storage URLs before saving
      let finalImages = formData.images
      if (finalImages.some((img) => img.startsWith('data:'))) {
        finalImages = await Promise.all(
          finalImages.map(async (img) => {
            if (img.startsWith('data:')) {
              return uploadBase64Image(img)
            }
            return img
          })
        )
      }

      const basePrice = parseFloat(formData.price)
      const discountType = formData.discountType || ''
      const discountValue = parseFloat(formData.discountValue)
      const finalPrice = calculateFinalPrice(basePrice, discountType, discountValue)

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        originalPrice: basePrice,
        price: finalPrice,
        discountType: discountType || null,
        discountValue: discountType && !Number.isNaN(discountValue) ? discountValue : null,
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim(),
        stock: parseInt(formData.stock, 10),
        status: statusOverride || formData.status,
        sku: formData.sku.trim() || null,
        productType: formData.productType.trim() || null,
        images: finalImages,
        image: finalImages[0] || '',
        isNewArrival: formData.isNewArrival === true,
        isDiscounted: formData.isDiscounted === true,
        bulbEnabled: formData.bulbEnabled === true,
        bulbPrice: formData.bulbEnabled ? parseFloat(formData.bulbPrice) || 0 : null,
        productDetails: {
          ...(formData.colorVariants.length > 0
            ? { colorVariants: formData.colorVariants }
            : {}),
        },
        whyLoveItems: formData.whyLoveItems || [],
        careInstructions: formData.careInstructions || [],
        noteText: formData.noteText || '',
        freeShippingContent: formData.freeShippingContent || '',
        freeReturnsContent: formData.freeReturnsContent || '',
        ourPromiseContent: formData.ourPromiseContent || '',
        shippingReturnContent: formData.shippingReturnContent || '',
        dimensions: formData.dimensions || {},
        shadeColors: formData.shadeColors || [],
        videos: formData.videos || [],
      }

      if (editingId) {
        // Update existing product in Firebase
        await productsService.updateProduct(editingId, payload)
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? { ...p, ...payload, updatedAt: new Date().toISOString() }
              : p
          )
        )
        setMessage({ type: 'success', text: 'Product updated successfully!' })
        setEditingId(null)
      } else {
        // Add new product to Firebase
        const newProduct = await productsService.createProduct(payload)
        setProducts((prev) => [newProduct, ...prev])
        const actionText = (statusOverride || formData.status) === 'draft' ? 'saved as draft' : 'published'
        setMessage({ type: 'success', text: `Product ${actionText} successfully!` })
      }

      resetForm()
    } catch (error) {
      console.error('Error saving product:', error)
      setMessage({ type: 'error', text: 'Failed to save product. Please try again.' })
    } finally {
      setSaving(false)
    }

    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await saveProduct()
  }

  const handleSaveAsDraft = async (e) => {
    e.preventDefault()
    await saveProduct('draft')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      shortDescription: '',
      images: [],
      stock: '',
      status: 'active',
      discountType: '',
      discountValue: '',
      sku: '',
      productType: '',
      isNewArrival: false,
      isDiscounted: false,
      bulbEnabled: false,
      bulbPrice: '',
      colorVariants: [],
      shadeColors: [],
      dimensions: {
        width: '',
        height: '',
        depth: '',
        weight: '',
        unit: 'cm',
        weightUnit: 'kg',
        notes: ''
      },
      videos: [],
      videoUrl: '',
      whyLoveItems: [
        'Sculptural Simplicity – Smooth, rounded wood base in rich tones that ground your space',
        'Soft Diffused Light – Wide shade offers an elegant glow, ideal for evening ambience',
        'Handcrafted Quality – Each piece is individually made with care and attention to detail',
        'Versatile Placement – Perfect for living rooms, bedrooms, reading corners, and offices'
      ],
      careInstructions: [
        'Wipe wood with a dry or lightly damp cloth',
        'Dust shade gently with a soft brush or lint-free cloth',
        'Avoid exposure to moisture or direct sunlight'
      ],
      noteText: 'Note: Each base is handcrafted and may display subtle variations in wood grain and tone — part of its natural charm.',
      freeShippingContent: 'Free standard shipping on orders over 10,000 PKR\n\nAll in-stock products will be delivered within 3 to 5 days. Custom designs will take 8 to 12 days to complete and ship.',
      freeReturnsContent: 'At Lamp&Glow, we stand by the quality of our handcrafted wooden lamps and want you to be completely satisfied with your purchase.\n\nYou may return most new, unopened items within 7 days of delivery for a full refund. If the return is due to our error, we will cover the return shipping costs.\n\nHow to Initiate a Return:\n1. Log in to your account.\n2. Navigate to the "Complete Orders" section under My Account.\n3. Click the "Return Item(s)" button and follow the instructions.\n4. You will receive an email notification once your return has been processed.',
      ourPromiseContent: 'Every product is handcrafted with premium-quality wood and materials. We ensure:\n\n- Built and shipped within 3-5 business days.\n- Quality check before every dispatch.\n- Dedicated customer support via WhatsApp and email.',
      shippingReturnContent: 'Returns Policy:\nYou may return most new, unopened items within 7 days of delivery for a full refund. We\'ll also pay the return shipping costs if the return is a result of our error (you received an incorrect or defective item, etc.).\n\nYou should expect to receive your refund within four weeks of giving your package to the return shipper.\n\nShipping:\nWe can ship to virtually any address in Pakistan. Free standard shipping on orders over 10,000 PKR. Orders are typically dispatched within 1-2 business days.\n\nAll in-stock products will be delivered within 3 to 5 days. Custom designs will take 8 to 12 days to complete and ship.',
    })
    setColorImagePreview('')
    setShadeImagePreview('')

    setColorImageUploading(false)
    setShadeImageUploading(false)
    setShowForm(false)
  }

  const handleEdit = (product) => {
    const images = product.images || (product.image ? [product.image] : [])

    // Migrate legacy compareAtPrice to new discount fields on edit
    let basePrice = product.originalPrice ?? product.price ?? ''
    let discountType = product.discountType || ''
    let discountValue = product.discountValue ?? ''

    if (!product.discountType && typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price) {
      basePrice = product.compareAtPrice
      const pct = ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      if (Number.isInteger(pct)) {
        discountType = 'percentage'
        discountValue = pct
      } else {
        discountType = 'fixed'
        discountValue = Math.round((product.compareAtPrice - product.price) * 100) / 100
      }
    }

    const finalPrice = calculateFinalPrice(
      typeof basePrice === 'number' ? basePrice : parseFloat(basePrice),
      discountType,
      typeof discountValue === 'number' ? discountValue : parseFloat(discountValue)
    )

    const existingColorVariants = Array.isArray(product.productDetails?.colorVariants)
      ? product.productDetails.colorVariants
      : []

    setFormData({
      name: product.name || '',
      category: product.category || '',
      price: String(basePrice),
      discountType,
      discountValue: String(discountValue),
      finalPrice: String(finalPrice || basePrice),
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      stock: String(product.stock ?? ''),
      status: product.status || 'active',
      sku: product.sku || '',
      productType: product.productType || '',
      images,
      isNewArrival: product.isNewArrival === true,
      isDiscounted: product.isDiscounted === true,
      bulbEnabled: product.bulbEnabled === true,
      bulbPrice: product.bulbPrice != null ? String(product.bulbPrice) : '',
      colorVariants: existingColorVariants,
      shadeColors: Array.isArray(product.shadeColors) ? product.shadeColors : [],
      dimensions: product.dimensions || {
        width: '',
        height: '',
        depth: '',
        weight: '',
        unit: 'cm',
        weightUnit: 'kg',
        notes: ''
      },
      videos: Array.isArray(product.videos)
        ? product.videos
        : (product.videoUrl ? [product.videoUrl] : []),
      videoUrl: '',
      whyLoveItems: Array.isArray(product.whyLoveItems) ? product.whyLoveItems : [
        'Sculptural Simplicity – Smooth, rounded wood base in rich tones that ground your space',
        'Soft Diffused Light – Wide shade offers an elegant glow, ideal for evening ambience',
        'Handcrafted Quality – Each piece is individually made with care and attention to detail',
        'Versatile Placement – Perfect for living rooms, bedrooms, reading corners, and offices'
      ],
      careInstructions: Array.isArray(product.careInstructions) ? product.careInstructions : [
        'Wipe wood with a dry or lightly damp cloth',
        'Dust shade gently with a soft brush or lint-free cloth',
        'Avoid exposure to moisture or direct sunlight'
      ],
      noteText: product.noteText || 'Note: Each base is handcrafted and may display subtle variations in wood grain and tone — part of its natural charm.',
      freeShippingContent: product.freeShippingContent || 'Free standard shipping on orders over 10,000 PKR\n\nAll in-stock products will be delivered within 3 to 5 days. Custom designs will take 8 to 12 days to complete and ship.',
      freeReturnsContent: product.freeReturnsContent || 'At Lamp&Glow, we stand by the quality of our handcrafted wooden lamps and want you to be completely satisfied with your purchase.\n\nYou may return most new, unopened items within 7 days of delivery for a full refund. If the return is due to our error, we will cover the return shipping costs.\n\nHow to Initiate a Return:\n1. Log in to your account.\n2. Navigate to the "Complete Orders" section under My Account.\n3. Click the "Return Item(s)" button and follow the instructions.\n4. You will receive an email notification once your return has been processed.',
      ourPromiseContent: product.ourPromiseContent || 'Every product is handcrafted with premium-quality wood and materials. We ensure:\n\n- Built and shipped within 3-5 business days.\n- Quality check before every dispatch.\n- Dedicated customer support via WhatsApp and email.',
      shippingReturnContent: product.shippingReturnContent || 'Returns Policy:\nYou may return most new, unopened items within 7 days of delivery for a full refund. We\'ll also pay the return shipping costs if the return is a result of our error (you received an incorrect or defective item, etc.).\n\nYou should expect to receive your refund within four weeks of giving your package to the return shipper.\n\nShipping:\nWe can ship to virtually any address in Pakistan. Free standard shipping on orders over 10,000 PKR. Orders are typically dispatched within 1-2 business days.\n\nAll in-stock products will be delivered within 3 to 5 days. Custom designs will take 8 to 12 days to complete and ship.',
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsService.deleteProduct(id)
        setProducts((prev) => prev.filter((p) => p.id !== id))
        setMessage({ type: 'success', text: 'Product deleted successfully!' })
      } catch (error) {
        console.error('Error deleting product:', error)
        setMessage({ type: 'error', text: 'Failed to delete product. Please try again.' })
      }
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    }
  }

  const handlePublish = async (product) => {
    try {
      const payload = { ...product, status: 'active' }
      await productsService.updateProduct(product.id, payload)
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: 'active' } : p))
      )
      setMessage({ type: 'success', text: 'Product published successfully!' })
    } catch (error) {
      console.error('Error publishing product:', error)
      setMessage({ type: 'error', text: 'Failed to publish product. Please try again.' })
    }
    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  const handleToggleNewArrival = async (product) => {
    try {
      const next = !product.isNewArrival
      await productsService.toggleNewArrival(product.id, next)
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isNewArrival: next } : p))
      )
      setMessage({ type: 'success', text: `Product ${next ? 'marked as' : 'removed from'} New Arrivals` })
    } catch (error) {
      console.error('Error toggling new arrival:', error)
      setMessage({ type: 'error', text: 'Failed to update New Arrival status' })
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleToggleDiscounted = async (product) => {
    try {
      const next = !product.isDiscounted
      await productsService.toggleDiscounted(product.id, next)
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isDiscounted: next } : p))
      )
      setMessage({ type: 'success', text: `Product ${next ? 'marked as' : 'removed from'} Discounted` })
    } catch (error) {
      console.error('Error toggling discounted:', error)
      setMessage({ type: 'error', text: 'Failed to update Discounted status' })
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.sku?.toLowerCase().includes(query)

    if (!matchesSearch) return false

    if (statusFilter === 'newArrivals') return p.isNewArrival === true
    if (statusFilter === 'discounted') return p.isDiscounted === true
    return true
  })

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) return product.images[0]
    if (product.image) return product.image
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#E6DDD6] bg-[#FFFEFC] px-5 py-6 shadow-[0_10px_35px_rgba(58,33,23,0.05)] sm:px-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#DCC8BA]/25 blur-3xl"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-[#E5D8CF] bg-[#F7F4EF] px-3 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#795D4D]">
                  Catalogue Management
                </span>
              </div>

              <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#281912] sm:text-3xl">
                Products
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#806C61]">
                Manage your Lamp & Glow catalogue, inventory,
                pricing, variants and storefront product status.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#E3D8D0] bg-white px-3 py-1 text-xs font-medium text-[#6D584C]">
                  {products.length} Total Products
                </span>

                <span className="rounded-full border border-[#CFE0D1] bg-[#F1F8F2] px-3 py-1 text-xs font-medium text-[#4D7155]">
                  {
                    products.filter(
                      (product) => product.status === 'active'
                    ).length
                  } Active
                </span>

                <span className="rounded-full border border-[#E8DAB9] bg-[#FFF8E8] px-3 py-1 text-xs font-medium text-[#82651E]">
                  {
                    products.filter(
                      (product) => product.status === 'draft'
                    ).length
                  } Draft
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="inline-flex min-h-[46px] flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(58,33,23,0.20)] transition hover:bg-[#4C2D21] hover:shadow-[0_14px_30px_rgba(58,33,23,0.25)]"
            >
              <Plus className="h-4.5 w-4.5" />
              Add Product
            </button>
          </div>
        </section>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${message.type === 'success'
              ? 'border-[#C8DEC9] bg-[#F2F9F2]'
              : 'border-[#E5C3BB] bg-[#FFF3F0]'
              }`}
          >
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${message.type === 'success'
                ? 'bg-[#DCEEDD]'
                : 'bg-[#F7DDD8]'
                }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-4.5 w-4.5 text-[#4B7453]" />
              ) : (
                <AlertCircle className="h-4.5 w-4.5 text-[#A24F43]" />
              )}
            </div>

            <div>
              <p
                className={`text-sm font-semibold ${message.type === 'success'
                  ? 'text-[#3F6747]'
                  : 'text-[#874239]'
                  }`}
              >
                {message.type === 'success'
                  ? 'Success'
                  : 'Something needs attention'}
              </p>

              <p
                className={`mt-0.5 text-xs leading-5 ${message.type === 'success'
                  ? 'text-[#628069]'
                  : 'text-[#9B6259]'
                  }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        )}
        {/* Add/Edit Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#281912]/55 p-3 backdrop-blur-[2px] sm:p-5">
            <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[26px] border border-[#E6DCD4] bg-[#FFFEFC] shadow-[0_30px_90px_rgba(40,25,18,0.30)]">
              {/* Fixed Form Header */}
              <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-[#E8DED7] bg-[#3A2117] px-5 py-4 text-white sm:px-7 sm:py-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#CEBBAF]">
                    Product Management
                  </p>

                  <h3 className="mt-1 truncate text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                  </h3>

                  <p className="mt-1 hidden text-xs text-[#CEBBAF] sm:block">
                    {editingId
                      ? 'Update product information, media, variants and storefront settings.'
                      : 'Create a new product with media, pricing, variants and storefront details.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close product form"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleSubmit}
                className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7 sm:py-7"
              >                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categoriesLoading ? (
                        <option disabled>Loading categories...</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Code / SKU
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="e.g. LAMP-001"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Product Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Type
                    </label>
                    <input
                      type="text"
                      name="productType"
                      value={formData.productType}
                      onChange={handleInputChange}
                      placeholder="e.g. Floor Lamp, Table Lamp, Pendant Light"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Price (Base / Original) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (Rs) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Type
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">No Discount</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder={formData.discountType === 'percentage' ? 'e.g. 10' : formData.discountType === 'fixed' ? 'e.g. 500' : 'Select discount type first'}
                      step="0.01"
                      min="0"
                      disabled={!formData.discountType}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>

                  {/* Final Price (Auto-calculated) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Final Price (Rs)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={
                        formData.price
                          ? `Rs.${Number(formData.finalPrice || formData.price).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`
                          : ''
                      }
                      className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  {/* Product Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="active">Active (Published)</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  {/* New Arrival Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isNewArrival"
                      name="isNewArrival"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isNewArrival: e.target.checked }))}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="isNewArrival" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Sparkles size={14} className="text-[#FFD400]" />
                      New Arrival
                    </label>
                  </div>

                  {/* Discounted Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDiscounted"
                      name="isDiscounted"
                      checked={formData.isDiscounted}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isDiscounted: e.target.checked }))}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="isDiscounted" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Percent size={14} className="text-red-500" />
                      Discounted Product
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))}
                    placeholder="Enter product description..."
                    minHeight={200}
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description (optional)
                  </label>
                  <RichTextEditor
                    value={formData.shortDescription}
                    onChange={(html) => setFormData((prev) => ({ ...prev, shortDescription: html }))}
                    placeholder="Enter a brief product summary (shown below reviews)..."
                    minHeight={140}
                  />
                  <p className="text-xs text-gray-500 mt-1">This will appear at the top of the reviews section</p>
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Videos (optional) - Max 3
                  </label>

                  {/* Video URL Input */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                      placeholder="Paste YouTube/Vimeo URL here..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.videoUrl && formData.videos.length < 3) {
                          setFormData((prev) => ({
                            ...prev,
                            videos: [...prev.videos, prev.videoUrl],
                            videoUrl: '',
                          }))
                        }
                      }}
                      disabled={!formData.videoUrl || formData.videos.length >= 3}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* File Upload Button */}
                  <div className="flex items-center gap-3 mb-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        disabled={imageUploading || formData.videos.length >= 3}
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600">Upload Video from PC ({formData.videos.length}/3)</span>
                      </div>
                    </label>
                  </div>

                  {/* Video List */}
                  {formData.videos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600">Added Videos:</p>
                      {formData.videos.map((video, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-600 flex-1 truncate">
                            {video.includes('youtube') || video.includes('vimeo') ? 'Embedded Video' : `Video ${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(idx)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                            title="Remove video"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-1">Upload up to 3 videos (MP4, WebM) or add YouTube/Vimeo URLs</p>
                </div>

                {/* Multiple Images Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Product Images
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {/* Upload Button */}
                    <label className={`w-32 h-32 border-2 border-dashed rounded-lg transition flex flex-col items-center justify-center text-center cursor-pointer ${imageUploading ? 'border-orange-300 bg-orange-50' : 'border-gray-300 hover:border-orange-500'}`}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={imageUploading}
                      />
                      {imageUploading ? (
                        <Loader2 className="w-6 h-6 text-orange-500 animate-spin mb-1" />
                      ) : (
                        <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
                      )}
                      <span className="text-xs text-gray-500">
                        {imageUploading ? 'Uploading...' : 'Add Images'}
                      </span>
                    </label>

                    {/* Image Previews */}
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative w-32 h-32 rounded-lg overflow-hidden border-2 transition" style={{ borderColor: idx === 0 ? '#FF8C00' : '#e5e7eb' }}>
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition flex flex-col gap-1 justify-center items-center opacity-0 hover:opacity-100">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [...formData.images]
                                  ;[newImages[idx], newImages[idx - 1]] = [newImages[idx - 1], newImages[idx]]
                                setFormData((prev) => ({ ...prev, images: newImages }))
                              }}
                              className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition text-xs"
                              title="Move up"
                            >
                              ↑
                            </button>
                          )}
                          {idx < formData.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [...formData.images]
                                  ;[newImages[idx], newImages[idx + 1]] = [newImages[idx + 1], newImages[idx]]
                                setFormData((prev) => ({ ...prev, images: newImages }))
                              }}
                              className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition text-xs"
                              title="Move down"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="bg-red-500 text-white rounded-full p-1 hover:bg-[#E53935] transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        {idx === 0 && <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">Main</div>}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">First image will be the main product image. Use ↑↓ buttons to reorder images.</p>
                </div>

                {/* Bulb Settings */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Bulb Option</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Enable bulb selection for this product</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.bulbEnabled}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bulbEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  {formData.bulbEnabled && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bulb Price (Rs)
                      </label>
                      <input
                        type="number"
                        name="bulbPrice"
                        value={formData.bulbPrice}
                        onChange={handleInputChange}
                        placeholder="e.g. 500"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Price added when customer selects "Include Bulb"</p>
                    </div>
                  )}
                </div>

                {/* Color Variants */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Color Variants</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Add color options with their own product images</p>
                    </div>
                  </div>

                  {/* Existing Color Variants List */}
                  {formData.colorVariants.length > 0 && (
                    <div className="space-y-2">
                      {formData.colorVariants.map((variant, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                            <img src={variant.image} alt={variant.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{variant.name}</p>
                            <p className="text-xs text-gray-500 truncate">{variant.image}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({
                              ...prev,
                              colorVariants: prev.colorVariants.filter((_, i) => i !== idx),
                            }))}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Remove color variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Color Variant */}
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Add New Color Variant</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Color Name</label>
                        <input
                          type="text"
                          id="newColorName"
                          placeholder="e.g. Brown, Black, White"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Color Image URL</label>
                        <input
                          type="text"
                          id="newColorImage"
                          placeholder="https://... or upload below"
                          onChange={(e) => setColorImagePreview(e.target.value.trim())}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4228]"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                      {/* Upload Area */}
                      <label
                        className={`flex min-h-24 flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition ${colorImageUploading
                          ? 'cursor-not-allowed border-[#CDBDB2] bg-[#F7F4EF]'
                          : 'cursor-pointer border-[#D8CEC7] bg-[#FFFEFC] hover:border-[#6B4228] hover:bg-[#FAF7F3]'
                          }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          id="newColorImageUpload"
                          className="hidden"
                          disabled={colorImageUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]

                            if (!file) return

                            const localPreview = URL.createObjectURL(file)

                            setColorImagePreview(localPreview)
                            setColorImageUploading(true)

                            try {
                              const url = await uploadToXcdn(
                                file,
                                'color-variants'
                              )

                              const imageInput =
                                document.getElementById('newColorImage')

                              if (imageInput) {
                                imageInput.value = url
                              }

                              setColorImagePreview(url)
                            } catch (err) {
                              console.error(
                                'Color variant image upload failed:',
                                err
                              )

                              setColorImagePreview('')

                              setMessage({
                                type: 'error',
                                text: `Color image upload failed: ${err.message}`,
                              })
                            } finally {
                              setColorImageUploading(false)

                              URL.revokeObjectURL(localPreview)

                              e.target.value = ''
                            }
                          }}
                        />

                        {colorImageUploading ? (
                          <>
                            <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#6B4228]" />

                            <span className="text-xs font-semibold text-[#6B4228]">
                              Uploading...
                            </span>

                            <span className="mt-1 text-[10px] text-[#988479]">
                              Please wait
                            </span>
                          </>
                        ) : (
                          <>
                            <ImagePlus className="mb-2 h-6 w-6 text-[#8C776B]" />

                            <span className="text-xs font-semibold text-[#4D392F]">
                              Upload Color Image
                            </span>

                            <span className="mt-1 text-[10px] text-[#988479]">
                              Click to select an image
                            </span>
                          </>
                        )}
                      </label>

                      {/* Selected Image Preview */}
                      {colorImagePreview && (
                        <div className="relative h-24 w-full overflow-hidden rounded-xl border border-[#DDD2CA] bg-[#F4EFEB] sm:w-28">
                          <img
                            src={colorImagePreview}
                            alt="Selected color preview"
                            className="h-full w-full object-cover"
                          />

                          {colorImageUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#281912]/40 backdrop-blur-[1px]">
                              <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                          )}

                          {!colorImageUploading && (
                            <div className="absolute bottom-1.5 left-1.5 rounded-md bg-[#3A2117]/90 px-2 py-1 text-[9px] font-semibold text-white">
                              Preview
                            </div>
                          )}
                        </div>
                      )}

                      {/* Add Color */}
                      <button
                        type="button"
                        disabled={colorImageUploading}
                        onClick={() => {
                          const nameInput =
                            document.getElementById('newColorName')

                          const imageInput =
                            document.getElementById('newColorImage')

                          const name =
                            nameInput?.value.trim() || ''

                          const image =
                            imageInput?.value.trim() || ''

                          if (!name || !image) {
                            setMessage({
                              type: 'error',
                              text: 'Please enter both color name and image.',
                            })

                            return
                          }

                          setFormData((prev) => ({
                            ...prev,
                            colorVariants: [
                              ...prev.colorVariants,
                              {
                                name,
                                image,
                              },
                            ],
                          }))

                          nameInput.value = ''
                          imageInput.value = ''

                          setColorImagePreview('')

                          setMessage({
                            type: '',
                            text: '',
                          })
                        }}
                        className="min-h-12 rounded-xl bg-[#3A2117] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4D2D21] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-24"
                      >
                        {colorImageUploading
                          ? 'Uploading...'
                          : 'Add Color'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Shade Colors */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Shade Colors</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Add shade/light color options (shown with color variants)</p>
                    </div>
                  </div>

                  {/* Existing Shade Colors List */}
                  {formData.shadeColors.length > 0 && (
                    <div className="space-y-2">
                      {formData.shadeColors.map((shade, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                            <img src={shade.image} alt={shade.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{shade.name}</p>
                            <p className="text-xs text-gray-500 truncate">{shade.image}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({
                              ...prev,
                              shadeColors: prev.shadeColors.filter((_, i) => i !== idx),
                            }))}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Remove shade color"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Shade Color */}
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Add New Shade Color</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Shade Name</label>
                        <input
                          type="text"
                          id="newShadeName"
                          placeholder="e.g. Warm White, Cool White, Natural"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Shade Image URL</label>
                        <input
                          type="text"
                          id="newShadeImage"
                          placeholder="https://... or upload below"
                          onChange={(e) => setShadeImagePreview(e.target.value.trim())}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4228]"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                      {/* Upload Area */}
                      <label
                        className={`flex min-h-24 flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition ${shadeImageUploading
                          ? 'cursor-not-allowed border-[#CDBDB2] bg-[#F7F4EF]'
                          : 'cursor-pointer border-[#D8CEC7] bg-[#FFFEFC] hover:border-[#6B4228] hover:bg-[#FAF7F3]'
                          }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          id="newShadeImageUpload"
                          className="hidden"
                          disabled={shadeImageUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]

                            if (!file) return

                            const localPreview = URL.createObjectURL(file)

                            setShadeImagePreview(localPreview)
                            setShadeImageUploading(true)

                            try {
                              const url = await uploadToXcdn(
                                file,
                                'shade-colors'
                              )

                              const imageInput =
                                document.getElementById('newShadeImage')

                              if (imageInput) {
                                imageInput.value = url
                              }

                              setShadeImagePreview(url)
                            } catch (err) {
                              console.error(
                                'Shade image upload failed:',
                                err
                              )

                              setShadeImagePreview('')

                              setMessage({
                                type: 'error',
                                text: `Shade image upload failed: ${err.message}`,
                              })
                            } finally {
                              setShadeImageUploading(false)

                              URL.revokeObjectURL(localPreview)

                              e.target.value = ''
                            }
                          }}
                        />

                        {shadeImageUploading ? (
                          <>
                            <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#6B4228]" />

                            <span className="text-xs font-semibold text-[#6B4228]">
                              Uploading...
                            </span>

                            <span className="mt-1 text-[10px] text-[#988479]">
                              Please wait
                            </span>
                          </>
                        ) : (
                          <>
                            <ImagePlus className="mb-2 h-6 w-6 text-[#8C776B]" />

                            <span className="text-xs font-semibold text-[#4D392F]">
                              Upload Shade Image
                            </span>

                            <span className="mt-1 text-[10px] text-[#988479]">
                              Click to select an image
                            </span>
                          </>
                        )}
                      </label>

                      {/* Selected Image Preview */}
                      {shadeImagePreview && (
                        <div className="relative h-24 w-full overflow-hidden rounded-xl border border-[#DDD2CA] bg-[#F4EFEB] sm:w-28">
                          <img
                            src={shadeImagePreview}
                            alt="Selected shade preview"
                            className="h-full w-full object-cover"
                          />

                          {shadeImageUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#281912]/40 backdrop-blur-[1px]">
                              <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                          )}

                          {!shadeImageUploading && (
                            <div className="absolute bottom-1.5 left-1.5 rounded-md bg-[#3A2117]/90 px-2 py-1 text-[9px] font-semibold text-white">
                              Preview
                            </div>
                          )}
                        </div>
                      )}

                      {/* Add Shade */}
                      <button
                        type="button"
                        disabled={shadeImageUploading}
                        onClick={() => {
                          const nameInput =
                            document.getElementById('newShadeName')

                          const imageInput =
                            document.getElementById('newShadeImage')

                          const name =
                            nameInput?.value.trim() || ''

                          const image =
                            imageInput?.value.trim() || ''

                          if (!name || !image) {
                            setMessage({
                              type: 'error',
                              text: 'Please enter both shade name and image.',
                            })

                            return
                          }

                          setFormData((prev) => ({
                            ...prev,
                            shadeColors: [
                              ...prev.shadeColors,
                              {
                                name,
                                image,
                              },
                            ],
                          }))

                          nameInput.value = ''
                          imageInput.value = ''

                          setShadeImagePreview('')

                          setMessage({
                            type: '',
                            text: '',
                          })
                        }}
                        className="min-h-12 rounded-xl bg-[#3A2117] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4D2D21] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-24"
                      >
                        {shadeImageUploading
                          ? 'Uploading...'
                          : 'Add Shade'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Why You'll Love It Items */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">"Why You'll Love It" Items</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Edit the list items shown on the product detail page</p>
                  </div>
                  <div className="space-y-2">
                    {formData.whyLoveItems.map((item, idx) => (
                      <div key={`whyLove-${idx}`} className="flex items-center gap-2">
                        <span className="text-[#FFD400] text-xs shrink-0">✦</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...formData.whyLoveItems]
                            newItems[idx] = e.target.value
                            setFormData((prev) => ({ ...prev, whyLoveItems: newItems }))
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        {formData.whyLoveItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({
                              ...prev,
                              whyLoveItems: prev.whyLoveItems.filter((_, i) => i !== idx),
                            }))}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({
                        ...prev,
                        whyLoveItems: [...prev.whyLoveItems, ''],
                      }))}
                      className="text-sm text-orange-500 font-semibold hover:text-orange-600 transition"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>

                {/* Care to Instructions */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Care Instructions</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Edit the care instructions shown on the product detail page</p>
                  </div>
                  <div className="space-y-2">
                    {formData.careInstructions.map((item, idx) => (
                      <div key={`care-${idx}`} className="flex items-center gap-2">
                        <span className="text-stone-600 text-xs shrink-0">•</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...formData.careInstructions]
                            newItems[idx] = e.target.value
                            setFormData((prev) => ({ ...prev, careInstructions: newItems }))
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        {formData.careInstructions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({
                              ...prev,
                              careInstructions: prev.careInstructions.filter((_, i) => i !== idx),
                            }))}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({
                        ...prev,
                        careInstructions: [...prev.careInstructions, ''],
                      }))}
                      className="text-sm text-orange-500 font-semibold hover:text-orange-600 transition"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Product Dimensions</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Add product measurements (shown in Dimension tab)</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
                      <input
                        type="text"
                        value={formData.dimensions.width}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, width: e.target.value }
                        }))}
                        placeholder="e.g. 30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
                      <input
                        type="text"
                        value={formData.dimensions.height}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, height: e.target.value }
                        }))}
                        placeholder="e.g. 45"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Depth</label>
                      <input
                        type="text"
                        value={formData.dimensions.depth}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, depth: e.target.value }
                        }))}
                        placeholder="e.g. 30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Weight</label>
                      <input
                        type="text"
                        value={formData.dimensions.weight}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, weight: e.target.value }
                        }))}
                        placeholder="e.g. 2.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Dimension Unit</label>
                      <select
                        value={formData.dimensions.unit}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, unit: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="cm">Centimeters (cm)</option>
                        <option value="inch">Inches (in)</option>
                        <option value="mm">Millimeters (mm)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Weight Unit</label>
                      <select
                        value={formData.dimensions.weightUnit}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, weightUnit: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="lb">Pounds (lb)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Additional Notes (optional)</label>
                    <textarea
                      value={formData.dimensions.notes}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, notes: e.target.value }
                      }))}
                      placeholder="e.g. Dimensions may vary slightly due to handcrafted nature"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                    />
                  </div>
                </div>

                {/* Note Text */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Bottom Note Text</h4>
                    <p className="text-xs text-gray-500 mt-0.5">The italic note shown at the bottom of the Description tab</p>
                  </div>
                  <textarea
                    value={formData.noteText}
                    onChange={(e) => setFormData((prev) => ({ ...prev, noteText: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y text-sm"
                  />
                </div>

                {/* Accordion Content */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Free Shipping Accordion Content</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Content shown in the Free Shipping accordion on product detail page</p>
                  </div>
                  <RichTextEditor
                    value={formData.freeShippingContent}
                    onChange={(html) => setFormData((prev) => ({ ...prev, freeShippingContent: html }))}
                    minHeight={120}
                  />
                </div>

                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Free Returns Accordion Content</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Content shown in the Free Returns accordion on product detail page</p>
                  </div>
                  <RichTextEditor
                    value={formData.freeReturnsContent}
                    onChange={(html) => setFormData((prev) => ({ ...prev, freeReturnsContent: html }))}
                    minHeight={160}
                  />
                </div>

                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Our Promise Accordion Content</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Content shown in the Our Promise accordion on product detail page</p>
                  </div>
                  <RichTextEditor
                    value={formData.ourPromiseContent}
                    onChange={(html) => setFormData((prev) => ({ ...prev, ourPromiseContent: html }))}
                    minHeight={120}
                  />
                </div>

                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Shipping & Return Tab Content</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Content shown in the Shipping & Return tab on product detail page</p>
                  </div>
                  <RichTextEditor
                    value={formData.shippingReturnContent}
                    onChange={(html) => setFormData((prev) => ({ ...prev, shippingReturnContent: html }))}
                    minHeight={220}
                  />
                </div>
                {/* Sticky Action Footer */}
                <div className="sticky -bottom-6 z-30 -mx-5 mt-8 border-t border-[#E5DAD2] bg-[#FFFEFC]/95 px-5 py-4 shadow-[0_-12px_30px_rgba(58,33,23,0.08)] backdrop-blur-xl sm:-bottom-7 sm:-mx-7 sm:px-7">
                  <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#DCCFC6] bg-white px-5 text-sm font-semibold text-[#5A4438] transition hover:border-[#BDA99C] hover:bg-[#F7F4EF] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveAsDraft}
                      disabled={
                        saving ||
                        imageUploading ||
                        colorImageUploading ||
                        shadeImageUploading
                      } className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#BDAA9D] bg-[#F3EDE8] px-5 text-sm font-semibold text-[#3A2117] transition hover:bg-[#EAE0D9] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving && formData.status === 'draft' && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}

                      Save as Draft
                    </button>

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        imageUploading ||
                        colorImageUploading ||
                        shadeImageUploading
                      } className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(58,33,23,0.20)] transition hover:bg-[#4C2D21] hover:shadow-[0_12px_28px_rgba(58,33,23,0.26)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving && formData.status !== 'draft' && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}

                      {editingId ? 'Update & Publish' : 'Publish Product'}
                    </button>
                  </div>

                  {imageUploading && (
                    <p className="mt-2 text-right text-[11px] text-[#8A7468]">
                      Please wait for media uploads to finish before saving.
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <section className="rounded-[22px] border border-[#E7DED7] bg-[#FFFEFC] p-4 shadow-[0_8px_28px_rgba(58,33,23,0.04)] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="relative w-full xl:max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9A877B]" />

              <input
                type="text"
                placeholder="Search by product name, category, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-xl border border-[#DDD2CA] bg-[#FCFAF8] pl-11 pr-10 text-sm text-[#34241C] outline-none transition placeholder:text-[#AE9B90] focus:border-[#8B6855] focus:bg-white focus:ring-4 focus:ring-[#6B4228]/10"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#9A877B] transition hover:bg-[#EEE6E0] hover:text-[#3A2117]"
                  aria-label="Clear product search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`inline-flex min-h-[40px] items-center justify-center rounded-xl border px-4 text-xs font-semibold transition ${statusFilter === 'all'
                  ? 'border-[#3A2117] bg-[#3A2117] text-white shadow-sm'
                  : 'border-[#DDD2CA] bg-white text-[#685449] hover:border-[#BFA99C] hover:bg-[#F8F4F1]'
                  }`}
              >
                All Products
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${statusFilter === 'all'
                    ? 'bg-white/15 text-white'
                    : 'bg-[#F1EBE6] text-[#725D51]'
                    }`}
                >
                  {products.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('newArrivals')}
                className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border px-4 text-xs font-semibold transition ${statusFilter === 'newArrivals'
                  ? 'border-[#8B6B31] bg-[#8B6B31] text-white shadow-sm'
                  : 'border-[#DDD2CA] bg-white text-[#685449] hover:border-[#C8B37E] hover:bg-[#FFF9ED]'
                  }`}
              >
                <Sparkles className="h-3.5 w-3.5" />

                New Arrivals

                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${statusFilter === 'newArrivals'
                    ? 'bg-white/15 text-white'
                    : 'bg-[#F5ECD7] text-[#806429]'
                    }`}
                >
                  {
                    products.filter(
                      (product) => product.isNewArrival === true
                    ).length
                  }
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('discounted')}
                className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border px-4 text-xs font-semibold transition ${statusFilter === 'discounted'
                  ? 'border-[#934E43] bg-[#934E43] text-white shadow-sm'
                  : 'border-[#DDD2CA] bg-white text-[#685449] hover:border-[#D6A59D] hover:bg-[#FFF4F1]'
                  }`}
              >
                <Percent className="h-3.5 w-3.5" />

                On Sale

                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${statusFilter === 'discounted'
                    ? 'bg-white/15 text-white'
                    : 'bg-[#F9E8E4] text-[#8D4C42]'
                    }`}
                >
                  {
                    products.filter(
                      (product) => product.isDiscounted === true
                    ).length
                  }
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[22px] border border-[#E7DED7] bg-[#FFFEFC]"
              >
                <div className="aspect-[4/3] animate-pulse bg-[#EEE7E1]" />

                <div className="space-y-3 p-5">
                  <div className="h-4 w-20 animate-pulse rounded bg-[#EEE7E1]" />

                  <div className="h-6 w-3/4 animate-pulse rounded bg-[#EEE7E1]" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-[#F2ECE7]" />

                  <div className="mt-4 h-10 animate-pulse rounded-xl bg-[#EEE7E1]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full flex min-h-[340px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#D7C9C0] bg-[#FFFEFC] px-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2EBE6]">
                  <Search className="h-6 w-6 text-[#80685A]" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-[#34241C]">
                  No products found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#958176]">
                  {searchQuery
                    ? 'No products match your current search. Try another keyword or clear the filters.'
                    : statusFilter !== 'all'
                      ? 'There are no products in this filter right now.'
                      : 'Your catalogue is currently empty. Add your first Lamp & Glow product to get started.'}
                </p>

                {(searchQuery || statusFilter !== 'all') ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                    }}
                    className="mt-5 inline-flex min-h-[42px] items-center justify-center rounded-xl border border-[#D6C9C0] bg-white px-5 text-sm font-semibold text-[#523C31] transition hover:border-[#BFA99C] hover:bg-[#F7F4EF]"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm()
                      setShowForm(true)
                    }}
                    className="mt-5 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 text-sm font-semibold text-white transition hover:bg-[#4C2D21]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map((product) => {
                const productImage = getProductImage(product)

                const productPrice = Number(product.price || 0)

                const originalPrice = Number(
                  product.originalPrice || 0
                )

                const stock = Number(product.stock || 0)

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[22px] border border-[#E7DED7] bg-[#FFFEFC] shadow-[0_8px_28px_rgba(58,33,23,0.045)] transition duration-200 hover:-translate-y-0.5 hover:border-[#D3C1B5] hover:shadow-[0_16px_42px_rgba(58,33,23,0.09)]"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F2ECE7]">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                            <ImagePlus className="h-5 w-5 text-[#927C6F]" />
                          </div>

                          <p className="mt-3 text-xs font-medium text-[#9A867B]">
                            No product image
                          </p>
                        </div>
                      )}

                      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                        {/* Product Status */}
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] shadow-sm backdrop-blur-md ${product.status === 'active'
                            ? 'border-[#C7DDC9] bg-[#F2F9F2]/95 text-[#47704F]'
                            : product.status === 'draft'
                              ? 'border-[#E7D7AD] bg-[#FFF8E8]/95 text-[#80631E]'
                              : 'border-[#E4C5BE] bg-[#FFF2EF]/95 text-[#924F44]'
                            }`}
                        >
                          {product.status === 'active'
                            ? 'Active'
                            : product.status === 'draft'
                              ? 'Draft'
                              : 'Inactive'}
                        </span>

                        <div className="flex flex-wrap justify-end gap-1.5">
                          {product.isNewArrival && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#E4D4A8] bg-[#FFF8E7]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.07em] text-[#7E611C] shadow-sm backdrop-blur-md">
                              <Sparkles className="h-3 w-3" />
                              New
                            </span>
                          )}

                          {product.isDiscounted && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#E3BEB7] bg-[#FFF0ED]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.07em] text-[#934E43] shadow-sm backdrop-blur-md">
                              <Percent className="h-3 w-3" />
                              Sale
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Content */}
                    <div className="p-5">
                      {/* Category */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#917C70]">
                            {product.category || 'Uncategorized'}
                          </p>

                          <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-6 text-[#2F2019]">
                            {product.name}
                          </h3>
                        </div>
                      </div>

                      {/* SKU */}
                      {product.sku && (
                        <p className="mt-2 truncate font-mono text-[11px] text-[#9D8A7F]">
                          SKU: {product.sku}
                        </p>
                      )}

                      {/* Description */}
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {htmlToPlainText(product.description)}
                        </p>
                      )}

                      {/* Price */}
                      <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1 border-t border-[#EFE7E1] pt-4">
                        <p className="text-xl font-semibold tracking-[-0.02em] text-[#3A2117]">
                          Rs. {productPrice.toLocaleString('en-PK')}
                        </p>

                        {originalPrice > productPrice && (
                          <p className="pb-0.5 text-xs text-[#A7978D] line-through">
                            Rs. {originalPrice.toLocaleString('en-PK')}
                          </p>
                        )}
                      </div>

                      {/* Stock */}
                      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-[#F8F5F2] px-3.5 py-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9A877C]">
                            Inventory
                          </p>

                          <p
                            className={`mt-1 text-sm font-semibold ${stock > 0
                              ? 'text-[#3E6045]'
                              : 'text-[#984C42]'
                              }`}
                          >
                            {stock > 0
                              ? `${stock.toLocaleString('en-PK')} in stock`
                              : 'Out of stock'}
                          </p>
                        </div>

                        <div
                          className={`h-2.5 w-2.5 rounded-full ${stock > 0
                            ? 'bg-[#6F9276]'
                            : 'bg-[#B96558]'
                            }`}
                        />
                      </div>

                      {/* Quick Toggles */}
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleNewArrival(product)
                          }
                          title={
                            product.isNewArrival
                              ? 'Remove from New Arrivals'
                              : 'Add to New Arrivals'
                          }
                          className={`inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition ${product.isNewArrival
                            ? 'border-[#E2C989] bg-[#FFF7E3] text-[#765817] hover:bg-[#F9EDCF]'
                            : 'border-[#E2D9D3] bg-white text-[#79665A] hover:border-[#CDBEAE] hover:bg-[#F8F4F1]'
                            }`}
                        >
                          <Sparkles className="h-3.5 w-3.5" />

                          {product.isNewArrival
                            ? 'New Arrival'
                            : 'Mark New'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleDiscounted(product)
                          }
                          title={
                            product.isDiscounted
                              ? 'Remove from Discounted'
                              : 'Add to Discounted'
                          }
                          className={`inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition ${product.isDiscounted
                            ? 'border-[#DEBBB4] bg-[#FFF0ED] text-[#8C493F] hover:bg-[#FAE2DD]'
                            : 'border-[#E2D9D3] bg-white text-[#79665A] hover:border-[#D5B3AC] hover:bg-[#FFF4F1]'
                            }`}
                        >
                          <Percent className="h-3.5 w-3.5" />

                          {product.isDiscounted
                            ? 'On Sale'
                            : 'Mark Sale'}
                        </button>
                      </div>

                      {/* Actions */}
                      <div
                        className={`mt-3 grid gap-2 ${product.status === 'draft'
                          ? 'grid-cols-3'
                          : 'grid-cols-2'
                          }`}
                      >
                        {product.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => handlePublish(product)}
                            className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#55755C] px-3 text-xs font-semibold text-white transition hover:bg-[#47664E]"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Publish
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#3A2117] px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4C2D21]"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#DEC0B9] bg-[#FFF7F5] px-3 text-xs font-semibold text-[#924C41] transition hover:border-[#CFA69D] hover:bg-[#FDECE8]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        )}

        {/* Product Summary */}
        {!loading && filteredProducts.length > 0 && (
          <section className="rounded-[22px] border border-[#E7DED7] bg-[#FFFEFC] p-5 shadow-[0_8px_28px_rgba(58,33,23,0.04)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#927E72]">
                  Current View
                </p>

                <p className="mt-1 text-sm text-[#675347]">
                  Showing{' '}
                  <span className="font-semibold text-[#281912]">
                    {filteredProducts.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-[#281912]">
                    {products.length}
                  </span>{' '}
                  products
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:items-center sm:gap-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#968276]">
                    In Stock
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#3F6548]">
                    {
                      filteredProducts.filter(
                        (product) => Number(product.stock || 0) > 0
                      ).length
                    }
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#968276]">
                    Out of Stock
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#934E43]">
                    {
                      filteredProducts.filter(
                        (product) => Number(product.stock || 0) <= 0
                      ).length
                    }
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#968276]">
                    Product Price Total
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#3A2117]">
                    Rs.{' '}
                    {filteredProducts
                      .reduce(
                        (sum, product) =>
                          sum + Number(product.price || 0),
                        0
                      )
                      .toLocaleString('en-PK')}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  )
}
