import ProductList from '../components/ProductList/ProductList';
import './Home.css';

/**
 * Home
 * The "/" route. Thin wrapper around ProductList — kept as its own page
 * component (rather than routing straight to ProductList) so a banner or
 * other home-page-only content can live here without touching ProductList
 * itself.
 */
function Home() {
  return (
    <div className="home-page">
      <div className="container">
        <div className="home-banner">
          <p className="home-banner__eyebrow">Worldwide shipping · Every category</p>
          <h1 className="home-banner__title">Goods from everywhere, delivered anywhere.</h1>
          <p className="home-banner__subtitle">
            Browse the full ShoppyGlobe catalog below — search, filter by category, and sort to find what you need.
          </p>
        </div>
      </div>
      <ProductList />
    </div>
  );
}

export default Home;
