import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const useApi = (endpoint) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { api, token, isAuthLoading } = useAuth();
    const { showToast } = useToast();

    // useCallback ensures this function's identity is stable
    const fetchData = useCallback(async () => {
        // Don't try to fetch if we are not logged in
        if (isAuthLoading || !token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // "Cache Busting": Add a unique timestamp to every GET request to
            // force the browser to bypass its cache and always ask the server for fresh data.
            const url = `${endpoint}?_t=${new Date().getTime()}`;
            const response = await api.get(url);
            setData(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${endpoint}:`, error);
            // We'll let the individual pages show their own "no data" message
            // instead of showing a generic error toast here.
            setData([]); // Reset data on error
        } finally {
            setIsLoading(false);
        }
    }, [api, token, endpoint, showToast, isAuthLoading]);

    // This is the CRITICAL FIX. This useEffect will now automatically
    // call fetchData whenever the component that uses this hook is first mounted.
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // We return the state and the fetchData function in case we want to manually refresh
    return { data, isLoading, fetchData };
};