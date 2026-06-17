import { useEffect, useState } from 'react';

/**
 * useDebounce
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * of inactivity. Used by the Header search input so dispatching
 * setSearchTerm (and the resulting re-filter of the product grid) doesn't
 * fire on every single keystroke.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
