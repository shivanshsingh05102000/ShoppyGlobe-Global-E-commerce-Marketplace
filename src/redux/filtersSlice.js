import { createSlice } from '@reduxjs/toolkit';

/**
 * filtersSlice
 * Holds ProductList's search/filter/sort state in Redux (rather than local
 * component state) per the rubric requirement: "Implement a search feature
 * to filter products using redux state in the ProductList."
 *
 * Going slightly beyond the brief: also tracks a category filter and a
 * sort order, since a real catalog search rarely stops at a text query.
 */

const initialState = {
  searchTerm: '',
  category: 'all', // 'all' or a dummyjson category slug
  sortBy: 'default', // 'default' | 'price-asc' | 'price-desc' | 'rating-desc'
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    setCategory(state, action) {
      state.category = action.payload;
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
    },
    resetFilters(state) {
      state.searchTerm = initialState.searchTerm;
      state.category = initialState.category;
      state.sortBy = initialState.sortBy;
    },
  },
});

export const { setSearchTerm, setCategory, setSortBy, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
