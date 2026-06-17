import PropTypes from 'prop-types';
import './Loader.css';

/**
 * Loader
 * Small reusable spinner with an accessible status message, shown while
 * useProducts / useProductDetail are fetching. Sized via the `size` prop
 * so it can be used inline (e.g. inside a disabled button) or full-page.
 */
function Loader({ label = 'Loading…', size = 'md' }) {
  return (
    <div className={`loader loader--${size}`} role="status" aria-live="polite">
      <span className="loader__spinner" aria-hidden="true" />
      <span className="loader__label">{label}</span>
    </div>
  );
}

Loader.propTypes = {
  label: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default Loader;
