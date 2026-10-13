'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, AlertCircle, CheckCircle, ImagePlus, Loader2, Tag, Sparkles, Percent } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import RichTextEditor from '../components/RichTextEditor.jsx'
import productsService from '../utils/productsService.js'
import categoriesService from '../utils/categoriesService.js'
import { uploadToXcdn } from '../utils/xcdnUpload.js'
import { calculateFinalPrice } from '../utils/discountHelpers.js'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [imageUploading, setImageUploading] = useState(false)
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Product Management</h2>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
              }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#E53935] flex-shrink-0" />
            )}
            <p
              className={`font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Add/Edit Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 px-8 py-6 flex items-center justify-between text-white">
                <h3 className="text-2xl font-bold">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <label className={`flex-1 h-20 border-2 border-dashed rounded-lg transition flex flex-col items-center justify-center text-center cursor-pointer border-gray-300 hover:border-orange-500`}>
                        <input
                          type="file"
                          accept="image/*"
                          id="newColorImageUpload"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              const url =
                                await uploadToXcdn(
                                  file,
                                  'color-variants'
                                )
                              document.getElementById('newColorImage').value = url
                            } catch (err) {
                              setMessage({ type: 'error', text: `Image upload failed: ${err.message}` })
                            }
                            e.target.value = ''
                          }}
                        />
                        <ImagePlus className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Upload Image</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const nameInput = document.getElementById('newColorName')
                          const imageInput = document.getElementById('newColorImage')
                          const name = nameInput.value.trim()
                          const image = imageInput.value.trim()
                          if (!name || !image) {
                            setMessage({ type: 'error', text: 'Please enter both color name and image URL' })
                            return
                          }
                          setFormData((prev) => ({
                            ...prev,
                            colorVariants: [...prev.colorVariants, { name, image }],
                          }))
                          nameInput.value = ''
                          imageInput.value = ''
                          setMessage({ type: '', text: '' })
                        }}
                        className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition"
                      >
                        Add Color
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <label className={`flex-1 h-20 border-2 border-dashed rounded-lg transition flex flex-col items-center justify-center text-center cursor-pointer border-gray-300 hover:border-orange-500`}>
                        <input
                          type="file"
                          accept="image/*"
                          id="newShadeImageUpload"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              const url =
                                await uploadToXcdn(
                                  file,
                                  'shade-colors'
                                )
                              document.getElementById('newShadeImage').value = url
                            } catch (err) {
                              setMessage({ type: 'error', text: `Image upload failed: ${err.message}` })
                            }
                            e.target.value = ''
                          }}
                        />
                        <ImagePlus className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Upload Image</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const nameInput = document.getElementById('newShadeName')
                          const imageInput = document.getElementById('newShadeImage')
                          const name = nameInput.value.trim()
                          const image = imageInput.value.trim()
                          if (!name || !image) {
                            setMessage({ type: 'error', text: 'Please enter both shade name and image URL' })
                            return
                          }
                          setFormData((prev) => ({
                            ...prev,
                            shadeColors: [...prev.shadeColors, { name, image }],
                          }))
                          nameInput.value = ''
                          imageInput.value = ''
                          setMessage({ type: '', text: '' })
                        }}
                        className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition"
                      >
                        Add Shade
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

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={saving || imageUploading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving && formData.status !== 'draft' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'Update & Publish' : 'Publish Product'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAsDraft}
                    disabled={saving || imageUploading}
                    className="flex-1 bg-gray-600 text-white font-semibold py-3 rounded-lg hover:bg-gray-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving && formData.status === 'draft' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'Save as Draft' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, category, SKU, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('newArrivals')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${statusFilter === 'newArrivals' ? 'bg-[#F5F1EA]0 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              <Sparkles size={14} />
              New Arrivals
            </button>
            <button
              onClick={() => setStatusFilter('discounted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${statusFilter === 'discounted' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              <Percent size={14} />
              Discounted
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            <p className="mt-2 text-gray-500">Loading products...</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchQuery ? 'Try adjusting your search' : 'Add your first product to get started'}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                  {/* Image */}
                  {getProductImage(product) && (
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-110 transition duration-300"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 flex-1">{product.name}</h3>
                      <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {product.isNewArrival && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-[#5A2D0C] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          <Sparkles size={10} /> New Arrival
                        </span>
                      )}
                      {product.isDiscounted && (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          <Percent size={10} /> Sale
                        </span>
                      )}
                    </div>

                    {product.sku && (
                      <p className="text-xs text-gray-500 mb-2 font-mono">SKU: {product.sku}</p>
                    )}

                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        {product.originalPrice && product.originalPrice > product.price ? (
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-400 line-through">Rs.{product.originalPrice.toLocaleString()}</p>
                            <p className="text-2xl font-bold text-orange-500">Rs.{product.price.toLocaleString()}</p>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-orange-500">Rs.{product.price.toLocaleString()}</p>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${product.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : product.status === 'draft'
                          ? 'bg-amber-100 text-[#5A2D0C]'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {product.status === 'active' ? 'Active' : product.status === 'draft' ? 'Draft' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Stock: <span className="font-semibold text-gray-900">{product.stock || 0}</span></p>
                        {product.stock === 0 && <p className="text-[#E53935] font-semibold text-xs">Out of Stock</p>}
                      </div>
                      <p className="text-xs text-gray-500">
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>

                    {/* Quick Toggles */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => handleToggleNewArrival(product)}
                        title={product.isNewArrival ? 'Remove from New Arrivals' : 'Add to New Arrivals'}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 ${product.isNewArrival
                          ? 'bg-amber-100 text-[#5A2D0C] hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-[#F5F1EA] hover:text-[#5A2D0C]'
                          }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {product.isNewArrival ? 'New Arrival' : 'Mark New'}
                      </button>
                      <button
                        onClick={() => handleToggleDiscounted(product)}
                        title={product.isDiscounted ? 'Remove from Discounted' : 'Add to Discounted'}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 ${product.isDiscounted
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
                          }`}
                      >
                        <Percent className="w-3.5 h-3.5" />
                        {product.isDiscounted ? 'On Sale' : 'Mark Sale'}
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {product.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(product)}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 bg-red-500 text-white font-semibold py-2 rounded-lg hover:bg-[#E53935] transition flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && filteredProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> of{' '}
              <span className="font-bold text-gray-900">{products.length}</span> products
            </p>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Inventory Value</p>
              <p className="text-2xl font-bold text-orange-500">
                Rs.{filteredProducts.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
