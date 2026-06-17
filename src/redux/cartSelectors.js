import { createSelector } from '@reduxjs/toolkit';
import { calculateDiscountedPrice } from '../utils/formatPrice';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT_RATE, TAX_RATE } from '../utils/constants';

/**
 * cartSelectors
 * All derived/computed cart values live here as memoized selectors
 * (via createSelector) rather than being recalculated inline in components.
 * This keeps components declarative and avoids redundant recomputation
 * on unrelated re-renders.
 */

/** Raw list of cart line items. */
export const selectCartItems = (state) => state.cart.items;

/** Total number of units across all cart lines (for the Header cart badge). */
export const selectCartItemCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => sum + item.quantity, 0),
);

/** Number of distinct product lines in the cart. */
export const selectCartLineCount = createSelector(
  [selectCartItems],
  (items) => items.length,
);

/** Subtotal = sum of (discounted unit price * quantity) across all lines. */
export const selectCartSubtotal = createSelector(
  [selectCartItems],
  (items) =>
    items.reduce((sum, item) => {
      const unitPrice = calculateDiscountedPrice(item.price, item.discountPercentage);
      return sum + unitPrice * item.quantity;
    }, 0),
);

/** Shipping is free above the threshold, otherwise a flat rate — waived entirely for an empty cart. */
export const selectShippingCost = createSelector(
  [selectCartSubtotal, selectCartItems],
  (subtotal, items) => {
    if (items.length === 0) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  },
);

/** Flat demo tax rate applied to the subtotal. */
export const selectTaxAmount = createSelector(
  [selectCartSubtotal],
  (subtotal) => subtotal * TAX_RATE,
);

/** Grand total shown at Checkout: subtotal + shipping + tax. */
export const selectCartTotal = createSelector(
  [selectCartSubtotal, selectShippingCost, selectTaxAmount],
  (subtotal, shipping, tax) => subtotal + shipping + tax,
);

/** Whether the cart has at least one item — used to gate Checkout access. */
export const selectIsCartEmpty = createSelector(
  [selectCartItems],
  (items) => items.length === 0,
);

/**
 * Selector factory: is a given product already in the cart?
 * Used by ProductItem/ProductDetail to show "In cart (n)" vs "Add to Cart".
 */
export const makeSelectCartItemById = (productId) =>
  createSelector([selectCartItems], (items) => items.find((item) => item.id === productId));
