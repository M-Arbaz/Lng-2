'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  useLocation,
  useNavigate,
} from '@/lib/navigation'

import { useAuth } from './AuthContext'
import useProducts from '../hooks/useProducts'
import useCategories from '../hooks/useCategories'
import ordersService from '../utils/ordersService'
import heroBannersService from '../utils/heroBannersService'
import collectionSlidesService from '../utils/collectionSlidesService'
import instagramGridService from '../utils/instagramGridService'
import wishlistService from '../utils/wishlistService'
import reviewsService from '../utils/reviewsService'
import couponsService from '../utils/couponsService'

const AppStateContext =
  createContext(null)

function sectionFromPath(
  pathname
) {
  if (pathname === '/') {
    return 'home'
  }

  if (
    pathname.startsWith(
      '/products'
    )
  ) {
    return 'products'
  }

  if (
    pathname.startsWith(
      '/blogs'
    ) ||
    pathname.startsWith(
      '/blog/'
    )
  ) {
    return 'blogs'
  }

  if (
    pathname.startsWith(
      '/reels'
    )
  ) {
    return 'reels'
  }

  if (
    pathname.startsWith(
      '/collections'
    )
  ) {
    return 'categories'
  }

  if (
    pathname.startsWith(
      '/reviews'
    )
  ) {
    return 'reviews'
  }

  if (
    pathname.startsWith(
      '/cart'
    ) ||
    pathname.startsWith(
      '/checkout'
    )
  ) {
    return 'cart'
  }

  if (
    pathname.startsWith(
      '/profile'
    ) ||
    pathname.startsWith(
      '/orders'
    ) ||
    pathname.startsWith(
      '/wishlist'
    )
  ) {
    return 'profile'
  }

  return ''
}

export function AppStateProvider({
  children,
}) {
  const navigate =
    useNavigate()

  const location =
    useLocation()

  const {
    user,
    isLoggedIn,
    logout,
    updateProfile,
  } = useAuth()

  const {
    products,
    loading:
    productsLoading,
  } = useProducts()

  const {
    categories:
    dynamicCategories,

    loading:
    categoriesLoading,
  } = useCategories()

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    loadingProgress,
    setLoadingProgress,
  ] = useState(0)

  const [
    theme,
    setTheme,
  ] = useState('light')

  const [
    cart,
    setCart,
  ] = useState([])

  const [
    cartHydrated,
    setCartHydrated,
  ] = useState(false)

  const [
    appliedCoupon,
    setAppliedCoupon,
  ] = useState(null)

  const [
    cartNotification,
    setCartNotification,
  ] = useState(null)

  const cartNotificationSequenceRef =
    useRef(0)

  const [
    wishlist,
    setWishlist,
  ] = useState([])

  const [
    wishlistLoading,
    setWishlistLoading,
  ] = useState(false)

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('All')

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('')

  const [
    mobileNavOpen,
    setMobileNavOpen,
  ] = useState(false)

  const [
    orders,
    setOrders,
  ] = useState([])

  const [
    ordersLoading,
    setOrdersLoading,
  ] = useState(false)

  const [
    reviews,
    setReviews,
  ] = useState([])

  const [
    reviewsLoading,
    setReviewsLoading,
  ] = useState(true)

  const [
    reviewForm,
    setReviewForm,
  ] = useState({
    productId: 1,
    name: '',
    rating: 5,
    comment: '',
  })

  const [
    reviewSortBy,
    setReviewSortBy,
  ] = useState('recent')

  const [
    heroSlides,
    setHeroSlides,
  ] = useState([])

  const [
    collectionSlides,
    setCollectionSlides,
  ] = useState([])

  const [
    instagramImages,
    setInstagramImages,
  ] = useState([])

  const headerRef =
    useRef(null)

  const [
    headerHeight,
    setHeaderHeight,
  ] = useState(120)

  const activeSection =
    sectionFromPath(
      location.pathname
    )

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          'lg-theme'
        )

      if (
        saved === 'dark'
      ) {
        setTheme('dark')
      }
    } catch { }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'lg-theme',
        theme
      )
    } catch { }
  }, [theme])

  /*
   * Restore cart after
   * browser refresh.
   */
  useEffect(() => {
    try {
      const savedCart =
        window.localStorage.getItem(
          'lg-cart'
        )

      if (savedCart) {
        const parsedCart =
          JSON.parse(
            savedCart
          )

        if (
          Array.isArray(
            parsedCart
          )
        ) {
          const validCart =
            parsedCart.filter(
              (item) =>
                item &&
                item.id &&
                item.product &&
                item.product
                  .id &&
                Number(
                  item.quantity
                ) > 0
            )

          setCart(
            validCart
          )
        }
      }
    } catch (error) {
      console.error(
        'Failed to restore cart:',
        error
      )

      try {
        window.localStorage.removeItem(
          'lg-cart'
        )
      } catch { }
    } finally {
      setCartHydrated(
        true
      )
    }
  }, [])

  /*
   * Persist every cart
   * change.
   *
   * cartHydrated is
   * important so the initial
   * empty state does not
   * overwrite the saved cart
   * before hydration.
   */
  useEffect(() => {
    if (
      !cartHydrated
    ) {
      return
    }

    try {
      if (
        cart.length > 0
      ) {
        window.localStorage.setItem(
          'lg-cart',
          JSON.stringify(
            cart
          )
        )
      } else {
        window.localStorage.removeItem(
          'lg-cart'
        )
      }
    } catch (error) {
      console.error(
        'Failed to persist cart:',
        error
      )
    }
  }, [
    cart,
    cartHydrated,
  ])

  useEffect(() => {
    const loadReviews =
      async () => {
        try {
          setReviewsLoading(
            true
          )

          setReviews(
            await reviewsService.getAllReviews()
          )
        } catch (error) {
          console.error(
            'Error loading reviews:',
            error
          )
        } finally {
          setReviewsLoading(
            false
          )
        }
      }

    loadReviews()
  }, [])

  useEffect(() => {
    if (!user?.uid) {
      setOrders([])
      setWishlist([])

      setOrdersLoading(
        false
      )

      setWishlistLoading(
        false
      )

      return
    }

    setOrdersLoading(true)
    setWishlistLoading(true)

    /*
     * Orders stay synced
     * live with Firestore.
     */
    const unsubscribeOrders =
      ordersService.subscribeToUserOrders(
        user.uid,

        (
          userOrders
        ) => {
          setOrders(
            userOrders
          )

          setOrdersLoading(
            false
          )
        },

        (error) => {
          console.error(
            'Error syncing user orders:',
            error
          )

          setOrdersLoading(
            false
          )
        }
      )

    /*
     * Wishlist stays on the
     * existing loading flow.
     */
    wishlistService
      .getWishlist(
        user.uid
      )
      .then((items) => {
        setWishlist(items)
      })
      .catch((error) => {
        console.error(
          'Error loading wishlist:',
          error
        )
      })
      .finally(() => {
        setWishlistLoading(
          false
        )
      })

    return () => {
      unsubscribeOrders()
    }
  }, [user?.uid])

  useEffect(() => {
    if (
      products[0]?.id &&
      reviewForm.productId ===
      1
    ) {
      setReviewForm(
        (prev) => ({
          ...prev,
          productId:
            products[0].id,
        })
      )
    }
  }, [
    products,
    reviewForm.productId,
  ])

  const cartItemsCount =
    useMemo(
      () =>
        cart.reduce(
          (
            sum,
            item
          ) =>
            sum +
            item.quantity,
          0
        ),
      [cart]
    )

  const cartTotal =
    useMemo(
      () =>
        cart.reduce(
          (
            sum,
            item
          ) =>
            sum +
            item.quantity *
            (item.unitPrice ??
              item.product
                .price),
          0
        ),
      [cart]
    )

  useEffect(() => {
    if (
      cart.length ===
      0 &&
      appliedCoupon
    ) {
      setAppliedCoupon(
        null
      )
    }
  }, [
    cart.length,
    appliedCoupon,
  ])

  const filteredProducts =
    useMemo(() => {
      const base =
        selectedCategory ===
          'All'
          ? products
          : products.filter(
            (product) =>
              product.category ===
              selectedCategory
          )

      const q =
        searchQuery
          .trim()
          .toLowerCase()

      if (!q) {
        return base
      }

      return base.filter(
        (product) =>
          (
            product.name ||
            ''
          )
            .toLowerCase()
            .includes(q) ||
          (
            product.category ||
            ''
          )
            .toLowerCase()
            .includes(q)
      )
    }, [
      searchQuery,
      selectedCategory,
      products,
    ])

  const publicReviews =
    useMemo(
      () =>
        reviews.filter(
          (review) =>
            review.isActive !==
            false
        ),
      [reviews]
    )

  const productAverageRating =
    useMemo(() => {
      const map = {}

      publicReviews.forEach(
        (review) => {
          if (
            !map[
            review
              .productId
            ]
          ) {
            map[
              review.productId
            ] = {
              total: 0,
              count: 0,
            }
          }

          map[
            review.productId
          ].total +=
            review.rating

          map[
            review.productId
          ].count += 1
        }
      )

      return Object.fromEntries(
        Object.entries(
          map
        ).map(
          ([
            id,
            value,
          ]) => [
              id,
              value.total /
              value.count,
            ]
        )
      )
    }, [publicReviews])

  const sortedReviews =
    useMemo(() => {
      const result = [
        ...publicReviews,
      ]

      if (
        reviewSortBy ===
        'rating'
      ) {
        result.sort(
          (a, b) =>
            Number(
              b.rating
            ) -
            Number(
              a.rating
            )
        )
      } else {
        result.sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        )
      }

      return result
    }, [
      publicReviews,
      reviewSortBy,
    ])

  function handleToggleWishlist(
    product
  ) {
    setWishlist(
      (prev) => {
        const next =
          prev.find(
            (item) =>
              item.id ===
              product.id
          )
            ? prev.filter(
              (item) =>
                item.id !==
                product.id
            )
            : [
              ...prev,
              product,
            ]

        if (user?.uid) {
          wishlistService
            .saveWishlist(
              user.uid,
              next
            )
            .catch(
              (error) =>
                console.error(
                  'Failed to sync wishlist:',
                  error
                )
            )
        }

        return next
      }
    )
  }

  function isInWishlist(
    productId
  ) {
    return wishlist.some(
      (product) =>
        product.id ===
        productId
    )
  }

  function dismissCartNotification() {
    setCartNotification(
      null
    )
  }

  function showCartNotification(
    item
  ) {
    const product =
      item?.product

    if (!product) {
      return
    }

    const normalizeValue =
      (value) =>
        String(
          value || ''
        )
          .trim()
          .toLowerCase()

    const productImages =
      Array.isArray(
        product.images
      )
        ? product.images.filter(
          Boolean
        )
        : []

    const colorVariants =
      Array.isArray(
        product.productDetails
          ?.colorVariants
      )
        ? product
          .productDetails
          .colorVariants
        : []

    const shadeColors =
      Array.isArray(
        product.shadeColors
      )
        ? product.shadeColors
        : []

    const matchedColor =
      colorVariants.find(
        (variant) =>
          normalizeValue(
            variant.name
          ) ===
          normalizeValue(
            item.colorVariant
          )
      )

    const matchedShade =
      shadeColors.find(
        (shade) =>
          normalizeValue(
            shade.name
          ) ===
          normalizeValue(
            item.shadeColor
          )
      )

    const image =
      matchedShade?.image ||
      matchedColor?.image ||
      product.image ||
      productImages[0] ||
      ''

    const lineKey = [
      product.id,
      item.bulbOption ||
      '',
      item.colorVariant ||
      '',
      item.shadeColor ||
      '',
    ].join('|')

    cartNotificationSequenceRef.current +=
      1

    const notificationKey =
      cartNotificationSequenceRef.current

    setCartNotification(
      (previous) => {
        const sameProduct =
          previous?.lineKey ===
          lineKey

        return {
          key:
            notificationKey,

          lineKey,

          productId:
            product.id,

          name:
            product.name ||
            'Product',

          image,

          unitPrice:
            item.unitPrice ??
            product.price,

          bulbOption:
            item.bulbOption ||
            null,

          colorVariant:
            item.colorVariant ||
            null,

          shadeColor:
            item.shadeColor ||
            null,

          quantityAdded:
            sameProduct
              ? (previous.quantityAdded ||
                1) + 1
              : 1,
        }
      }
    )
  }

  function handleAddToCart(
    payload,
    options = {}
  ) {
    const item =
      payload.product
        ? payload
        : {
          product:
            payload,
        }

    const makeVariantKey =
      (value) =>
        String(
          value ||
          'default'
        )
          .trim()
          .toLowerCase()
          .replace(
            /\s+/g,
            '_'
          )

    const bulbKey =
      makeVariantKey(
        item.bulbOption
      )

    const colorKey =
      makeVariantKey(
        item.colorVariant
      )

    const shadeKey =
      makeVariantKey(
        item.shadeColor
      )

    /*
     * Every unique variant
     * combination gets its
     * own cart line.
     */
    const id =
      `${item.product.id}-${bulbKey}-${colorKey}-${shadeKey}`

    setCart((prev) => {
      const existing =
        prev.find(
          (cartItem) =>
            cartItem.id ===
            id
        )

      if (existing) {
        return prev.map(
          (cartItem) =>
            cartItem.id ===
              id
              ? {
                ...cartItem,

                quantity:
                  cartItem.quantity +
                  1,
              }
              : cartItem
        )
      }

      return [
        ...prev,
        {
          id,

          product:
            item.product,

          quantity: 1,

          bulbOption:
            item.bulbOption ||
            null,

          colorVariant:
            item.colorVariant ||
            null,

          shadeColor:
            item.shadeColor ||
            null,

          unitPrice:
            item.unitPrice ??
            item.product
              .price,
        },
      ]
    })

    if (
      !options.silent
    ) {
      showCartNotification(
        item
      )
    }
  }

  function handleUpdateCartQuantity(
    itemId,
    quantity
  ) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id ===
            itemId
            ? {
              ...item,
              quantity,
            }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    )
  }

  function handleRemoveFromCart(
    itemId
  ) {
    setCart((prev) =>
      prev.filter(
        (item) =>
          item.id !==
          itemId
      )
    )
  }

  /*
   * Guest + logged-in
   * checkout.
   *
   * Logged-in:
   * userId = Firebase uid.
   *
   * Guest:
   * userId = null.
   */
  const handlePlaceOrder =
    async (payload) => {
      try {
        const orderUserId =
          user?.uid ||
          null

        const order =
          await ordersService.createOrder(
            orderUserId,
            {
              fullName:
                payload.fullName,

              phone:
                payload.phone,

              email:
                payload.email,

              addressLine1:
                payload.addressLine1,

              addressLine2:
                payload.addressLine2,

              city:
                payload.city,

              state:
                payload.state,

              postalCode:
                payload.postalCode,

              note:
                payload.note,

              shippingMethod:
                payload.shippingMethod ||
                null,

              billingSameAsShipping:
                payload.billingSameAsShipping ??
                true,

              billingAddress:
                payload.billingAddress ||
                null,

              items:
                payload.items,

              subtotal:
                payload.subtotal,

              discountAmount:
                Number(
                  payload.discountAmount ||
                  0
                ),

              discountedSubtotal:
                payload.discountedSubtotal ??
                Math.max(
                  0,
                  Number(
                    payload.subtotal ||
                    0
                  ) -
                  Number(
                    payload.discountAmount ||
                    0
                  )
                ),

              couponEligibleSubtotal:
                Number(
                  payload.couponEligibleSubtotal ||
                  0
                ),

              coupon:
                payload.coupon ||
                null,

              shipping:
                payload.shipping,

              total:
                payload.total,

              paymentMethod:
                payload.paymentMethod ||
                'cash_on_delivery',
            }
          )
        // Send order notification emails after Firestore saves the order.
        try {
          if (order.email && order.id) {
            const response = await fetch(
              'https://email.lampandglow.pk/api/notify-order',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderId: order.id,
                  fullName: order.fullName,
                  email: order.email,
                  phone: order.phone,
                  addressLine1: order.addressLine1,
                  addressLine2: order.addressLine2,
                  city: order.city,
                  state: order.state,
                  postalCode: order.postalCode,
                  note: order.note,
                  paymentMethod: order.paymentMethod,
                  status: order.status,
                  items: order.items,
                  subtotal: order.subtotal,
                  discountAmount: order.discountAmount,
                  shipping: order.shipping,
                  total: order.total,
                }),
              }
            );

            if (!response.ok) {
              console.error(
                'Order saved, but email API returned an error:',
                response.status
              );
            }
          } else {
            console.warn(
              'Order saved, but email notification skipped: customer email is missing.'
            );
          }
        } catch (emailError) {
          // Do not make the customer place the same order again
          // just because email delivery failed.
          console.error(
            'Order saved, but email notification failed:',
            emailError
          );
        }
        /*
         * Coupon usage is
         * counted only after
         * Firestore order is
         * created.
         */
        if (
          payload.coupon?.id
        ) {
          try {
            await couponsService.incrementUsage(
              payload.coupon
                .id
            )
          } catch (
          couponError
          ) {
            /*
             * Order already
             * exists.
             * Counter failure
             * must not make
             * customer place
             * it twice.
             */
            console.error(
              'Failed to increment coupon usage:',
              couponError
            )
          }
        }

        /*
         * User account order
         * state should contain
         * only authenticated
         * user's orders.
         *
         * Guest order still
         * exists normally in
         * Firestore/Admin.
         */
        if (user?.uid) {
          setOrders(
            (prev) => [
              order,
              ...prev,
            ]
          )
        }

        setCart([])
        setAppliedCoupon(
          null
        )

        return order.id
      } catch (error) {
        console.error(
          'Error placing order:',
          error
        )

        throw error
      }
    }

  const handleSubmitReview =
    async (
      newReview
    ) => {
      if (
        !newReview?.comment ||
        !user
      ) {
        return false
      }

      if (
        reviews.some(
          (review) =>
            review.productId ===
            newReview.productId &&
            review.userId ===
            user.uid
        )
      ) {
        window.alert(
          'You have already reviewed this product.'
        )

        return false
      }

      try {
        const savedReview =
          await reviewsService.addReview(
            newReview
          )

        setReviews(
          (prev) => [
            savedReview,
            ...prev,
          ]
        )

        return true
      } catch (error) {
        console.error(
          'Error submitting review:',
          error
        )

        window.alert(
          'Failed to submit review. Please try again.'
        )

        return false
      }
    }

  function handleNavigate(
    section
  ) {
    const routes = {
      home: '/',
      products:
        '/products',
      blogs: '/blogs',
      reels: '/reels',
      profile:
        '/profile',
      cart: '/cart',
      categories:
        '/collections',
      reviews:
        '/reviews',
    }

    navigate(
      routes[section] ||
      '/'
    )

    setMobileNavOpen(
      false
    )
  }

  useEffect(() => {
    if (!loading) {
      return
    }

    const interval =
      window.setInterval(
        () => {
          setLoadingProgress(
            (prev) =>
              prev >= 90
                ? prev
                : Math.min(
                  90,
                  prev +
                  Math.random() *
                  25
                )
          )
        },
        200
      )

    return () =>
      window.clearInterval(
        interval
      )
  }, [loading])

  useEffect(() => {
    if (
      !productsLoading &&
      !categoriesLoading
    ) {
      setLoadingProgress(
        100
      )

      const timer =
        window.setTimeout(
          () =>
            setLoading(
              false
            ),
          650
        )

      return () =>
        window.clearTimeout(
          timer
        )
    }
  }, [
    productsLoading,
    categoriesLoading,
  ])

  useEffect(() => {
    const header =
      headerRef.current

    if (
      !header ||
      typeof ResizeObserver ===
      'undefined'
    ) {
      return
    }

    const updateHeight =
      () =>
        setHeaderHeight(
          header.offsetHeight
        )

    updateHeight()

    const observer =
      new ResizeObserver(
        updateHeight
      )

    observer.observe(
      header
    )

    return () =>
      observer.disconnect()
  }, [location.pathname])

  useEffect(() => {
    heroBannersService
      .getActiveBanners()
      .then((banners) =>
        setHeroSlides(
          banners.map(
            (banner) => ({
              id:
                banner.id,

              image:
                banner.image,

              imageMobile:
                banner.imageMobile ||
                '',

              alt:
                banner.alt ||
                banner.title,

              badge:
                banner.badge ||
                '',

              title:
                banner.title ||
                '',

              subtitle:
                banner.subtitle ||
                '',

              primaryLabel:
                banner.primaryLabel ||
                '',

              primaryAction:
                banner.primaryAction ||
                null,

              secondaryLabel:
                banner.secondaryLabel ||
                '',

              secondaryAction:
                banner.secondaryAction ||
                null,

              fitToScreen:
                banner.fitToScreen !==
                false,

              fullScreen:
                banner.fullScreen ===
                true,
            })
          )
        )
      )
      .catch((error) =>
        console.error(
          'Error loading hero banners:',
          error
        )
      )

    collectionSlidesService
      .getActiveSlides()
      .then((slides) =>
        setCollectionSlides(
          slides.map(
            (slide) => ({
              id:
                slide.id,

              image:
                slide.image,

              alt:
                slide.alt ||
                slide.title,

              eyebrow:
                slide.eyebrow ||
                '',

              title:
                slide.title ||
                '',

              description:
                slide.description ||
                '',

              imageSide:
                slide.imageSide ||
                'left',

              buttonLabel:
                slide.buttonLabel ||
                '',

              buttonAction:
                slide.buttonAction ||
                null,
            })
          )
        )
      )
      .catch((error) =>
        console.error(
          'Error loading collection slides:',
          error
        )
      )

    instagramGridService
      .getActiveItems()
      .then((items) =>
        setInstagramImages(
          items.map(
            (item) => ({
              id:
                item.id,

              image:
                item.image,

              alt:
                item.alt ||
                '',

              url:
                item.url ||
                '',
            })
          )
        )
      )
      .catch((error) =>
        console.error(
          'Error loading Instagram grid images:',
          error
        )
      )
  }, [])

  function handleHeroAction(
    action
  ) {
    if (!action) {
      return
    }

    if (
      action.type ===
      'section'
    ) {
      handleNavigate(
        action.value
      )
    } else if (
      action.type ===
      'url'
    ) {
      window.open(
        action.value,
        '_blank',
        'noopener,noreferrer'
      )
    }
  }

  function navigateToWishlist() {
    navigate(
      '/wishlist'
    )

    setMobileNavOpen(
      false
    )
  }

  function toggleTheme() {
    setTheme(
      (prev) =>
        prev === 'dark'
          ? 'light'
          : 'dark'
    )
  }

  async function handleLogout() {
    await logout()

    navigate('/')
  }

  async function handleProfileChange(
    key,
    value
  ) {
    await updateProfile({
      [key]: value,
    })
  }

  const value = {
    user,
    isLoggedIn,

    activeSection,

    theme,
    toggleTheme,

    loading,
    loadingProgress,

    products,
    productsLoading,

    dynamicCategories,
    categoriesLoading,

    cart,
    cartItemsCount,
    cartTotal,

    appliedCoupon,
    setAppliedCoupon,

    cartNotification,
    dismissCartNotification,

    wishlist,
    wishlistLoading,

    orders,
    ordersLoading,

    reviews,
    reviewsLoading,

    sortedReviews,

    reviewForm,
    setReviewForm,

    reviewSortBy,
    setReviewSortBy,

    selectedCategory,
    setSelectedCategory,

    searchQuery,
    setSearchQuery,

    filteredProducts,
    productAverageRating,

    mobileNavOpen,
    setMobileNavOpen,

    headerRef,
    headerHeight,

    heroSlides,
    collectionSlides,
    instagramImages,

    handleNavigate,
    handleHeroAction,

    navigateToWishlist,

    handleAddToCart,
    handleUpdateCartQuantity,
    handleRemoveFromCart,

    handlePlaceOrder,

    handleToggleWishlist,
    isInWishlist,

    handleSubmitReview,

    handleLogout,
    handleProfileChange,
  }

  return (
    <AppStateContext.Provider
      value={value}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context =
    useContext(
      AppStateContext
    )

  if (!context) {
    throw new Error(
      'useAppState must be used within AppStateProvider'
    )
  }

  return context
}