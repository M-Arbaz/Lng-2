# Lamp & Glow — Next.js App Router

This project has been converted from the original Vite + React Router application to **Next.js App Router + React**.

## Project structure

```text
src/
├── app/                    # Next.js App Router routes
│   ├── page.js             # /
│   ├── products/
│   │   ├── page.js         # /products
│   │   └── [slug]/page.js  # /products/:slug
│   ├── blog/[slug]/page.js
│   ├── collections/[slug]/page.js
│   ├── admin/.../page.js
│   ├── layout.js
│   ├── sitemap.js
│   ├── robots.js
│   └── manifest.js
├── components/             # Shared UI components
│   └── routes/             # Small client route adapters
├── context/                # Auth + global storefront state
├── hooks/
├── pages/                  # Existing page UI components, kept separate/editable
├── sections/               # Home/product/profile sections
├── data/
├── lib/
│   ├── navigation.jsx      # Next Router compatibility helper
│   └── seo.js              # Shared SEO metadata helper
└── utils/                  # Firebase/services/helpers
```

The code remains split into editable files. `src/app/<route>/page.js` controls routing and SEO, while the larger UI stays in `src/pages`, `src/components`, and `src/sections`.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy/configure environment variables. The converted project already includes the migrated `.env`; for a fresh setup use:

```bash
cp .env.example .env.local
```

3. Start development:

```bash
npm run dev
```

4. Production build:

```bash
npm run build
npm start
```

## Routing

Routing is handled by the **Next.js App Router**. `react-router-dom` has been removed. Existing UI components use `src/lib/navigation.jsx`, which internally uses `next/link` and `next/navigation`, so old component APIs remain readable while the actual router is Next.js.

Legacy URLs are preserved with redirects, including `/signin`, `/about-us`, `/newarivals`, `/salesproducts`, and `/customorder`.

## SEO

The conversion includes:

- Route-level metadata (`title`, `description`, canonical URL)
- Open Graph metadata
- Twitter card metadata
- `robots.js`
- `sitemap.js`
- Web app `manifest.js`
- Organization JSON-LD in the root layout
- Dynamic slug-based metadata for product, blog, collection, reel, and CMS pages
- `noindex` on account/cart/checkout/admin routes

For fully data-driven product/blog SEO (live product image, exact description, price, availability), the next improvement would be reading Firebase data server-side in each route's `generateMetadata`.

## Firebase

The original Vite environment names were migrated from `VITE_*` to `NEXT_PUBLIC_*` variables. Firebase remains client-side and keeps the existing Firestore/Auth/Storage behavior.

## Important admin-auth note

The original project validates admin credentials in frontend code. That behavior is preserved for compatibility, but production sites should move admin authentication to a secure server-side session/API route and keep passwords out of `NEXT_PUBLIC_*` variables.
