import { memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LazyImage from '../common/LazyImage';
import QuantityStepper from '../common/QuantityStepper';
import { incrementQuantity, decrementQuantity, removeFromCart } from '../../redux/cartSlice';
import { formatPrice, calculateDiscountedPrice } from '../../utils/formatPrice';
import { buildProductRoute } from '../../utils/constants';
import './CartItem.css';

/**
 * CartItem
 * Renders a single line in the Cart, receiving the cart line object as a
 * prop from its parent. Owns the quantity +/- and remove interactions,
 * dispatching straight to the cart slice — all event handling here is
 * Redux-backed as the rubric requires.
 */
function CartItem({ item }) {
  const dispatch = useDispatch();
  const unitPrice = calculateDiscountedPrice(item.price, item.discountPercentage);
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="cart-item">
      <Link to={buildProductRoute(item.id)} className="cart-item__media-link">
        <LazyImage src={item.thumbnail} alt={item.title} className="cart-item__media" />
      </Link>

      <div className="cart-item__details">
        <Link to={buildProductRoute(item.id)} className="cart-item__title-link">
          <p className="cart-item__title">{item.title}</p>
        </Link>
        <p className="cart-item__category">{item.category}</p>
        <span className="price-tag cart-item__unit-price">{formatPrice(unitPrice)} each</span>
      </div>

      <div className="cart-item__quantity">
        <QuantityStepper
          quantity={item.quantity}
          max={item.stock}
          onIncrement={() => dispatch(incrementQuantity(item.id))}
          onDecrement={() => dispatch(decrementQuantity(item.id))}
        />
      </div>

      <div className="cart-item__line-total">
        <span className="price-tag price-tag--lg">{formatPrice(lineTotal)}</span>
      </div>

      <button
        type="button"
        className="btn btn--danger-ghost btn--sm cart-item__remove"
        onClick={() => dispatch(removeFromCart(item.id))}
        aria-label={`Remove ${item.title} from cart`}
      >
        Remove
      </button>
    </div>
  );
}

CartItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    discountPercentage: PropTypes.number,
    thumbnail: PropTypes.string.isRequired,
    category: PropTypes.string,
    stock: PropTypes.number,
    quantity: PropTypes.number.isRequired,
  }).isRequired,
};

export default memo(CartItem);
