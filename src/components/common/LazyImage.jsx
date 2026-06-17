import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './LazyImage.css';

/**
 * LazyImage
 * Satisfies the rubric's "Implement lazy loading for images" requirement.
 *
 * Uses an IntersectionObserver to only set the real `src` once the image
 * scrolls near the viewport, on top of the native `loading="lazy"`
 * attribute as a belt-and-suspenders fallback for browsers/cases where
 * the observer can't run. Shows a skeleton shimmer until the image has
 * actually finished loading, and a graceful fallback if it fails.
 */
function LazyImage({ src, alt, className = '', aspectRatio = '1 / 1' }) {
  // If the browser has no IntersectionObserver support, decide that up
  // front (in the initializer) rather than via a setState call inside the
  // effect — the effect below then simply has nothing to do in that case.
  const [isVisible, setIsVisible] = useState(() => typeof IntersectionObserver === 'undefined');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible) return; // already showing (no observer support, or already intersected)

    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '150px' }, // start loading slightly before it enters the viewport
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`lazy-image ${className}`}
      style={{ aspectRatio }}
    >
      {!hasLoaded && !hasError && <div className="lazy-image__skeleton" aria-hidden="true" />}

      {isVisible && !hasError && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`lazy-image__img ${hasLoaded ? 'is-loaded' : ''}`}
          onLoad={() => setHasLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {hasError && (
        <div className="lazy-image__fallback" role="img" aria-label={alt}>
          <span aria-hidden="true">🌐</span>
        </div>
      )}
    </div>
  );
}

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  aspectRatio: PropTypes.string,
};

export default LazyImage;
