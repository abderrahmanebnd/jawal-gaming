"use client";

import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation"; // ← Next.js routing
import { RoutePaths } from "@/routes";
// Remove React Router imports

const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const router = useRouter(); // ← Next.js router

  const get = useCallback(
    async (url, queryParams = {}, headers, isWithCredentials = false) => {
      if (!url) return;
      setData(null);
      setLoading(true);
      setError(null);
      const cancelTokenSource = axios.CancelToken.source();
      setSource(cancelTokenSource);

      try {
        const response = await axios.get(url, {
          headers,
          params: queryParams,
          withCredentials: isWithCredentials,
          cancelToken: cancelTokenSource?.token,
          timeout: 30 * 1000,
        });
        setData(response.data);
        setError(null);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.error("Request canceled: ", err.message);
        } else {
          if (err && err instanceof Error) {
            if (!navigator.onLine) {
              setError("No internet connection. Please check your network.");
            } else {
              // Handle auth errors
              if (
                err?.response?.status === 401 ||
                err?.response?.status === 403
              ) {
                
                router.push(RoutePaths.home); // ← Next.js navigation
                return;
              }

              const error =
                err?.response?.data?.error ||
                "An error occurred. Please try again.";
              setError(error);
            }
          }
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const post = useCallback(
    async (url, request, headers, isWithCredentials = false) => {
      if (!url) return;
      setData(null);
      setLoading(true);
      setError(null);
      const cancelTokenSource = axios.CancelToken.source();
      setSource(cancelTokenSource);

      try {
        const response = await axios.post(url, request, {
          headers,
          cancelToken: cancelTokenSource?.token,
          withCredentials: isWithCredentials,
          timeout: 30 * 1000,
        });
        setData(response.data);
        setError(null);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.error("Request canceled: ", err.message);
        } else {
          if (err && err instanceof Error) {
            if (!navigator.onLine) {
              setError("No internet connection. Please check your network.");
            } else {
              // Handle auth errors
              if (
                err?.response?.status === 401 ||
                err?.response?.status === 403
              ) {
                router.push(RoutePaths.home);
                return;
              }

              // Simplified error handling
              const error =
                err?.response?.data?.error ||
                err?.response?.data?.data?.errors?.[0]?.msg ||
                "An error occurred. Please try again.";
              setError(error);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const deleteApi = useCallback(
    async (url, queryParams = {}, headers, isWithCredentials = false) => {
      if (!url) return;
      setData(null);
      setLoading(true);
      setError(null);
      const cancelTokenSource = axios.CancelToken.source();
      setSource(cancelTokenSource);

      try {
        const response = await axios.delete(url, {
          headers,
          params: queryParams,
          withCredentials: isWithCredentials,
          cancelToken: cancelTokenSource?.token,
          timeout: 30 * 1000,
        });
        setData(response.data);
        setError(null);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.error("Request canceled: ", err.message);
        } else {
          if (err && err instanceof Error) {
            if (!navigator.onLine) {
              setError("No internet connection. Please check your network.");
            } else {
              // Handle auth errors
              if (
                err?.response?.status === 401 ||
                err?.response?.status === 403
              ) {
                router.push(RoutePaths.home);
                return;
              }

              const error =
                err?.response?.data?.error ||
                "An error occurred. Please try again.";
              setError(error);
            }
          }
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return { data, loading, error, get, post, source, deleteApi };
};

export default useApi;
