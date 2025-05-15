import { useState, useEffect } from "react";
import type { ApiResponse } from "../types";

interface UseDataFetchingResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseDataFetchingProps<T> {
  fetchFunction: () => Promise<ApiResponse<T>>;
  dependencies?: any[];
  skip?: boolean;
}

export function useDataFetching<T>({
  fetchFunction,
  skip = false,
  dependencies = [],
}: UseDataFetchingProps<T>): UseDataFetchingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFunction();
      if (response.success) {
        setData(response.data || null);
      } else {
        setError(response.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!skip) {
      fetchData();
    } else {
      setData(null);
      setError(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, skip]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
