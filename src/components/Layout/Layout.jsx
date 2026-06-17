import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import Loader from '../common/Loader';

/**
 * Layout
 * The shared page shell rendered by every route: Header up top, the
 * routed page in the middle (via <Outlet />), Footer at the bottom.
 *
 * Wrapping <Outlet /> in its own <Suspense> means each lazy-loaded page
 * component shows the Loader while its chunk downloads, without the
 * Header/Footer disappearing and re-mounting on every navigation.
 *
 * Also resets scroll position to the top on every route change — without
 * this, navigating from the bottom of a long product grid to a new page
 * would leave the user scrolled halfway down it.
 */
function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Header />
      <main className="page-main">
        <Suspense fallback={<Loader label="Loading page…" size="lg" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
