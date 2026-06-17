import PropTypes from 'prop-types';
import './ErrorMessage.css';

/**
 * ErrorMessage
 * Standard "something went wrong" panel used by ProductList and
 * ProductDetail whenever their fetch hooks report an error. Always
 * explains what happened and offers a concrete next step (Try again),
 * never a vague apology.
 */
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-panel" role="alert">
      <span className="error-panel__icon" aria-hidden="true">⚠</span>
      <p className="error-panel__title">Couldn't load this content</p>
      <p className="error-panel__detail">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};

export default ErrorMessage;
