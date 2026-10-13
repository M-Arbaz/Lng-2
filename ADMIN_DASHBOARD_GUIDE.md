# Admin Dashboard - Comprehensive Management System

## Overview
A complete enterprise-level admin panel for managing products, orders, customers, coupons, and payments with real-time tracking and analytics.

---

## 📊 1. PRODUCT MANAGEMENT

### Features
- **Create/Edit/Delete Products** - Full CRUD operations
- **Stock Management** - Track inventory quantity
- **Product Status** - Toggle products active/inactive
- **Price Management** - Set regular price and original (compare-at) price
- **Multiple Images** - Upload and reorder product images
- **Image Reordering** - Drag to reorder with up/down buttons (first image = main)
- **Search & Filter** - Filter by name, category, or description
- **Category System** - 7 predefined lamp categories

### Product Fields
```
- Name (required)
- Category (required) - 7 lamp types
- Price (required) - Selling price
- Compare At Price - Original price (for discount display)
- Stock (required) - Quantity available
- Status - Active/Inactive toggle
- Description - Short product description
- Images - Multiple with reordering
```

### Categories Supported
1. Table Lamps
2. Floor Lamps
3. Candle Lamps
4. Roof/Ceiling Lamps
5. Wall Lamps
6. Hanging Lamps
7. Bedside/Side Table Lamps

### UI Features
- Grid view with image hover effects
- Real-time inventory updates
- Out of stock indicators
- Discount percentage calculation
- Image badge showing main image

---

## 👥 2. CUSTOMER MANAGEMENT

### Features
- **View All Customers** - List with sorting and search
- **Customer Details Modal** - Complete customer profile
- **Order History** - View all customer orders with summary
- **Block/Unblock Customers** - Restrict customer access
- **Support Tickets** - Manage customer complaints and messages
- **Customer Analytics** - Total orders, total spent, average order value

### Customer Information
```
- Name
- Email
- Phone
- Address
- Registration Date
- Total Orders Count
- Total Amount Spent
- Block Status
```

### Support Tickets System
- Create tickets for customer inquiries
- Track ticket status (open/resolved)
- Add admin responses
- View ticket history
- Timestamps for all interactions

### Statistics Displayed
- Total customers count
- Orders per customer
- Total spent per customer
- Average order value per customer

---

## 🎟️ 3. COUPON & DISCOUNT MANAGEMENT

### Features
- **Create Coupons** - Generate promo codes
- **Discount Types** - Percentage (%) or fixed amount (Rs)
- **Usage Limits** - Set maximum usage per coupon
- **Expiry Dates** - Set coupon validity period
- **Applicable To** - All products, specific products, or categories
- **Minimum Order Value** - Require minimum purchase
- **Enable/Disable** - Toggle coupon status
- **Usage Tracking** - Monitor coupon usage count
- **Copy Code** - One-click coupon code copying
- **Export Data** - View all coupon statistics

### Coupon Fields
```
- Code (required) - Unique coupon code
- Description - Offer details
- Discount Type (required) - Percentage or Fixed
- Discount Value (required) - Amount or percentage
- Applicable To - All/Products/Categories
- Minimum Order Value - Optional minimum
- Maximum Usage Limit - Optional limit
- Expiry Date - Optional expiration
- Status - Active/Inactive toggle
```

### Statistics Available
- Total coupons
- Active coupons count
- Total usage across all coupons
- Expired coupons count
- Copy-to-clipboard functionality

---

## 📦 4. ORDER MANAGEMENT

### Features
- **View All Orders** - Comprehensive order listing
- **Order Details Modal** - Complete order information
- **Status Updates** - Pending → Shipped → Delivered → Cancelled
- **Tracking Details** - Add shipping tracking information
- **Customer Information** - Full delivery address display
- **Order Items Display** - Detailed order line items
- **Payment Method** - Display payment information
- **Search & Filter** - By order ID, customer, email, phone, status

### Order Status Flow
```
Pending → Shipped → Delivered
       ↘ Cancelled (from any state)
```

### Tracking Details
- **Tracking Number** - Carrier tracking ID
- **Carrier** - TCS, Daewoo, LEA, Hundi, Other
- **Estimated Delivery** - Expected delivery date
- Add/Edit tracking anytime after order placement

### Order Summary
- Subtotal calculation
- Shipping charges
- Total amount
- Payment method (COD, Card, Bank Transfer)
- Order date and time

---

## 💳 5. PAYMENT MANAGEMENT

### Features
- **Payment History** - All transactions in one place
- **Payment Status Tracking** - Paid/Pending indicators
- **Payment Method Distribution** - Breakdown by COD, Card, Bank Transfer
- **Revenue Analytics** - Total revenue and averages
- **Export Reports** - Download payment data as CSV
- **Date Range Filtering** - Filter by date period
- **Advanced Filtering** - By status, payment method, customer
- **Dashboard Statistics** - Key metrics at a glance

### Statistics Displayed
```
- Total Revenue
- Paid Orders
- Pending Payments
- Average Order Value
- Payment method distribution percentages
```

### Payment Methods Tracked
1. Cash on Delivery (COD)
2. Card Payment
3. Bank Transfer
4. Other methods

### Report Features
- Export to CSV format
- Includes all transaction details
- Filterable data export
- Summary statistics in export

### Dashboard Metrics
- Total revenue amount
- Number of paid orders
- Number of pending payments
- Average transaction value
- Percentage breakdowns by payment method

---

## 🔐 ADMIN AUTHENTICATION

### Access
- **Login Route**: `/admin/login`
- **Credentials**: From `.env` file
  - `NEXT_PUBLIC_ADMIN_EMAIL`
  - `NEXT_PUBLIC_ADMIN_PASSWORD`
- **Session**: Stored in `localStorage`
- **Protection**: All admin routes require login

### Environment Setup
```env
NEXT_PUBLIC_ADMIN_EMAIL=admin@lampandglow.com
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

---

## 🗂️ ADMIN ROUTES

| Route | Page | Features |
|-------|------|----------|
| `/admin/login` | Admin Login | Email/Password authentication |
| `/admin/dashboard` | Dashboard | Overview statistics |
| `/admin/products` | Products | CRUD + Images + Stock |
| `/admin/orders` | Orders | Status updates + Tracking |
| `/admin/customers` | Customers | Profiles + Orders + Support |
| `/admin/coupons` | Coupons | Create/Manage discount codes |
| `/admin/payments` | Payments | Revenue tracking + Reports |

---

## 💾 DATA STORAGE

### Firebase Collections
- **products** - All product data with images (Storage URLs)
- **orders** - Order records with customer details
- **users** - Customer information
- **coupons** - Discount codes and policies
- **support_tickets** - Customer support interactions

### Firebase Storage
- Product images stored in `gs://bucket/products/`
- Images accessible via HTTPS download URLs

### localStorage
- Admin authentication token
- User orders (organized by userId)
- Cart data
- User authentication token

---

## 🎨 UI/UX Features

### Admin Layout
- **Responsive Sidebar** - Collapsible navigation
- **Top Header** - User profile + logout
- **Breadcrumb Navigation** - Visual hierarchy
- **Consistent Styling** - Orange/gradient theme
- **Loading States** - Spinner indicators
- **Toast Notifications** - Success/error messages

### Icons Used (Lucide Icons)
- LayoutDashboard, Package, ShoppingCart
- Users, Ticket, DollarSign
- Plus, Edit, Trash2, Search
- Eye, MapPin, Phone, Mail
- Truck, CheckCircle, AlertCircle
- Download, TrendingUp, Copy

### Color Scheme
- **Orange**: Primary accent (#FF8C00)
- **Green**: Success states
- **Blue**: Information/Links
- **Red**: Danger/Delete
- **Purple**: Special actions

---

## 📱 RESPONSIVE DESIGN

- ✅ Desktop optimized
- ✅ Tablet friendly
- ✅ Mobile-responsive tables
- ✅ Collapsible sidebar on mobile
- ✅ Stacked layouts on small screens
- ✅ Touch-friendly buttons

---

## 🚀 KEY TECHNICAL FEATURES

### Database Integration
- Firebase Firestore for data persistence
- Firebase Storage for images
- Real-time data synchronization

### State Management
- React hooks (useState, useEffect)
- Context API for authentication
- useMemo for performance optimization

### Form Handling
- Controlled components
- Input validation
- Error messages
- Loading states during submission

### Search & Filter
- Real-time search
- Multiple filter options
- Combined filtering logic
- Optimized with useMemo

### Export Functionality
- CSV file generation
- Dynamic data export
- Timestamp included
- Summary data in exports

---

## ✨ FUTURE ENHANCEMENTS

Potential additions:
- PDF invoice generation
- Email notifications
- Bulk import/export
- Advanced analytics charts
- Customer segments
- Automated reports
- Inventory alerts
- Multi-user admin roles

---

## 📝 USAGE NOTES

1. **Product Images**: First image automatically marked as "Main"
2. **Stock Management**: Set stock to 0 to show "Out of Stock"
3. **Coupons**: Codes are auto-converted to UPPERCASE
4. **Tracking**: Add tracking details once order is placed
5. **Reports**: Exports include summary statistics
6. **Customers**: Block features prevent further purchases
7. **Payments**: Status is automatically updated from order status

---

## 🔍 TROUBLESHOOTING

### Images Not Uploading
- Check Firebase Storage permissions
- Verify file size limits
- Clear browser cache

### Data Not Appearing
- Refresh page
- Check Firebase connection
- Verify authentication token
- Check localStorage

### Coupons Not Working
- Verify coupon status is "Active"
- Check expiry date
- Verify minimum order value
- Ensure usage limit not exceeded

---

## 📞 SUPPORT

For issues or questions about the admin dashboard, check:
1. Firebase Console for database status
2. Browser console for error messages
3. Network tab for API call issues
4. localStorage for cached data

---

Generated: May 24, 2026
Version: 1.0
Status: Production Ready
