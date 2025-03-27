import { useSearchParams } from "react-router-dom";

export function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key: string) => {
    return searchParams.get(key);
  };

  const setParam = (key: string, value: string) => {
    searchParams.set(key, value);
    setSearchParams(searchParams);
  };

  const removeParam = (key: string) => {
    searchParams.delete(key);
    setSearchParams(searchParams);
  };

  return { getParam, setParam, removeParam };
}