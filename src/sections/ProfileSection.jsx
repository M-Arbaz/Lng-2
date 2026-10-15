'use client'

import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@/lib/navigation';
import uploadToXcdn from '@/utils/xcdnUpload';
import { slugify } from '../utils/slugify.js';
import {
  User, Mail, Phone, MapPin, AlertCircle, Loader, CheckCircle,
  ShoppingBag, Heart, MapPin as MapPinIcon, Star, Bell, Settings,
  LogOut, SlidersHorizontal, Home, Camera
} from 'lucide-react';

export default function ProfileSection({
  profile,
  orders,
  wishlist = [],
  reviews = [],
  products = [],
  handleProfileChange,
  onLogout,
}) {
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');   // desktop sidebar tab
  const [mobileTab, setMobileTab] = useState('orders');   // mobile tab: orders | wishlist | details
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', mobile: '', email: '',
    addressLine1: '', addressLine2: '', city: '', state: '', postalCode: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        mobile: profile.mobile || '',
        email: profile.email || '',
        addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '',
        city: profile.city || '',
        state: profile.state || '',
        postalCode: profile.postalCode || ''
      });
      if (profile.photoURL) setProfileImage(profile.photoURL);
    }
  }, [profile]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file || !profile?.uid) return;

    setError('');
    setMessage('');
    setUploadingImage(true);

    try {
      const url = await uploadToXcdn(file, 'profile-images');

      setProfileImage(url);

      await handleProfileChange('photoURL', url);

      setMessage('Profile image updated!');

      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (err) {
      console.error('Profile image upload failed:', err);

      setError(
        err?.message || 'Failed to upload profile image'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      Object.entries(formData).forEach(([key, value]) => handleProfileChange(key, value));
      setMessage('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch { setError('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const getStatusStyle = (status) => ({
    pending: 'bg-[#EAF3DE] text-[#3B6D11]',
    confirmed: 'bg-[#FAEEDA] text-[#854F0B]',
    shipped: 'bg-[#E6F1FB] text-[#185FA5]',
    delivered: 'bg-[#EAF3DE] text-[#3B6D11]',
    cancelled: 'bg-red-100 text-red-700',
  }[status] || 'bg-stone-100 text-stone-600');

  const getStatusLabel = (status) => ({
    pending: 'Processing', confirmed: 'Crafting', shipped: 'Shipped',
    delivered: 'Delivered', cancelled: 'Cancelled',
  }[status] || status);

  const initials = [profile?.firstName?.charAt(0), profile?.lastName?.charAt(0)]
    .filter(Boolean).join('').toUpperCase() || 'U';
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');
  const userReviews = reviews.filter(
    (review) => review.userId === profile?.uid
  )

  const getReviewProduct = (review) =>
    products.find((product) => product.id === review.productId)

  const formatReviewDate = (value) => {
    if (!value) return ''

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return ''

    return date.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  const desktopNavItems = [
    { id: 'orders', icon: ShoppingBag, label: 'My orders' },
    { id: 'wishlist', icon: Heart, label: 'Wishlist' },
    { id: 'reviews', icon: Star, label: 'Reviews' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];
  const ReviewsList = ({ compact = false }) => {
    if (userReviews.length === 0) {
      return (
        <div className="rounded-[24px] border border-[#3A2117]/10 bg-[#FFFEFC] px-5 py-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
            <Star size={23} strokeWidth={1.5} />
          </div>

          <p className="mt-4 text-sm font-semibold text-[#281912]">
            No reviews yet
          </p>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#8A7569]">
            Reviews you submit on products will appear here.
          </p>

          <button
            type="button"
            onClick={() => navigate('/products')}
            className="mt-5 min-h-[42px] rounded-full bg-[#3A2117] px-6 text-xs font-semibold text-white transition-colors hover:bg-[#4A2B1F]"
          >
            Browse Products
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {userReviews.map((review) => {
          const product = getReviewProduct(review)

          return (
            <div
              key={review.id}
              className="overflow-hidden rounded-[22px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_8px_28px_rgba(58,33,23,0.04)]"
            >
              <div className={compact ? 'p-4' : 'p-5 sm:p-6'}>
                <div className="flex items-start gap-3">
                  {product?.image ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/products/${slugify(product.name)}`)
                      }
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#EEE7E1]"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ) : (
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#F2ECE5] text-[#6B4228]">
                      <Star size={18} strokeWidth={1.5} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A654D]">
                          Product Review
                        </p>

                        <button
                          type="button"
                          disabled={!product}
                          onClick={() =>
                            product &&
                            navigate(`/products/${slugify(product.name)}`)
                          }
                          className="mt-1 block max-w-full text-left text-sm font-semibold text-[#281912] hover:text-[#6B4228] disabled:pointer-events-none"
                        >
                          {product?.name || 'Reviewed Product'}
                        </button>

                        {review.createdAt && (
                          <p className="mt-1 text-[10px] text-[#9A8171]">
                            {formatReviewDate(review.createdAt)}
                          </p>
                        )}
                      </div>

                      <div
                        className="flex shrink-0 items-center gap-0.5"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            strokeWidth={1.5}
                            className={
                              star <= Number(review.rating || 0)
                                ? 'fill-[#6B4228] text-[#6B4228]'
                                : 'fill-transparent text-[#3A2117]/20'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <p className="mt-3 text-[13px] leading-6 text-[#5F4C42]">
                      {review.comment}
                    </p>
                  </div>
                </div>

                {review.adminReply && (
                  <div className="mt-4 rounded-2xl border border-[#6B4228]/15 bg-[#F7F4EF] p-4">
                    <div className="flex items-start gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#3A2117] text-[9px] font-semibold text-white">
                        L&G
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-[#3A2117]">
                            Lamp & Glow Reply
                          </p>

                          {review.adminReplyAt && (
                            <span className="text-[9px] text-[#9A8171]">
                              {formatReviewDate(review.adminReplyAt)}
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 text-xs leading-5 text-[#6B5A50]">
                          {review.adminReply}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  // Shared order list — used in both mobile + desktop
  const OrdersList = ({ limit = 5, compact = false }) => (
    !orders || orders.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <ShoppingBag size={28} className="text-stone-200" />
        <p className="text-xs text-stone-400">No orders yet</p>
      </div>
    ) : (
      <div className="flex flex-col gap-2">
        {orders.slice(0, limit).map((order) => (
          <div key={order._id || order.id}
            className={`flex items-center gap-3 rounded-lg bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors ${compact ? 'p-2.5' : 'p-3'}`}>
            <div className={`rounded-lg bg-[#FAEEDA] flex items-center justify-center flex-shrink-0 ${compact ? 'w-8 h-8' : 'w-9 h-9'}`}>
              <ShoppingBag size={compact ? 14 : 16} className="text-[#BA7517]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-stone-900 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                {order.items?.[0]?.productName || 'Order'}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                #{(order._id || order.id)?.substring(0, 8)} · {
                  order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(compact ? {} : { year: 'numeric' }) })
                    : '—'
                }
              </p>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${getStatusStyle(order.orderStatus)}`}>
              {getStatusLabel(order.orderStatus)}
            </span>
          </div>
        ))}
      </div>
    )
  );

  // ─── MOBILE VIEW ───────────────────────────────────
  const MobileView = () => (
    <div className="min-h-screen bg-[#F7F4EF] pb-24">

      {/* ═══════════════ PROFILE HERO ═══════════════ */}
      <section className="relative overflow-hidden bg-[#3A2117] px-4 pb-16 pt-10 text-white">
        <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-white/[0.04]" />
        <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-white/[0.03]" />

        <div className="relative mx-auto max-w-lg text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#D7B99E]">
            Lamp & Glow Account
          </p>

          {/* Avatar */}
          <div className="relative mx-auto mt-6 h-24 w-24">
            <div className="h-24 w-24 overflow-hidden rounded-full border-[4px] border-white/10 bg-[#F2E7DE] shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
              {profile?.photoURL || profileImage ? (
                <img
                  src={profile?.photoURL || profileImage}
                  alt={fullName || 'Profile'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-2xl font-semibold text-[#3A2117]">
                  {initials}
                </div>
              )}
            </div>

            <label
              className="
              absolute bottom-0 right-0 grid h-9 w-9 cursor-pointer
              place-items-center rounded-full border-[3px]
              border-[#3A2117] bg-[#FFFEFC] text-[#3A2117]
              shadow-lg transition-transform active:scale-95
            "
              title="Change profile photo"
            >
              {uploadingImage ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <Camera size={14} strokeWidth={1.8} />
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingImage}
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <h1 className="mt-4 text-xl font-semibold tracking-[-0.025em]">
            {fullName || 'Lamp & Glow Customer'}
          </h1>

          <p className="mt-1 text-xs text-[#C9B8AD]">
            {profile?.email || 'Your Lamp & Glow account'}
          </p>

          {profile?.city && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-[#BCA89C]">
              <MapPin size={11} strokeWidth={1.7} />
              {profile.city}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="relative z-[2] -mt-9 px-4">
        <div className="mx-auto grid max-w-lg grid-cols-3 overflow-hidden rounded-[22px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_14px_40px_rgba(58,33,23,0.10)]">
          {[
            {
              label: 'Orders',
              value: orders?.length || 0,
            },
            {
              label: 'Wishlist',
              value: wishlist?.length || 0,
            },
            {
              label: 'Reviews',
              value: userReviews.length,
            },
          ].map(({ label, value }, index) => (
            <div
              key={label}
              className={`px-2 py-4 text-center ${index !== 2 ? 'border-r border-[#3A2117]/10' : ''
                }`}
            >
              <span className="block text-lg font-semibold tracking-[-0.03em] text-[#281912]">
                {value}
              </span>

              <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-[#9A8171]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ TAB SWITCHER ═══════════════ */}
      <section className="px-4 pt-6">
        <div className="mx-auto flex max-w-lg rounded-full border border-[#3A2117]/10 bg-[#EEE7E1] p-1">
          {[
            { id: 'orders', label: 'Orders' },
            { id: 'wishlist', label: 'Wishlist' },
            { id: 'reviews', label: 'Reviews' },
            { id: 'details', label: 'Profile' },
          ].map(({ id, label }) => {
            const active = mobileTab === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setEditing(false)
                  setMobileTab(id)
                }}
                className={`min-h-[40px] flex-1 rounded-full px-3 text-xs font-semibold transition-all ${active
                  ? 'bg-[#3A2117] text-white shadow-[0_5px_14px_rgba(58,33,23,0.20)]'
                  : 'text-[#7A6559]'
                  }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </section>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <section className="mx-auto max-w-lg px-4 pb-8 pt-5">

        {/* ───────── ORDERS ───────── */}
        {mobileTab === 'orders' && (
          <div>
            <div className="mb-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A654D]">
                Order History
              </p>

              <div className="mt-1 flex items-end justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#281912]">
                  My Orders
                </h2>

                {orders?.length > 0 && (
                  <Link
                    to="/orders"
                    className="text-[11px] font-semibold text-[#6B4228]"
                  >
                    View all
                  </Link>
                )}
              </div>
            </div>

            {!orders || orders.length === 0 ? (
              <div className="rounded-[24px] border border-[#3A2117]/10 bg-[#FFFEFC] px-6 py-12 text-center shadow-[0_8px_28px_rgba(58,33,23,0.04)]">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
                  <ShoppingBag size={23} strokeWidth={1.5} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#281912]">
                  No orders yet
                </h3>

                <p className="mx-auto mt-1 max-w-[260px] text-xs leading-5 text-[#8A7569]">
                  Your Lamp & Glow orders will appear here once you start shopping.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="mt-5 min-h-[42px] rounded-full bg-[#3A2117] px-6 text-xs font-semibold text-white"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 10).map((order) => (
                  <div
                    key={order._id || order.id}
                    className="rounded-[20px] border border-[#3A2117]/10 bg-[#FFFEFC] p-4 shadow-[0_6px_24px_rgba(58,33,23,0.04)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F2ECE5] text-[#6B4228]">
                        <ShoppingBag size={17} strokeWidth={1.6} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#281912]">
                              {order.items?.[0]?.productName || 'Lamp & Glow Order'}
                            </p>

                            <p className="mt-1 text-[10px] text-[#9A8171]">
                              #{(order._id || order.id)?.substring(0, 8)}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold ${getStatusStyle(
                              order.orderStatus
                            )}`}
                          >
                            {getStatusLabel(order.orderStatus)}
                          </span>
                        </div>

                        <div className="mt-3 border-t border-[#3A2117]/10 pt-3">
                          <p className="text-[10px] text-[#8A7569]">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )
                              : 'Date unavailable'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ───────── WISHLIST ───────── */}
        {mobileTab === 'wishlist' && (
          <div>
            <div className="mb-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A654D]">
                Saved Collection
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#281912]">
                My Wishlist
              </h2>
            </div>

            {!wishlist || wishlist.length === 0 ? (
              <div className="rounded-[24px] border border-[#3A2117]/10 bg-[#FFFEFC] px-6 py-12 text-center shadow-[0_8px_28px_rgba(58,33,23,0.04)]">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
                  <Heart size={23} strokeWidth={1.5} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#281912]">
                  No favourites yet
                </h3>

                <p className="mx-auto mt-1 max-w-[260px] text-xs leading-5 text-[#8A7569]">
                  Save products you love and they'll stay ready for you here.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="mt-5 min-h-[42px] rounded-full bg-[#3A2117] px-6 text-xs font-semibold text-white"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {wishlist.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/products/${product.name
                          ?.toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '')}`
                      )
                    }
                    className="group overflow-hidden rounded-[20px] border border-[#3A2117]/10 bg-[#FFFEFC] text-left shadow-[0_6px_20px_rgba(58,33,23,0.04)]"
                  >
                    <div className="aspect-square overflow-hidden bg-[#EEE7E1]">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-active:scale-[1.03]"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[#9A8171]">
                          <Heart size={22} strokeWidth={1.4} />
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="line-clamp-2 text-xs font-semibold leading-5 text-[#281912]">
                        {product.name}
                      </p>

                      <p className="mt-1.5 text-xs font-semibold text-[#6B4228]">
                        Rs.{' '}
                        {Number(product.price || 0).toLocaleString('en-PK')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ───────── REVIEWS ───────── */}
        {mobileTab === 'reviews' && (
          <div>
            <div className="mb-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A654D]">
                Your Feedback
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#281912]">
                My Reviews
              </h2>
            </div>

            <ReviewsList compact />
          </div>
        )}
        {/* ───────── PROFILE DETAILS ───────── */}
        {mobileTab === 'details' && (
          <div>
            <div className="mb-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A654D]">
                Personal Details
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#281912]">
                Profile Information
              </h2>
            </div>

            {!editing ? (
              <>
                <div className="overflow-hidden rounded-[24px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_8px_28px_rgba(58,33,23,0.04)]">

                  {/* Email */}
                  <div className="flex gap-3 border-b border-[#3A2117]/10 p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
                      <Mail size={16} strokeWidth={1.6} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9A8171]">
                        Email
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-[#281912]">
                        {profile?.email || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-3 border-b border-[#3A2117]/10 p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
                      <Phone size={16} strokeWidth={1.6} />
                    </div>

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9A8171]">
                        Phone
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#281912]">
                        {profile?.mobile || 'Not added'}
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex gap-3 p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
                      <MapPin size={16} strokeWidth={1.6} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9A8171]">
                        Delivery Address
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#281912]">
                        {[
                          profile?.addressLine1,
                          profile?.addressLine2,
                          profile?.city,
                          profile?.state,
                          profile?.postalCode,
                        ]
                          .filter(Boolean)
                          .join(', ') || 'No address added yet'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="
                  mt-4 min-h-[48px] w-full rounded-full
                  bg-[#3A2117] px-6 text-sm font-semibold text-white
                  shadow-[0_10px_25px_rgba(58,33,23,0.16)]
                  transition-transform active:scale-[0.99]
                "
                >
                  Edit Profile
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="
                  mt-3 flex min-h-[46px] w-full items-center
                  justify-center gap-2 rounded-full
                  border border-red-200 bg-[#FFFEFC]
                  text-sm font-semibold text-red-600
                "
                >
                  <LogOut size={15} strokeWidth={1.7} />
                  Sign Out
                </button>
              </>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-[24px] border border-[#3A2117]/10 bg-[#FFFEFC] p-4 shadow-[0_8px_28px_rgba(58,33,23,0.04)]"
              >
                <div className="space-y-4">
                  {[
                    {
                      label: 'First name',
                      name: 'firstName',
                      type: 'text',
                    },
                    {
                      label: 'Last name',
                      name: 'lastName',
                      type: 'text',
                    },
                    {
                      label: 'Mobile',
                      name: 'mobile',
                      type: 'tel',
                    },
                    {
                      label: 'Email',
                      name: 'email',
                      type: 'email',
                    },
                    {
                      label: 'Address line 1',
                      name: 'addressLine1',
                      type: 'text',
                    },
                    {
                      label: 'Address line 2',
                      name: 'addressLine2',
                      type: 'text',
                    },
                    {
                      label: 'City',
                      name: 'city',
                      type: 'text',
                    },
                    {
                      label: 'State',
                      name: 'state',
                      type: 'text',
                    },
                    {
                      label: 'Postal code',
                      name: 'postalCode',
                      type: 'text',
                    },
                  ].map(({ label, name, type }) => (
                    <div key={name}>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7A6559]">
                        {label}
                      </label>

                      <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className="
                        h-12 w-full rounded-xl
                        border border-[#3A2117]/15
                        bg-[#F7F4EF] px-4
                        text-sm text-[#281912] outline-none
                        transition
                        focus:border-[#6B4228]
                        focus:ring-4 focus:ring-[#6B4228]/[0.06]
                      "
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="
                    min-h-[46px] flex-1 rounded-full
                    border border-[#3A2117]/15
                    bg-[#FFFEFC] text-sm font-semibold
                    text-[#3A2117]
                  "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                    inline-flex min-h-[46px] flex-1
                    items-center justify-center gap-2
                    rounded-full bg-[#3A2117]
                    text-sm font-semibold text-white
                    disabled:cursor-not-allowed disabled:opacity-50
                  "
                  >
                    {loading && (
                      <Loader size={14} className="animate-spin" />
                    )}

                    {loading ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>

      {/* ═══════════════ MOBILE BOTTOM NAV ═══════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#3A2117]/10 bg-[#FFFEFC]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg">
          {[
            {
              label: 'Home',
              icon: Home,
              active: false,
              action: () => navigate('/'),
            },
            {
              label: 'Orders',
              icon: ShoppingBag,
              active: mobileTab === 'orders',
              action: () => {
                setEditing(false)
                setMobileTab('orders')
              },
            },
            {
              label: 'Wishlist',
              icon: Heart,
              active: mobileTab === 'wishlist',
              action: () => {
                setEditing(false)
                setMobileTab('wishlist')
              },
            },
            {
              label: 'Profile',
              icon: User,
              active: mobileTab === 'details',
              action: () => setMobileTab('details'),
            },
          ].map(({ label, icon: Icon, active, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-xl transition-colors ${active ? 'text-[#3A2117]' : 'text-[#A29187]'
                }`}
            >
              <div
                className={`grid h-7 w-10 place-items-center rounded-full transition-colors ${active ? 'bg-[#EEE5DC]' : ''
                  }`}
              >
                <Icon
                  size={17}
                  strokeWidth={active ? 2 : 1.6}
                />
              </div>

              <span
                className={`text-[9px] ${active ? 'font-semibold' : 'font-medium'
                  }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );

  // ─── DESKTOP VIEW ──────────────────────────────────
  const DesktopView = () => (
    <div className="mx-auto w-full max-w-[1320px] overflow-hidden rounded-[30px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_24px_70px_rgba(58,33,23,0.08)]">
      <div className="grid min-h-[650px] grid-cols-[285px_minmax(0,1fr)]">

        {/* ═══════════════ SIDEBAR ═══════════════ */}
        <aside className="relative overflow-hidden bg-[#3A2117] text-white">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/[0.035]" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/[0.025]" />

          <div className="relative px-6 pb-6 pt-7">
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#D7B99E]">
              Lamp & Glow Account
            </p>

            {/* Profile */}
            <div className="mt-7 text-center">
              <div className="relative mx-auto h-24 w-24">
                <div className="h-24 w-24 overflow-hidden rounded-full border-[4px] border-white/10 bg-[#F3E4D7] shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
                  {profile?.photoURL || profileImage ? (
                    <img
                      src={profile?.photoURL || profileImage}
                      alt={fullName || 'Profile'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-2xl font-semibold text-[#3A2117]">
                      {initials}
                    </div>
                  )}
                </div>

                <label
                  className="
                  absolute bottom-0 right-0 grid h-9 w-9 cursor-pointer
                  place-items-center rounded-full border-[3px]
                  border-[#3A2117] bg-[#FFFEFC] text-[#3A2117]
                  shadow-lg transition-transform hover:scale-105
                "
                  title="Change profile photo"
                >
                  {uploadingImage ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} strokeWidth={1.8} />
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              <h2 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-white">
                {fullName || 'Lamp & Glow Customer'}
              </h2>

              <p className="mt-1 truncate text-xs text-[#CBB8AC]">
                {profile?.email || 'Your account'}
              </p>

              {(profile?.city || profile?.state) && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-[#BCA89C]">
                  <MapPin size={11} strokeWidth={1.7} />
                  {[profile?.city, profile?.state].filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="mt-7 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-center">
                <span className="block text-lg font-semibold text-white">
                  {orders?.length || 0}
                </span>
                <span className="mt-0.5 block text-[9px] uppercase tracking-[0.14em] text-[#BCA89C]">
                  Orders
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-center">
                <span className="block text-lg font-semibold text-white">
                  {wishlist?.length || 0}
                </span>
                <span className="mt-0.5 block text-[9px] uppercase tracking-[0.14em] text-[#BCA89C]">
                  Wishlist
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="relative border-t border-white/10 px-4 py-5">
            <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#977F72]">
              My Account
            </p>

            <div className="space-y-1.5">
              {desktopNavItems.map(({ id, icon: Icon, label }) => {
                const active = activeTab === id

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3.5 text-left text-sm transition-all ${active
                      ? 'bg-[#FFFEFC] font-semibold text-[#3A2117] shadow-[0_8px_25px_rgba(0,0,0,0.12)]'
                      : 'text-[#D9C9BF] hover:bg-white/[0.06] hover:text-white'
                      }`}
                  >
                    <Icon
                      size={16}
                      strokeWidth={active ? 2 : 1.7}
                      className="shrink-0"
                    />

                    <span>{label}</span>
                  </button>
                )
              })}
            </div>

            <div className="my-4 border-t border-white/10" />

            <button
              type="button"
              onClick={onLogout}
              className="
              flex min-h-[44px] w-full items-center gap-3 rounded-xl
              px-3.5 text-left text-sm text-[#E8B4AA]
              transition-colors hover:bg-red-400/10 hover:text-[#FFD5CD]
            "
            >
              <LogOut size={16} strokeWidth={1.7} />
              Sign out
            </button>
          </nav>
        </aside>

        {/* ═══════════════ MAIN CONTENT ═══════════════ */}
        <main className="min-w-0 bg-[#F7F4EF] p-7 lg:p-9">

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <>
              <div className="mb-7 flex items-end justify-between gap-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A654D]">
                    Order History
                  </p>

                  <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-[#281912]">
                    My Orders
                  </h2>

                  <p className="mt-2 text-sm text-[#7A6A60]">
                    Keep track of your Lamp & Glow purchases and order status.
                  </p>
                </div>

                <Link
                  to="/orders"
                  className="
                  inline-flex min-h-[42px] items-center gap-2 rounded-full
                  border border-[#3A2117]/15 bg-[#FFFEFC]
                  px-5 text-xs font-semibold text-[#3A2117]
                  transition-colors hover:bg-[#F2ECE5]
                "
                >
                  <ShoppingBag size={14} />
                  View all orders
                </Link>
              </div>

              {/* Stats */}
              <div className="mb-7 grid grid-cols-3 gap-4">
                {[
                  {
                    label: 'Total Orders',
                    value: orders?.length || 0,
                    icon: ShoppingBag,
                  },
                  {
                    label: 'Wishlist',
                    value: wishlist?.length || 0,
                    icon: Heart,
                  },
                  {
                    label: 'Reviews',
                    value: userReviews.length,
                    icon: Star,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="
                    rounded-[20px] border border-[#3A2117]/10
                    bg-[#FFFEFC] p-5
                    shadow-[0_8px_25px_rgba(58,33,23,0.04)]
                  "
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-2xl font-semibold tracking-[-0.03em] text-[#281912]">
                          {value}
                        </span>

                        <p className="mt-1 text-[11px] font-medium text-[#8A7569]">
                          {label}
                        </p>
                      </div>

                      <div className="grid h-9 w-9 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
                        <Icon size={15} strokeWidth={1.7} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="rounded-[24px] border border-[#3A2117]/10 bg-[#FFFEFC] p-5 shadow-[0_10px_30px_rgba(58,33,23,0.04)]">
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                    Recent Activity
                  </p>

                  <h3 className="mt-1 text-base font-semibold text-[#281912]">
                    Recent Orders
                  </h3>
                </div>

                <OrdersList limit={5} />
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-[20px] border border-[#6B4228]/10 bg-[#EEE5DC] p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#3A2117] text-white">
                  <ShoppingBag size={15} strokeWidth={1.7} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#3A2117]">
                    Cash on Delivery available
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#7A6559]">
                    Shop with confidence and track your orders from your account.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* WISHLIST */}
          {activeTab === 'wishlist' && (
            <>
              <div className="mb-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A654D]">
                  Saved Collection
                </p>

                <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-[#281912]">
                  My Wishlist
                </h2>

                <p className="mt-2 text-sm text-[#7A6A60]">
                  All the pieces you've saved for later.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#3A2117]/10 bg-[#FFFEFC] p-5 sm:p-6">
                {!wishlist || wishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
                      <Heart size={25} strokeWidth={1.5} />
                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-[#281912]">
                      No favourites yet
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#8A7569]">
                      Save the pieces that catch your eye and they'll appear here.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate('/products')}
                      className="
                      mt-5 inline-flex min-h-[44px] items-center justify-center
                      rounded-full bg-[#3A2117] px-6 text-sm font-semibold
                      text-white transition-all hover:-translate-y-0.5
                      hover:bg-[#4A2B1F]
                    "
                    >
                      Explore Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                    {wishlist.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() =>
                          navigate(
                            `/products/${product.name
                              ?.toLowerCase()
                              .trim()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-+|-+$/g, '')}`
                          )
                        }
                        className="
                        group overflow-hidden rounded-[20px]
                        border border-[#3A2117]/10 bg-[#F7F4EF]
                        text-left transition-all duration-300
                        hover:-translate-y-1
                        hover:border-[#6B4228]/20
                        hover:shadow-[0_14px_35px_rgba(58,33,23,0.08)]
                      "
                      >
                        <div className="aspect-square overflow-hidden bg-[#ECE5DF]">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          )}
                        </div>

                        <div className="p-4">
                          <p className="line-clamp-2 text-sm font-semibold leading-5 text-[#281912]">
                            {product.name}
                          </p>

                          <p className="mt-2 text-sm font-semibold text-[#6B4228]">
                            Rs. {Number(product.price || 0).toLocaleString('en-PK')}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* REVIEWS */}
          {activeTab === 'reviews' && (
            <div>
              <div className="mb-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A654D]">
                  Your Feedback
                </p>

                <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-[#281912]">
                  My Reviews
                </h2>

                <p className="mt-2 text-sm text-[#7A6A60]">
                  Review your feedback and replies from Lamp & Glow.
                </p>
              </div>

              <ReviewsList />
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div>
              <div className="mb-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A654D]">
                  Account Updates
                </p>

                <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-[#281912]">
                  Notifications
                </h2>

                <p className="mt-2 text-sm text-[#7A6A60]">
                  Order and account notifications will appear here.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#3A2117]/10 bg-[#FFFEFC] py-16 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
                  <Bell size={25} strokeWidth={1.5} />
                </div>

                <p className="mt-5 text-sm font-semibold text-[#281912]">
                  You're all caught up
                </p>

                <p className="mt-1 text-xs text-[#8A7569]">
                  There are no notifications right now.
                </p>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <>
              <div className="mb-7 flex items-end justify-between gap-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A654D]">
                    Personal Details
                  </p>

                  <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-[#281912]">
                    Profile Information
                  </h2>

                  <p className="mt-2 text-sm text-[#7A6A60]">
                    Keep your contact and delivery information up to date.
                  </p>
                </div>

                {!editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="
                    inline-flex min-h-[42px] items-center justify-center
                    rounded-full bg-[#3A2117] px-5
                    text-xs font-semibold text-white
                    transition-all hover:-translate-y-0.5
                    hover:bg-[#4A2B1F]
                  "
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="rounded-[24px] border border-[#3A2117]/10 bg-[#FFFEFC] p-6">
                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {[
                        { label: 'First name', name: 'firstName', type: 'text' },
                        { label: 'Last name', name: 'lastName', type: 'text' },
                        { label: 'Mobile', name: 'mobile', type: 'tel' },
                        { label: 'Email', name: 'email', type: 'email' },
                      ].map(({ label, name, type }) => (
                        <div key={name}>
                          <label className="mb-1.5 block text-[11px] font-semibold text-[#5F4C42]">
                            {label}
                          </label>

                          <input
                            type={type}
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            className="
                            h-11 w-full rounded-xl border border-[#3A2117]/15
                            bg-[#F7F4EF] px-4 text-sm text-[#281912]
                            outline-none transition
                            focus:border-[#6B4228]
                            focus:ring-4 focus:ring-[#6B4228]/[0.06]
                          "
                          />
                        </div>
                      ))}

                      {[
                        { label: 'Address line 1', name: 'addressLine1' },
                        { label: 'Address line 2', name: 'addressLine2' },
                      ].map(({ label, name }) => (
                        <div key={name} className="sm:col-span-2">
                          <label className="mb-1.5 block text-[11px] font-semibold text-[#5F4C42]">
                            {label}
                          </label>

                          <input
                            type="text"
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            className="
                            h-11 w-full rounded-xl border border-[#3A2117]/15
                            bg-[#F7F4EF] px-4 text-sm text-[#281912]
                            outline-none transition
                            focus:border-[#6B4228]
                            focus:ring-4 focus:ring-[#6B4228]/[0.06]
                          "
                          />
                        </div>
                      ))}

                      {[
                        { label: 'City', name: 'city' },
                        { label: 'State', name: 'state' },
                        { label: 'Postal code', name: 'postalCode' },
                      ].map(({ label, name }) => (
                        <div key={name}>
                          <label className="mb-1.5 block text-[11px] font-semibold text-[#5F4C42]">
                            {label}
                          </label>

                          <input
                            type="text"
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            className="
                            h-11 w-full rounded-xl border border-[#3A2117]/15
                            bg-[#F7F4EF] px-4 text-sm text-[#281912]
                            outline-none transition
                            focus:border-[#6B4228]
                            focus:ring-4 focus:ring-[#6B4228]/[0.06]
                          "
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-3 border-t border-[#3A2117]/10 pt-5">
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="
                        min-h-[44px] rounded-full border border-[#3A2117]/15
                        px-6 text-sm font-semibold text-[#3A2117]
                        transition-colors hover:bg-[#F7F4EF]
                      "
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="
                        inline-flex min-h-[44px] min-w-[140px]
                        items-center justify-center gap-2 rounded-full
                        bg-[#3A2117] px-6 text-sm font-semibold text-white
                        transition-all hover:bg-[#4A2B1F]
                        disabled:cursor-not-allowed disabled:opacity-50
                      "
                      >
                        {loading && <Loader size={15} className="animate-spin" />}
                        {loading ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#F7F4EF] p-5">
                      <InfoRow
                        icon={<Mail size={16} className="text-[#6B4228]" />}
                        label="Email"
                        value={profile?.email}
                      />
                    </div>

                    <div className="rounded-2xl bg-[#F7F4EF] p-5">
                      <InfoRow
                        icon={<Phone size={16} className="text-[#6B4228]" />}
                        label="Phone"
                        value={profile?.mobile}
                      />
                    </div>

                    <div className="rounded-2xl bg-[#F7F4EF] p-5 sm:col-span-2">
                      <InfoRow
                        icon={
                          <MapPin
                            size={16}
                            className="mt-0.5 text-[#6B4228]"
                          />
                        }
                        label="Delivery Address"
                        value={[
                          profile?.addressLine1,
                          profile?.addressLine2,
                          profile?.city,
                          profile?.state,
                          profile?.postalCode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );

  // ─── ROOT ──────────────────────────────────────────
  return (
    <>
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-green-800 text-sm">{message}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      <div className="lg:hidden"><MobileView /></div>
      <div className="hidden lg:block"><DesktopView /></div>
    </>
  );
}

function InfoRow({ icon, label, value, compact = false }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>

      <div className="min-w-0">
        <p
          className={`font-medium text-[#8A7569] ${compact ? 'text-[10px]' : 'text-[11px]'
            }`}
        >
          {label}
        </p>

        <p
          className={`mt-1 break-words font-medium text-[#281912] ${compact ? 'text-xs' : 'text-sm'
            }`}
        >
          {value || '—'}
        </p>
      </div>
    </div>
  );
}