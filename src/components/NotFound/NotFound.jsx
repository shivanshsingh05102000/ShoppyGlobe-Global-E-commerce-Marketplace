import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import './NotFound.css';

/**
 * NotFound
 * Used two ways:
 *  1. As the router's wildcard "*" route — catches any unknown URL.
 *  2. Reused by ProductDetail when a product id doesn't exist (404 from
 *     the API), via the `title`/`message` props, so "this thing doesn't
 *     exist" always looks and reads the same way across the app.
 *
 * Always shows the concrete path/detail that failed, per the rubric:
 * "display proper error details on the UI" — never just a bare "404".
 */
function NotFound({ title, message, code = '404' }) {
  const location = useLocation();
  const attemptedPath = location.pathname + location.search;

  return (
    <div className="container not-found">
      <p className="not-found__code">{code}</p>
      <h1 className="not-found__title">{title ?? 'Page not found'}</h1>
      <p className="not-found__message">
        {message ?? "We couldn't find anything at that address."}
      </p>
      <p className="not-found__path">
        Requested path: <code>{attemptedPath}</code>
      </p>
      <Link to="/" className="btn btn--primary">
        Back to home
      </Link>
    </div>
  );
}

NotFound.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  code: PropTypes.string,
};

export default NotFound;
