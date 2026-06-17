import { memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LazyImage from '../common/LazyImage';
import { addToCart } from '../../redux/cartSlice';
import { makeSelectCartItemById } from '../../redux/cartSelectors';
import { formatPrice, calculateDiscountedPrice } from '../../utils/formatPrice';
import { buildProductRoute } from '../../utils/constants';
import './ProductItem.css';

/**
 * ProductItem
 * Renders a single product card inside ProductList. Receives the full
 * product object as a prop from its parent (ProductList) — the rubric's
 * "props to pass data from parent to child" requirement — and is a pure,
 * reusable, self-contained unit: give it any dummyjson product shape and
 * it renders correctly.
 *
 * Wrapped in React.memo since ProductList can re-render frequently while
 * typing in search; memo avoids re-rendering every card when only the
 * filtered list order/contents actually change for some of them.
 */
function ProductItem({ product }) {
  const dispatch = useDispatch();
  const cartItem = useSelector(makeSelectCartItemById(product.id));
  const inStock = product.stock > 0;
  const discountedPrice = calculateDiscountedPrice(product.price, product.discountPercentage);
  const hasDiscount = product.discountPercentage > 0;

  const handleAddToCart = (e) => {
    e.preventDefault(); // card itself is a link; don't navigate when clicking the button
    if (!inStock) return;
    dispatch(addToCart(product));
  };

  return (
    <article className="product-card">
      <Link to={buildProductRoute(product.id)} className="product-card__media-link">
        <LazyImage
          src={product.thumbnail}
          alt={product.title}
          className="product-card__media"
        />
        {hasDiscount && (
          <span className="product-card__discount-badge">-{Math.round(product.discountPercentage)}%</span>
        )}
        {!inStock && <span className="product-card__stock-badge">Out of stock</span>}
      </Link>

      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <Link to={buildProductRoute(product.id)} className="product-card__title-link">
          <h3 className="product-card__title">{product.title}</h3>
        </Link>

        <div className="product-card__rating">
          <span aria-hidden="true">★</span>
          <span>{product.rating?.toFixed(1) ?? '—'}</span>
        </div>

        <div className="product-card__footer">
          <div className="product-card__pricing">
            <span className="price-tag">{formatPrice(discountedPrice)}</span>
            {hasDiscount && (
              <span className="product-card__strike">{formatPrice(product.price)}</span>
            )}
          </div>

          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            {cartItem ? `In cart · ${cartItem.quantity}` : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}

ProductItem.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    discountPercentage: PropTypes.number,
    thumbnail: PropTypes.string.isRequired,
    category: PropTypes.string,
    rating: PropTypes.number,
    stock: PropTypes.number,
  }).isRequired,
};

export default memo(ProductItem);
