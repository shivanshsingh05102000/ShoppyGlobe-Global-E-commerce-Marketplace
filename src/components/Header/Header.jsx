import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItemCount } from '../../redux/cartSelectors';
import { selectSearchTerm } from '../../redux/filtersSelectors';
import { setSearchTerm } from '../../redux/filtersSlice';
import { useDebounce } from '../../hooks/useDebounce';
import './Header.css';

/**
 * Header
 * Persistent top bar: brand, primary nav, the catalog search input, and
 * the cart icon with a live item-count badge sourced from Redux.
 *
 * The search input is local state for instant typing feedback, debounced
 * before it's dispatched into redux (filtersSlice) — this is the redux
 * state that ProductList actually filters against, satisfying "search
 * feature to filter products (using redux state) in the ProductList."
 */
function Header() {
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartItemCount);
  const reduxSearchTerm = useSelector(selectSearchTerm);

  const [inputValue, setInputValue] = useState(reduxSearchTerm);
  const debouncedValue = useDebounce(inputValue, 300);

  useEffect(() => {
    dispatch(setSearchTerm(debouncedValue));
  }, [debouncedValue, dispatch]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand" aria-label="ShoppyGlobe home">
          <span className="site-header__brand-mark">SG</span>
          <span className="site-header__brand-name">ShoppyGlobe</span>
        </Link>

        <div className="site-header__search">
          <span className="site-header__search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            className="site-header__search-input"
            placeholder="Search the catalog…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label="Search products"
          />
        </div>

        <nav className="site-header__nav" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => `site-header__link ${isActive ? 'is-active' : ''}`}>
            Home
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) => `site-header__cart ${isActive ? 'is-active' : ''}`}
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
          >
            <span className="site-header__cart-icon" aria-hidden="true">🛒</span>
            {cartCount > 0 && <span className="site-header__cart-badge">{cartCount}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
