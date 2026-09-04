'use client';

import { useCallback, useEffect, useState } from 'react';


export const DEFAULT_PAGE_SIZE = 20;

export const SEARCH_DEBOUNCE_MS = 300;

export function usePagination(pageSize: number = DEFAULT_PAGE_SIZE) {
  const [offset, setOffset] = useState(0);
  const resetOffset = useCallback(() => setOffset(0), []);
  return { offset, setOffset, resetOffset, pageSize };
}

export function useDebouncedSearch(delay: number = SEARCH_DEBOUNCE_MS) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), delay);
    return () => clearTimeout(t);
  }, [searchInput, delay]);

  return { searchInput, setSearchInput, search };
}

/**
 * The standard "searchable, paginated table" pair, wired together so that a new
 * search always returns to page 1.
 *
 * This is the shape repeated in every list screen in the panel. Use
 * {@link usePagination} alone for a table with no search box.
 */
export function useTableControls(
  pageSize: number = DEFAULT_PAGE_SIZE,
  delay: number = SEARCH_DEBOUNCE_MS
) {
  const { offset, setOffset, resetOffset } = usePagination(pageSize);
  const { searchInput, setSearchInput, search } = useDebouncedSearch(delay);

 
  useEffect(() => {
    resetOffset();
  }, [search, resetOffset]);

  return {
    searchInput,
    setSearchInput,
    search,
    offset,
    setOffset,
    resetOffset,
    pageSize,
  };
}
