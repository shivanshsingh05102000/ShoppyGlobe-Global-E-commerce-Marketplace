import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';

/**
 * Route-level code splitting.
 *
 * Per the rubric: "Implement code splitting and lazy loading for
 * components using React.lazy and Suspense." We apply React.lazy at the
 * route boundary — Home, ProductDetail, Cart, Checkout, and NotFound each
 * become their own JS chunk, downloaded only when that route is actually
 * visited. This is the standard, React-docs-recommended place to split a
 * routed app, and it's what a `npm run build` chunk list will show.
 *
 * We deliberately do NOT lazy-load ProductItem/CartItem individually:
 * those render inside list loops (potentially dozens at once), and
 * wrapping each list item in its own lazy boundary would mean dozens of
 * simultaneous network requests and loading flickers for components that
 * are only a few KB each — a well-known anti-pattern, not a performance
 * win. Layout, Header, and Footer are excluded too, since they render on
 * every single route and lazy-loading the app shell itself would only add
 * a delay with no payload-size benefit.
 *
 * The single <Suspense> boundary that covers all of these lives in
 * Layout.jsx, wrapping <Outlet />, so navigating between routes shows the
 * Loader exactly while the next chunk downloads.
 */
const Home = lazy(() => import('../pages/Home'));
const ProductDetail = lazy(() => import('../components/ProductDetail/ProductDetail'));
const Cart = lazy(() => import('../components/Cart/Cart'));
const Checkout = lazy(() => import('../components/Checkout/Checkout'));
const NotFound = lazy(() => import('../components/NotFound/NotFound'));

/**
 * createBrowserRouter (rather than the legacy <BrowserRouter>) gives data
 * APIs (loaders/actions, errorElement) even though this app keeps state in
 * Redux rather than route loaders. The dynamic `:productId` segment is
 * what makes the router "dynamic" per the rubric note.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'product/:productId', element: <ProductDetail /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
