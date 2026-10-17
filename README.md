# ABIEST website

Next.js 15 (App Router) + Tailwind 4 + Mongoose + MongoDB.
Storefront (Home, Shop, Product, Bulk & events, About, Contact, Cart, Checkout) and an admin dashboard.

## First run

```bash
npm install
cp .env.example .env                   # set MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET
npm run db:seed                        # adds the 3 products with placeholder prices (collections are created automatically)
npm run dev                            # http://localhost:3000
```

Dashboard: http://localhost:3000/dashboard (sign in with ADMIN_EMAIL / ADMIN_PASSWORD).

## Where things live

| Path | What |
|---|---|
| `src/lib/db.ts` | MongoDB connection and models: Product (with embedded Variants: size/flavour + price + stock), Order (with embedded items), Inquiry |
| `scripts/seed.ts` | Seeds the starter products |
| `src/app/(site)/` | Public pages |
| `src/app/dashboard/` | Login + admin (products CRUD, orders, inquiries) |
| `src/lib/actions/` | Server actions: `orders.ts` (checkout), `inquiries.ts` (forms), `admin.ts` (dashboard) |
| `src/lib/site.ts` | Phone, WhatsApp, email, addresses, NAFDAC number |
| `src/app/globals.css` | Brand tokens (colours, fonts) and button/field styles |
| `public/products/` | Studio packshots of the redesigned packaging |
| `src/components/site/logo.tsx` | Logo as inline SVG (follows text colour) |

## Notes
- Money is stored in kobo. The dashboard takes naira.
- Checkout re-prices from the database, checks stock and decrements it. Cancelling an order in the dashboard returns the stock.
- Payment is pay-on-delivery / transfer, confirmed on WhatsApp. Paystack can be added in `placeOrder`.
- Uploaded photos are stored in MongoDB (GridFS bucket `images`) and served from `/api/images/...` (`src/lib/storage.ts`), so uploads work on Vercel. Vercel caps a request at 4.5MB, so each save can carry about 4MB of new photos.
- Checkout takes stock with atomic conditional updates (no multi-document transactions), so a plain standalone MongoDB works; no replica set needed.

## Before launch
- Set real prices and stock in the dashboard (seed prices are placeholders).
- Confirm the chips ingredients apply to the unripe chips too.
- Replace the About page copy with the founders' story.
- Swap packshots for real product photos when you have them (Dashboard → Products → Photos).
