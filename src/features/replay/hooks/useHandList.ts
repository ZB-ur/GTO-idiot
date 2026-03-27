import { useState } from 'react';
import type { HandListItem } from '../../../types';

export interface UseHandListReturn {
  hands: HandListItem[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  filterErrorsOnly: boolean;
  setFilterErrorsOnly: (v: boolean) => void;
}

export function useHandList(): UseHandListReturn {
  const [hands] = useState<HandListItem[]>([]);
  const [page, setPage] = useState(1);
  const [filterErrorsOnly, setFilterErrorsOnly] = useState(false);

  return {
    hands,
    isLoading: false,
    error: null,
    page,
    totalPages: 0,
    setPage,
    filterErrorsOnly,
    setFilterErrorsOnly,
  };
}
