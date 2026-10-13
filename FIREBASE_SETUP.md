# Firebase Integration Setup Guide

This document explains how to set up Firebase for the Lamp and Glow ecommerce application.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `lampandglow`
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Under "Your apps" section, click "Web" icon to add a web app
3. Enter app name: `lampandglow-web`
4. Copy the Firebase configuration object
5. Paste your credentials in `.env` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 3. Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select a region (e.g., us-east1)
5. Click "Create"

## 5. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" provider
4. Click "Enable" and save

## 6. Create Collections in Firestore

### Create Products Collection

1. In Firestore, click "Create collection"
2. Name it: `products`
3. Click "Auto ID" for the first document and add:

```json
{
  "name": "Mushroom Floor Lamp",
  "category": "Floor Lamp",
  "price": 24500,
  "compareAtPrice": 20000,
  "image": "https://www.lampandglow.com/cdn/shop/files/MushroomFloorLamp_2.webp",
  "images": ["url1", "url2", "url3"],
  "sku": "LG-LAMP-0001",
  "stock": 20,
  "bulbOptions": ["With Bulb", "Without Bulb"],
  "productType": "Bedside lamp",
  "description": "Product description here",
  "featured": true,
  "productDetails": {
    "baseMaterial": "Solid wood",
    "shadeMaterial": "Premium linen blend fabric",
    "baseColors": ["Deep Espresso Brown", "Black", "White"],
    "height": "60 inches",
    "socket": "E27",
    "maxWattage": "16W"
  }
}
```

4. Add more products following the same structure

### Create Users Collection (Auto-created)

- Users collection is automatically created when you sign up using Firebase Authentication

### Create Orders Collection (Auto-created)

- Orders collection is automatically created when users place orders

## 7. Set Firestore Security Rules

In Firestore, go to "Rules" and update them:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access to products
    match /products/{document=**} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && isAdmin();
    }
    
    // Users can read/write their own data
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Users can only read/write their own orders
    match /orders/{document=**} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow write: if request.auth != null && isAdmin();
    }
    
    // Helper function
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 8. Using the Application

### Signup/Login
- Users can create accounts or log in using email and password
- Authentication is handled by Firebase Authentication

### Add Products to Cart
- Browse products (fetched from Firestore)
- Add items to cart
- Adjust quantities

### Place Orders
- User must be logged in to place order
- Select Cash on Delivery (COD) payment method
- Enter delivery address
- Place order - saved to Firestore with user ID and timestamp

### View Orders
- Users can view their orders in the profile/orders section
- Orders are filtered by their user ID from Firestore

## 9. Firebase Firestore Structure

```
firestore/
  ├── products/
  │   ├── {documentId}
  │   │   ├── name
  │   │   ├── category
  │   │   ├── price
  │   │   ├── image
  │   │   └── ... (other fields)
  │
  ├── users/
  │   ├── {uid}
  │   │   ├── email
  │   │   ├── displayName
  │   │   ├── role
  │   │   └── ... (profile data)
  │
  └── orders/
      └── {orderId}
          ├── userId
          ├── items
          ├── status
          ├── paymentMethod: "cash_on_delivery"
          ├── total
          └── createdAt
```

## 10. Important Notes

- **Products Fetching**: Products are fetched from Firestore on app load
- **Authentication**: Uses Firebase Authentication with email/password
- **Orders**: Only logged-in users can place orders
- **Payment Method**: Currently set to "Cash on Delivery" (COD)
- **Product Images**: Use external URLs or upload to Firebase Storage

## Troubleshooting

1. **Products not showing**: Check Firestore Rules - ensure read access to products
2. **Can't login**: Check Authentication Rules - ensure Email/Password is enabled
3. **Orders not saving**: Check user ID is being passed and Firestore Rules allow write access

## Next Steps

1. Add more products to the products collection
2. Configure Firestore Rules for production
3. Set up Firebase Storage for product images
4. Consider implementing order notifications with Cloud Functions
