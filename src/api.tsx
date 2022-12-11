import { useAsyncAbortable} from "react-async-hook";
export type paginationSearchResult<T> = {
  data: T[];
  page: number;
  pages: number;
  total_items: number;
};

export const useAsyncSearchResult = <T,>(endpoint: string, searchParams: string) => {
  return useAsyncAbortable<T | undefined>(
    async (abortSignal, searchParams) => {
      if (searchParams === "") return;
      return fetchAPI<T>(endpoint + searchParams, abortSignal);
    },
    [searchParams]
  );
};
export const fetchAPI = async <T,>(
  uri: string,
  abortSignal?: AbortSignal,
  needStatus: number = 200
): Promise<T> => {
  const url_api =
    window.location.protocol +
    "//" +
    window.location.hostname +
    process.env.REACT_APP_URI_API;
  let result = new Response();
  try {
    result = await fetch(url_api + uri, {
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortSignal,
    });
  } catch (e: unknown) {
    const err = e instanceof Error ? ": " + e.message : "";
    throw new Error(`URL ${url_api} not available${err}`);
  }
  if (result.status !== needStatus) {
    const message = "bad request to API, response code: " + result.status;
    try {
      const err = await result.json();
      throw new Error(`${message}; ${err.title}: ${err.detail}`);
    } catch (e) {
      throw new Error(e as string);
    }
  }
  return result.json();
};
