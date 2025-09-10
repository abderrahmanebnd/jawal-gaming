import { useEffect, useState } from "react";
import axios from "axios";
import { apiEndPoints } from "../api/api";

const DEFAULT_PAGE_SIZE = 20;

export default function useGames(pageNumber, pageSize = DEFAULT_PAGE_SIZE) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [games, setGames] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    pageSize,
    totalPages: 1,
  });

  // If caller resets to page 1 (e.g., new tab/filter), start fresh
  useEffect(() => {
    if (pageNumber === 1) setGames([]);
  }, [pageNumber]);

  // If page size changes, also start fresh
  useEffect(() => {
    setGames([]);
  }, [pageSize]);

  useEffect(() => {
    setLoading(true);
    setError(false);

    const source = axios.CancelToken.source();

    axios({
      method: "GET",
      url: apiEndPoints.viewGame,
      params: { pageNo: pageNumber, pageSize },
      headers: { "Content-Type": "application/json" },
      cancelToken: source.token,
    })
      .then((res) => {
        const payload = res?.data.data ?? {};
        const rows = payload?.data ?? [];
        const apiTotal = Number(payload?.total ?? 0);
        const pag = payload?.pagination ?? {};
        const currentPage = Number(pag?.currentPage ?? pageNumber);
        const totalPages = Number(
          pag?.totalPages ?? (apiTotal > 0 ? Math.ceil(apiTotal / pageSize) : 1)
        );

        setGames((prev) => {
          const seen = new Set(prev.map((g) => String(g?.id)));
          const merged = [...prev];
          for (const g of rows) {
            const k = String(g?.id ?? "");
            if (k && !seen.has(k)) {
              seen.add(k);
              merged.push(g);
            }
          }
          return merged;
        });

        setTotal(apiTotal);
        setPageInfo({ currentPage, pageSize, totalPages });
        setHasMore(currentPage < totalPages);
        setLoading(false);
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        setError(true);
      });

    return () => source.cancel("useGames: request canceled");
  }, [pageNumber, pageSize]);

  return { loading, error, games, hasMore, total, pageInfo };
}
