import './Footer.css';

/**
 * Footer
 * Simple site-wide footer rendered by Layout on every page. Purely
 * presentational — no props needed.
 */
function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__brand">ShoppyGlobe</p>
        <p className="site-footer__note">
          Demo storefront built for a React training project. Catalog data courtesy of{' '}
          <a href="https://dummyjson.com" target="_blank" rel="noreferrer">dummyjson.com</a>.
        </p>
        <p className="site-footer__copy">© {year} ShoppyGlobe. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
