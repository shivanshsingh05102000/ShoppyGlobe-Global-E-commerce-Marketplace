# ShoppyGlobe — Global E-commerce Marketplace

A React + Redux Toolkit + React Router storefront built for the **Internshala Trainings "ShoppyGlobe E-commerce Application"** project brief. Product data comes live from [dummyjson.com/products](https://dummyjson.com/products).

**Repository:** `https://github.com/shivanshsingh05102000/ShoppyGlobe-Global-E-commerce-Marketplace.git`

## Tech stack

- **React 19** + **Vite** (build tool, per the assignment's mandatory requirement)
- **Redux Toolkit** + **react-redux** — cart state and search/filter/sort state
- **React Router v7**, configured with **`createBrowserRouter`**
- Plain CSS — a small hand-built design system (CSS variables for color/type/spacing), no UI framework
- **prop-types** for runtime prop validation

## Getting started

```bash
npm install
npm run dev
```

This opens the app at `http://localhost:5173` (or the next free port Vite picks). Other scripts:

```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm run lint      # eslint — should report 0 errors, 0 warnings
```

> `node_modules` is **not** included in this submission (per the assignment's guidelines) — run `npm install` first.

## Project structure

```
src/
  components/
    Header/          nav, debounced search, cart badge
    Footer/
    Layout/           page shell: Header + <Suspense><Outlet /></Suspense> + Footer
    ProductList/      fetches + renders the catalog grid
    ProductItem/       single product card
    ProductDetail/     single product page (route param driven)
    Cart/              cart page + order summary
    CartItem/          single cart line (qty stepper + remove)
    Checkout/          validated dummy checkout form + success flow
    NotFound/          404 page, reused for "product not found" too
    common/            Loader, ErrorMessage, EmptyState, LazyImage, QuantityStepper
  pages/
    Home.jsx           "/" route — banner + <ProductList />
  redux/
    store.js
    cartSlice.js / cartSelectors.js
    filtersSlice.js / filtersSelectors.js
  hooks/
    useProducts.js       custom hook — fetch the catalog
    useProductDetail.js  custom hook — fetch one product by id
    useDebounce.js
  router/
    router.jsx         createBrowserRouter + route-level React.lazy
  utils/
    formatPrice.js, constants.js
```

## Feature → rubric coverage

**Setup (Vite — mandatory):** scaffolded with `npm create vite@latest -- --template react`; see the first commits in the git log.

**Component Structure :** every required component exists as its own folder — `App`, `Header`, `ProductList`, `ProductItem`, `ProductDetail`, `Cart`, `CartItem`, `NotFound`, `Checkout` — plus supporting components (`Layout`, `Footer`, `Home`, and the `common/` set) that keep each of those focused and reusable.

**Props :** `ProductItem` receives its `product` object from `ProductList`; `CartItem` receives its `item` from `Cart`; `Loader`, `ErrorMessage`, `EmptyState`, `LazyImage`, `QuantityStepper`, and `NotFound` are all generic, prop-driven, reusable components with `propTypes` declared.

**Data Fetching with useEffect :** `useProducts` (custom hook, used by `ProductList`) and `useProductDetail` (used by `ProductDetail`, driven by the `:productId` route param) both fetch inside `useEffect`, store results in state, and clean up via `AbortController`. Both surface a dedicated error state with a "Try again" retry action (`ErrorMessage`), and `ProductDetail` distinguishes a true 404 from other failures and renders the `NotFound` component for it.

**State Management :** `cartSlice` owns all cart actions/reducers (`addToCart`, `removeFromCart`, `incrementQuantity`, `decrementQuantity`, `setQuantity`, `clearCart`); `cartSelectors.js` derives totals, counts, shipping, and tax via memoized `createSelector` selectors. The search feature lives entirely in Redux (`filtersSlice` + `filtersSelectors`) — `Header` dispatches `setSearchTerm`, and `ProductList` derives its visible list from a memoized selector combining search term, category, and sort.

**Event Handling :** "Add to cart" on `ProductItem`/`ProductDetail`, "Remove" on `CartItem`, and the `QuantityStepper` +/- controls on both `CartItem` and `ProductDetail` — all dispatch to the cart slice, and quantity is clamped so it never drops below 1 (enforced both in the reducer and in the disabled state of the stepper's "−" button).

**React Routing :** `router/router.jsx` uses `createBrowserRouter` with routes for Home (`/`), Product Detail (`/product/:productId` — a dynamic param), Cart (`/cart`), and Checkout (`/checkout`), plus a `*` wildcard to `NotFound`.

**React Lists :** `ProductList` and `Cart` both render their arrays with a stable `key={item.id}`.

**Performance Optimization :** every routed page (`Home`, `ProductDetail`, `Cart`, `Checkout`, `NotFound`) is loaded via `React.lazy` and rendered inside a single `<Suspense>` in `Layout`, so each page ships as its own JS chunk (visible in the `npm run build` output). `LazyImage` lazy-loads every product/cart image via `IntersectionObserver` plus the native `loading="lazy"` attribute. (See the comment in `router.jsx` for why list-item components like `ProductItem`/`CartItem` are intentionally *not* individually lazy-loaded — splitting components that render dozens-at-a-time inside a loop is a recognized anti-pattern, not a performance win.)

**Styling :** a custom design system (CSS variables for color, type, spacing, radius — see `src/index.css`) themed around global shipping/trade (the recurring "price tag" signature element). Fully responsive — grids reflow, the cart/checkout two-column layouts stack on mobile, and the header collapses its nav labels on small screens.

**Submission Guidelines :** the app builds and lints clean (`npm run build` / `npm run lint`, both 0 errors); code is commented throughout, explaining *why* not just *what*; `node_modules` is excluded from this submission; the included `.git` history has well over 25 small, relevant commits — see `git log --oneline` once you have the folder.

## Extra touches beyond the brief

- Category filter and sort (price/rating), in addition to the required search — all redux-driven.
- A free-shipping threshold with a live "add $X more for free shipping" nudge in the cart.
- Checkout form validation on every field (name, email, phone, address, card number, expiry, CVV — including an actual expiry-date check), with per-field inline errors and focus-jump to the first invalid field on submit.
- Skeleton shimmer placeholders while images lazy-load, with a graceful fallback if an image fails.
- Discount-aware pricing throughout (dummyjson's `discountPercentage`), shown with a strike-through original price.

## Design notes

ShoppyGlobe is themed around international shipping/trade rather than a generic storefront look: a cool indigo-navy + marine-teal palette with a coral call-to-action color, Space Grotesk for display type, Inter for body text, and IBM Plex Mono for prices and order IDs (the "manifest" voice of a printed price tag or shipping label). The recurring signature element is a die-cut price-tag chip, used everywhere a price appears.

## A note on the checkout

This is a **dummy** checkout, exactly as the brief asks for: no payment is actually processed and nothing is sent to any server. Card details are validated client-side for format only (16-digit number, MM/YY not in the past, 3–4 digit CVV) and never stored or transmitted anywhere.

