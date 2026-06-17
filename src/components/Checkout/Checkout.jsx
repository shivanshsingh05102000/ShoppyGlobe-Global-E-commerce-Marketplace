import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  selectCartItems,
  selectCartSubtotal,
  selectShippingCost,
  selectTaxAmount,
  selectCartTotal,
  selectIsCartEmpty,
} from '../../redux/cartSelectors';
import { clearCart } from '../../redux/cartSlice';
import { formatPrice, generateOrderId } from '../../utils/formatPrice';
import './Checkout.css';

/** How long the success screen stays up before auto-redirecting home. */
const REDIRECT_DELAY_MS = 3500;

/* ---------------------------------------------------------------------- */
/* Validation                                                              */
/* ---------------------------------------------------------------------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;

/** Validate a single field given the full form snapshot (some checks need siblings, e.g. expiry vs. today). */
function validateField(name, value, formData) {
  const trimmed = (value ?? '').trim();

  switch (name) {
    case 'fullName':
      if (!trimmed) return 'Full name is required.';
      if (trimmed.length < 3) return 'Enter your full name (at least 3 characters).';
      if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return 'Name can only contain letters, spaces, and basic punctuation.';
      return '';

    case 'email':
      if (!trimmed) return 'Email address is required.';
      if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address, e.g. name@example.com.';
      return '';

    case 'phone': {
      const digits = trimmed.replace(/\D/g, '');
      if (!digits) return 'Phone number is required.';
      if (digits.length < 10 || digits.length > 12) return 'Enter a valid phone number (10–12 digits).';
      return '';
    }

    case 'address':
      if (!trimmed) return 'Street address is required.';
      if (trimmed.length < 5) return 'Enter a complete street address.';
      return '';

    case 'city':
      if (!trimmed) return 'City is required.';
      return '';

    case 'state':
      if (!trimmed) return 'State / province is required.';
      return '';

    case 'zip': {
      const digits = trimmed.replace(/\D/g, '');
      if (!digits) return 'Postal / ZIP code is required.';
      if (digits.length < 5 || digits.length > 6) return 'Enter a valid 5–6 digit postal code.';
      return '';
    }

    case 'cardNumber': {
      const digits = trimmed.replace(/\s/g, '');
      if (!digits) return 'Card number is required.';
      if (!/^\d{16}$/.test(digits)) return 'Card number must be exactly 16 digits.';
      return '';
    }

    case 'expiry':
      if (!trimmed) return 'Expiry date is required.';
      if (!EXPIRY_PATTERN.test(trimmed)) return 'Use MM/YY format, e.g. 04/27.';
      {
        const [month, year] = trimmed.split('/').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          return 'This card has already expired.';
        }
      }
      return '';

    case 'cvv':
      if (!trimmed) return 'CVV is required.';
      if (!/^\d{3,4}$/.test(trimmed)) return 'CVV must be 3 or 4 digits.';
      return '';

    default:
      return '';
  }
}

function validateAll(formData) {
  const errors = {};
  Object.keys(formData).forEach((name) => {
    const message = validateField(name, formData[name], formData);
    if (message) errors[name] = message;
  });
  return errors;
}

/* ---------------------------------------------------------------------- */
/* Input formatting helpers                                                */
/* ---------------------------------------------------------------------- */

function formatCardNumber(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
};

/* ---------------------------------------------------------------------- */
/* Component                                                               */
/* ---------------------------------------------------------------------- */

/**
 * Checkout
 * Dummy checkout form (rubric requirement — no real payment is processed,
 * nothing is sent anywhere). Collects shipping + dummy card details with
 * full client-side validation, shows a cart summary, and on a valid
 * submit: shows "Order placed", empties the cart via Redux, then
 * auto-redirects to Home.
 */
function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector(selectCartItems);
  const isCartEmpty = useSelector(selectIsCartEmpty);
  const subtotal = useSelector(selectCartSubtotal);
  const shipping = useSelector(selectShippingCost);
  const tax = useSelector(selectTaxAmount);
  const total = useSelector(selectCartTotal);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const redirectTimerRef = useRef(null);
  const formRef = useRef(null);

  // Snapshot the summary at the moment the order is placed, since the
  // cart (and therefore subtotal/total) is cleared immediately after.
  const [placedSummary, setPlacedSummary] = useState(null);

  /** Auto-redirect to Home a few seconds after a successful order, cleaned up on unmount. */
  useEffect(() => {
    if (!orderPlaced) return;
    redirectTimerRef.current = setTimeout(() => {
      navigate('/', { replace: true });
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(redirectTimerRef.current);
  }, [orderPlaced, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'cardNumber') nextValue = formatCardNumber(value);
    if (name === 'expiry') nextValue = formatExpiry(value);

    const nextFormData = { ...formData, [name]: nextValue };
    setFormData(nextFormData);

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, nextValue, nextFormData) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, formData) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allErrors = validateAll(formData);
    setErrors(allErrors);
    setTouched(Object.fromEntries(Object.keys(formData).map((key) => [key, true])));

    if (Object.keys(allErrors).length > 0) {
      // Focus the first invalid field so the user immediately sees what to fix.
      const firstInvalidName = Object.keys(allErrors)[0];
      formRef.current?.elements?.[firstInvalidName]?.focus();
      return;
    }

    setIsSubmitting(true);

    // Simulate a brief network round-trip for the "dummy" order placement.
    setTimeout(() => {
      setPlacedSummary({ items, subtotal, shipping, tax, total });
      setOrderId(generateOrderId());
      dispatch(clearCart());
      setIsSubmitting(false);
      setOrderPlaced(true);
    }, 700);
  };

  const fieldProps = (name, label, extra = {}) => ({
    id: name,
    name,
    label,
    value: formData[name],
    error: touched[name] ? errors[name] : '',
    onChange: handleChange,
    onBlur: handleBlur,
    ...extra,
  });

  const summaryItemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  // 1) Success state takes priority over everything else — even though the
  //    cart is now empty (we just cleared it), we must not fall through to
  //    the "cart is empty, redirect to /cart" branch below.
  if (orderPlaced && placedSummary) {
    return (
      <div className="container">
        <div className="order-success">
          <span className="order-success__icon" aria-hidden="true">✓</span>
          <h1 className="order-success__title">Order placed!</h1>
          <p className="order-success__message">
            Thanks for shopping with ShoppyGlobe. A confirmation for order{' '}
            <strong className="order-success__id">{orderId}</strong> would normally be emailed to you.
          </p>
          <p className="order-success__total">
            {summaryItemCount === 0 ? placedSummary.items.length : summaryItemCount} item(s) ·{' '}
            <span className="price-tag">{formatPrice(placedSummary.total)}</span>
          </p>
          <p className="order-success__redirect">Redirecting you to the home page…</p>
          <Link to="/" className="btn btn--outline">Go to home now</Link>
        </div>
      </div>
    );
  }

  // 2) Only after confirming we're not on the success screen do we guard
  //    against reaching checkout with nothing in the cart.
  if (isCartEmpty) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="container checkout-page">
      <h1 className="checkout-page__heading">Checkout</h1>

      <div className="checkout-page__layout">
        <form ref={formRef} className="checkout-form" onSubmit={handleSubmit} noValidate>
          <section className="checkout-form__section">
            <h2>Shipping details</h2>
            <Field {...fieldProps('fullName', 'Full name')} autoComplete="name" />
            <div className="checkout-form__row">
              <Field {...fieldProps('email', 'Email')} type="email" autoComplete="email" />
              <Field {...fieldProps('phone', 'Phone number')} type="tel" autoComplete="tel" />
            </div>
            <Field {...fieldProps('address', 'Street address')} autoComplete="street-address" />
            <div className="checkout-form__row checkout-form__row--three">
              <Field {...fieldProps('city', 'City')} autoComplete="address-level2" />
              <Field {...fieldProps('state', 'State / province')} autoComplete="address-level1" />
              <Field {...fieldProps('zip', 'Postal code')} autoComplete="postal-code" />
            </div>
          </section>

          <section className="checkout-form__section">
            <h2>Payment <span className="checkout-form__dummy-pill">Demo — no real charge</span></h2>
            <Field
              {...fieldProps('cardNumber', 'Card number')}
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              autoComplete="cc-number"
            />
            <div className="checkout-form__row">
              <Field {...fieldProps('expiry', 'Expiry (MM/YY)')} placeholder="04/27" inputMode="numeric" autoComplete="cc-exp" />
              <Field {...fieldProps('cvv', 'CVV')} placeholder="123" inputMode="numeric" maxLength={4} autoComplete="cc-csc" />
            </div>
          </section>

          <button type="submit" className="btn btn--primary btn--block" disabled={isSubmitting}>
            {isSubmitting ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2 className="checkout-summary__heading">Order summary</h2>
          <ul className="checkout-summary__list">
            {items.map((item) => (
              <li key={item.id} className="checkout-summary__item">
                <span className="checkout-summary__item-name">
                  {item.title} <span className="checkout-summary__item-qty">× {item.quantity}</span>
                </span>
                <span className="checkout-summary__item-price">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="checkout-summary__rows">
            <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div><dt>Shipping</dt><dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd></div>
            <div><dt>Tax</dt><dd>{formatPrice(tax)}</dd></div>
          </dl>
          <div className="checkout-summary__total">
            <span>Total</span>
            <span className="price-tag price-tag--lg">{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Field
 * Small local form-field component (label + input + inline error). Kept
 * inside Checkout's file since it's only meaningful in this context, but
 * still a self-contained, reusable, prop-driven unit.
 */
function Field({ id, name, label, value, error, onChange, onBlur, type = 'text', ...rest }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={error ? 'is-invalid' : ''}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && <span id={`${id}-error`} className="field-error">{error}</span>}
    </div>
  );
}

Field.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  type: PropTypes.string,
};

export default Checkout;
