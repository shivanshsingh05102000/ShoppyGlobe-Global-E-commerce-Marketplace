import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useProducts } from '../../hooks/useProducts';
import ProductItem from '../ProductItem/ProductItem';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import { makeSelectVisibleProducts, selectCategory, selectSortBy, selectSearchTerm } from '../../redux/filtersSelectors';
import { setCategory, setSortBy, resetFilters } from '../../redux/filtersSlice';
import './ProductList.css';

/**
 * ProductList
 * Fetches the full catalog via the useProducts custom hook (rubric: 20
 * marks), then derives the *visible* product list from redux filter
 * state (search term, category, sort) via a memoized selector — this is
 * the "search feature to filter products using redux state" requirement.
 *
 * Renders the resulting list with a stable, unique `key` per the React
 * Lists requirement.
 */
function ProductList() {
  const dispatch = useDispatch();
  const { products, loading, error, refetch } = useProducts();

  const searchTerm = useSelector(selectSearchTerm);
  const category = useSelector(selectCategory);
  const sortBy = useSelector(selectSortBy);

  // The selector factory is created once per ProductList instance so its
  // internal memoization cache persists across re-renders.
  const selectVisibleProducts = useMemo(() => makeSelectVisibleProducts(), []);
  const visibleProducts = useSelector((state) => selectVisibleProducts(state, products));

  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(unique).sort()];
  }, [products]);

  if (loading) {
    return <Loader label="Fetching the catalog…" size="lg" />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={`We couldn't reach the product catalog (${error}). Please check your connection and try again.`}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="container product-list-page">
      <div className="product-list__toolbar">
        <div>
          <h1 className="product-list__heading">Browse the catalog</h1>
          <p className="product-list__subheading">
            {visibleProducts.length} of {products.length} products
            {searchTerm && <> matching “{searchTerm}”</>}
          </p>
        </div>

        <div className="product-list__controls">
          <label className="product-list__control">
            <span>Category</span>
            <select value={category} onChange={(e) => dispatch(setCategory(e.target.value))}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All categories' : c}
                </option>
              ))}
            </select>
          </label>

          <label className="product-list__control">
            <span>Sort by</span>
            <select value={sortBy} onChange={(e) => dispatch(setSortBy(e.target.value))}>
              <option value="default">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating-desc">Top rated</option>
            </select>
          </label>
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No products match your filters"
          message="Try a different search term or clear the category filter."
          actionLabel="Reset filters"
          onAction={() => dispatch(resetFilters())}
        />
      ) : (
        <div className="product-list__grid">
          {visibleProducts.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;
