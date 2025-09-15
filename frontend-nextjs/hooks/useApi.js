import axios from "axios";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "../routes";
import { logout } from "../store/features/authSlice";

const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const dispatch = useCallback(logout, []);
  const navigate = useNavigate();
  
  const get = useCallback(
    async (url, queryParams = {}, headers, isWithCredentials = false) => {
      if (!url) return;
      setData(null);
      setLoading(true);
      setError(null);
      const cancelTokenSource = axios.CancelToken.source();
      // Store the cancel token for potential cleanup
      setSource(cancelTokenSource);
      try {
        const response = await axios.get(url, {
          headers,
          params: queryParams,
          withCredentials: isWithCredentials,
          cancelToken: cancelTokenSource?.token,
          // 30 seconds
          timeout: 30 * 1000,
        });
        setData(response.data);
        setError(null);
      } catch (err) {
        // If the error is from request cancellation
        if (axios.isCancel(err)) {
          console.error("Request canceled: ", err.message);
        } else {
          if (err && err instanceof Error) {
            if (!navigator.onLine) {
              setError("No internet connection. Please check your network.");
            } else {
              // Check for unauthorized requests
              if (err?.response?.status === 401) {
                dispatch(logout);
                return;
              }
              const error = err?.response?.data?.error
                ? err?.response?.data?.error
                : "An error occurred. Please try again.";

              setError(error);
              if (err?.response?.status === 403) {
                dispatch(logout());
                navigate(RoutePaths.signIn);
                return;
              }
            }
          }
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  /**
   * This function is use to post data via the given url
   */
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
        // If the error is from request cancellation
        if (axios.isCancel(err)) {
          console.error("Request canceled: ", err.message);
        } else {
          if (err && err instanceof Error) {
            // Check if the error is due to no internet connection
            if (!navigator.onLine) {
              setError("No internet connection. Please check your network.");
            }  else {
              if (err?.response?.status === 401) {
                const error = err?.response?.data?.error
                  ? err?.response?.data?.error
                  : "An error occurred. Please try again.";

                dispatch(logout());
                setError(error);
                return;
              } else if (err?.response?.status === 403) {
                const error = err?.response?.data?.data.errors[0].msg
                  ? err?.response?.data?.data.errors[0].msg
                  : "An error occurred. Please try again.";
                dispatch(logout());
                navigate(RoutePaths.signIn);
                setError(error);
                return;
              }

              const error1 =
                err?.response?.data?.data?.errors[0].msg &&
                err?.response?.data?.data?.errors[0].msg;

              const error2 = err?.response?.data?.error
                ? err?.response?.data?.error
                : "An error occurred. Please try again.";

              const error = error1 ? error1 : error2;

              setError(error);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  /**
   * This function is use to delete data via the given url
   */
  const deleteApi = useCallback(
    async (url, queryParams = {}, headers, isWithCredentials = false) => {
      if (!url) return;
      setData(null);
      setLoading(true);
      setError(null);
      const cancelTokenSource = axios.CancelToken.source();
      // Store the cancel token for potential cleanup
      setSource(cancelTokenSource);
      try {
        const response = await axios.delete(url, {
          headers,
          params: queryParams,
          withCredentials: isWithCredentials,
          cancelToken: cancelTokenSource?.token,
          // 30 seconds
          timeout: 30 * 1000,
        });
        setData(response.data);
        setError(null);
      } catch (err) {
        // If the error is from request cancellation
        if (axios.isCancel(err)) {
          console.error("Request canceled: ", err.message);
        } else {
          if (err && err instanceof Error) {
            // Check if the error is due to no internet connection
            if (!navigator.onLine) {
              setError("No internet connection. Please check your network.");
            }  else {
              // Check for unauthorized requests
              if (err?.response?.status === 401) {
                dispatch(logout());
                navigate(Rout.signIn);
                return;
              }

              const error = err?.response?.data?.error
                ? err?.response?.data?.error
                : "An error occurred. Please try again.";
              setError(error);

              if (err?.response?.status === 403) {
                dispatch(logout());
                navigate(RoutePaths.signIn);
                return;
              }
            }
          }
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigate]
  );

  return { data, loading, error, get, post, source, deleteApi };
};

export default useApi;
