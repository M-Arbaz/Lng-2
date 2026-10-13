'use client'

import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@/lib/navigation';
import uploadToXcdn from '@/utils/xcdnUpload';
import {
  User, Mail, Phone, MapPin, AlertCircle, Loader, CheckCircle,
  ShoppingBag, Heart, MapPin as MapPinIcon, Star, Bell, Settings,
  LogOut, SlidersHorizontal, Home, Camera
} from 'lucide-react';

export default function ProfileSection({ profile, orders, wishlist = [], handleProfileChange, onLogout }) {
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

  const desktopNavItems = [
    { id: 'orders', icon: ShoppingBag, label: 'My orders' },
    { id: 'wishlist', icon: Heart, label: 'Wishlist' },
    { id: 'reviews', icon: Star, label: 'Reviews' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

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
    <div className="flex flex-col min-h-screen bg-white">

      {/* Brown banner + floating avatar */}
      <div className="relative">
        <div className="h-24 bg-[#3B1F04]" />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-6">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[#EF9F27] border-2 border-white flex items-center justify-center overflow-hidden text-sm font-bold text-[#412402]">
              {profile?.photoURL || profileImage ? (
                <img src={profile?.photoURL || profileImage} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#5A2D0C] text-white flex items-center justify-center cursor-pointer">
              <Camera size={12} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>
      </div>

      {/* Name + location */}
      <div className="pt-9 pb-3 text-center px-4">
        <p className="text-sm font-semibold text-stone-900">{fullName || 'User'}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {profile?.city ? `${profile.city} · ` : ''}Member since 2024
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-4 mb-3">
        {[
          { label: 'Orders', value: orders?.length || 0 },
          { label: 'Wishlist', value: 0 },
          { label: 'Reviews', value: 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-stone-50 border border-stone-100 rounded-xl p-2.5 text-center">
            <span className="text-base font-bold text-[#BA7517] block">{value}</span>
            <span className="text-[10px] text-stone-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Tab strip */}
      <div className="flex border-b border-stone-100 px-4">
        {[
          { id: 'orders', label: 'Orders' },
          { id: 'wishlist', label: 'Wishlist' },
          { id: 'details', label: 'Details' },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setMobileTab(id)}
            className={`flex-1 text-xs py-2.5 font-medium transition-colors border-b-2 -mb-px
              ${mobileTab === id ? 'text-[#BA7517] border-[#EF9F27]' : 'text-stone-400 border-transparent'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 pt-3 pb-24 overflow-y-auto">

        {mobileTab === 'orders' && <OrdersList limit={10} compact />}

        {mobileTab === 'wishlist' && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Heart size={28} className="text-stone-200" />
            <p className="text-xs text-stone-400">Your wishlist is empty</p>
          </div>
        )}

        {mobileTab === 'details' && (
          <div>
            {!editing ? (
              <>
                <div className="flex flex-col gap-3 mb-4">
                  {profile?.email && <InfoRow icon={<Mail size={14} className="text-stone-400" />} label="Email" value={profile.email} compact />}
                  {profile?.mobile && <InfoRow icon={<Phone size={14} className="text-stone-400" />} label="Phone" value={profile.mobile} compact />}
                  {(profile?.addressLine1 || profile?.city) && (
                    <InfoRow
                      icon={<MapPin size={14} className="text-stone-400 mt-0.5" />}
                      label="Address"
                      value={[profile?.addressLine1, profile?.addressLine2, profile?.city, profile?.state, profile?.postalCode].filter(Boolean).join(', ')}
                      compact
                    />
                  )}
                </div>
                <button onClick={() => setEditing(true)}
                  className="w-full py-2 bg-[#5A2D0C] text-white text-xs font-medium rounded-lg mb-2">
                  Edit profile
                </button>
                <button onClick={onLogout}
                  className="w-full py-2 text-xs font-medium text-red-500 border border-red-200 rounded-lg">
                  Sign out
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                {[
                  { label: 'First name', name: 'firstName', type: 'text' },
                  { label: 'Last name', name: 'lastName', type: 'text' },
                  { label: 'Mobile', name: 'mobile', type: 'tel' },
                  { label: 'Email', name: 'email', type: 'email' },
                  { label: 'Address line 1', name: 'addressLine1', type: 'text' },
                  { label: 'Address line 2', name: 'addressLine2', type: 'text' },
                  { label: 'City', name: 'city', type: 'text' },
                  { label: 'State', name: 'state', type: 'text' },
                  { label: 'Postal code', name: 'postalCode', type: 'text' },
                ].map(({ label, name, type }) => (
                  <div key={name}>
                    <label className="block text-[10px] font-medium text-stone-500 mb-1">{label}</label>
                    <input type={type} name={name} value={formData[name]} onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white text-stone-900" />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-[#5A2D0C] text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50">
                    {loading && <Loader size={12} className="animate-spin" />}
                    {loading ? 'Saving…' : 'Save changes'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)}
                    className="flex-1 bg-stone-100 text-stone-600 text-xs font-medium py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 flex z-10">
        {[
          { label: 'Home', icon: Home, action: () => navigate('/') },
          { label: 'Orders', icon: ShoppingBag, action: () => setMobileTab('orders') },
          { label: 'Wishlist', icon: Heart, action: () => setMobileTab('wishlist') },
          { label: 'Profile', icon: User, action: () => setMobileTab('details') },
        ].map(({ label, icon: Icon, action }) => (
          <button key={label} onClick={action}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[#BA7517]">
            <Icon size={18} />
            <span className="text-[9px]">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ─── DESKTOP VIEW ──────────────────────────────────
  const DesktopView = () => (
    <div className="w-full border border-stone-200 rounded-xl overflow-hidden shadow-sm bg-white grid grid-cols-[240px_1fr]">

      <aside className="bg-[#412402]">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 text-[#FAC775] text-xs font-medium tracking-widest mb-5">
            {fullName}
          </div>
          <div className="relative w-12 h-12 mx-auto mb-2">
            <div className="w-12 h-12 rounded-full bg-[#EF9F27] flex items-center justify-center overflow-hidden text-base font-semibold text-[#412402]">
              {profile?.photoURL || profileImage ? (
                <img src={profile?.photoURL || profileImage} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#5A2D0C] text-white flex items-center justify-center cursor-pointer">
              <Camera size={12} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <p className="text-sm font-medium text-[#FAC775] text-center">{fullName}</p>
          <p className="text-xs text-[#854F0B] text-center mt-1">Member since 2024</p>
          <div className="h-px bg-[#633806] mt-4" />
        </div>
        <nav className="flex flex-col gap-1 px-4 pb-4">
          {desktopNavItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full text-left transition-colors
                ${activeTab === id ? 'bg-[rgba(239,159,39,0.18)] text-[#FAC775] font-medium' : 'text-[#C87020] hover:bg-[rgba(255,180,60,0.1)]'}`}>
              <Icon size={15} />{label}
            </button>
          ))}
          <div className="h-px bg-[#633806] my-1" />
          <button onClick={onLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#A32D2D] hover:bg-[rgba(255,180,60,0.1)] transition-colors w-full">
            <LogOut size={15} /> Sign out
          </button>
        </nav>
      </aside>

      <main className="p-5 overflow-y-auto min-h-[500px]">

        {activeTab === 'orders' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-stone-900">My orders</h2>
              <Link to="/orders" className="text-xs px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:border-stone-400 flex items-center gap-1.5 transition-colors">
                <SlidersHorizontal size={12} /> Filter
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[{ label: 'Total orders', value: orders?.length || 0 }, { label: 'Wishlist', value: 0 }, { label: 'Reviews', value: 0 }].map(({ label, value }) => (
                <div key={label} className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-center">
                  <span className="text-xl font-semibold text-[#BA7517] block">{value}</span>
                  <span className="text-xs text-stone-500">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Recent orders</p>
            <OrdersList limit={5} />
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FAEEDA] mt-4">
              <ShoppingBag size={18} className="text-[#854F0B] flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#633806]">COD available nationwide</p>
                <p className="text-xs text-[#854F0B]">Cash on delivery on all orders · Free delivery over Rs. 3,000</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-stone-200 bg-white p-6">
              <h3 className="text-base font-semibold text-stone-900 mb-4">My Wishlist</h3>
              {(!wishlist || wishlist.length === 0) ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <Heart size={36} className="text-stone-300" />
                  <p className="text-sm text-stone-400">Your wishlist is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map((product) => (
                    <div key={product.id} className="rounded-xl border border-stone-200 bg-stone-50 overflow-hidden">
                      <div className="aspect-square bg-stone-100">
                        {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-stone-900">{product.name}</p>
                        <p className="text-sm font-bold text-[#5A2D0C]">Rs {Number(product.price).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}



        {activeTab === 'reviews' && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Star size={36} className="text-stone-300" /><p className="text-sm text-stone-400">No reviews yet</p>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Bell size={36} className="text-stone-300" /><p className="text-sm text-stone-400">No notifications</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-stone-900">Profile information</h2>
              {!editing && (
                <button onClick={() => setEditing(true)}
                  className="px-3 py-1.5 bg-[#5A2D0C] hover:bg-[#7A4A20] text-white rounded-lg text-sm font-medium transition-colors">
                  Edit profile
                </button>
              )}
            </div>
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'First name', name: 'firstName', type: 'text' },
                    { label: 'Last name', name: 'lastName', type: 'text' },
                    { label: 'Mobile', name: 'mobile', type: 'tel' },
                    { label: 'Email', name: 'email', type: 'email' },
                  ].map(({ label, name, type }) => (
                    <div key={name}>
                      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
                      <input type={type} name={name} value={formData[name]} onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-stone-900" />
                    </div>
                  ))}
                  {[
                    { label: 'Address line 1', name: 'addressLine1', span: true },
                    { label: 'Address line 2', name: 'addressLine2', span: true },
                  ].map(({ label, name, span }) => (
                    <div key={name} className={span ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
                      <input type="text" name={name} value={formData[name]} onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-stone-900" />
                    </div>
                  ))}
                  {[
                    { label: 'City', name: 'city' }, { label: 'State', name: 'state' }, { label: 'Postal code', name: 'postalCode' },
                  ].map(({ label, name }) => (
                    <div key={name}>
                      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
                      <input type="text" name={name} value={formData[name]} onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-stone-900" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-[#5A2D0C] hover:bg-[#7A4A20] text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading && <Loader size={15} className="animate-spin" />}
                    {loading ? 'Saving…' : 'Save changes'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-2 rounded-lg text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <InfoRow icon={<Mail size={16} className="text-stone-400" />} label="Email" value={profile?.email} />
                {profile?.mobile && <InfoRow icon={<Phone size={16} className="text-stone-400" />} label="Phone" value={profile.mobile} />}
                {(profile?.addressLine1 || profile?.city) && (
                  <InfoRow icon={<MapPin size={16} className="text-stone-400 mt-0.5" />} label="Address"
                    value={[profile?.addressLine1, profile?.addressLine2, profile?.city, profile?.state, profile?.postalCode].filter(Boolean).join(', ')} />
                )}
              </div>
            )}
          </div>
        )}
      </main>
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
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className={`text-stone-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>{label}</p>
        <p className={`font-medium text-stone-900 ${compact ? 'text-xs' : 'text-sm'}`}>{value || '—'}</p>
      </div>
    </div>
  );
}