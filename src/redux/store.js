import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import filtersReducer from './filtersSlice';

/**
 * Redux store. Redux Toolkit's configureStore already wires up
 * redux-thunk and the DevTools extension in development, so there's no
 * boilerplate middleware setup needed beyond combining our two slices.
 */
const store = configureStore({
  reducer: {
    cart: cartReducer,
    filters: filtersReducer,
  },
});

export default store;
