import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './EmptyState.css';

/**
 * EmptyState
 * Shared "nothing here yet" panel — reused for an empty cart and for a
 * search/filter combination that matches zero products. Always frames
 * emptiness as something the user can act on, per the design guidance:
 * "An empty screen is an invitation to act."
 */
function EmptyState({ icon = '📦', title, message, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">{icon}</span>
      <h2 className="empty-state__title">{title}</h2>
      {message && <p className="empty-state__message">{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn--primary">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" className="btn btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  actionTo: PropTypes.string,
  onAction: PropTypes.func,
};

export default EmptyState;
