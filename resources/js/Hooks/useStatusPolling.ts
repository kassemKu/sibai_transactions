import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Currency {
  id: number;
  name: string;
  code: string;
  rate_to_usd: string;
  profit_margin_percent: string;
  is_crypto: number;
  created_at: string;
  updated_at: string;
}

interface CashSession {
  id: number;
  opened_at: string;
  closed_at: string | null;
  open_exchange_rates: string;
  close_exchange_rates: string | null;
  status: 'active' | 'pending' | 'closed';
  opened_by: number;
  closed_by: number | null;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Customer {
  id: number;
  name: string;
  phone?: string;
}

interface Transaction {
  id: number;
  cash_session_id: number;
  user_id: number;
  assigned_to: number | null;
  customer_id: number | null;
  from_currency_id: number;
  to_currency_id: number;
  original_amount: number;
  converted_amount: number;
  from_rate_to_usd: string | number;
  to_rate_to_usd: string | number;
  status: 'pending' | 'completed' | 'canceled';
  created_at: string;
  updated_at: string;
  from_currency: Currency;
  to_currency: Currency;
  user: User;
  customer: Customer;
}

interface StatusData {
  current_session: CashSession | null;
  currencies: Currency[];
  transactions: Transaction[];
}

interface StatusResponse {
  status: boolean;
  message: string;
  data: StatusData;
}

interface UseStatusPollingReturn {
  currentSession: CashSession | null;
  currencies: Currency[];
  transactions: Transaction[];
  isLoading: boolean;
  isPolling: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStatusPolling = (
  pollingInterval: number = 3000,
  enabled: boolean = true,
): UseStatusPollingReturn => {
  const [currentSession, setCurrentSession] = useState<CashSession | null>(
    null,
  );
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(
    async (showLoader: boolean = true) => {
      if (!enabled) return;

      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsPolling(true);
      }

      try {
        const response = await axios.get<StatusResponse>('/status');

        if (response.data.status) {
          const {
            current_session,
            currencies: fetchedCurrencies,
            transactions: fetchedTransactions,
          } = response.data.data;

          setCurrentSession(current_session);
          setCurrencies(fetchedCurrencies);
          setTransactions(fetchedTransactions);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching status:', err);
        // Only set error on initial load, not on polling
        if (showLoader) {
          setError('فشل في جلب البيانات');
        }
      } finally {
        if (showLoader) {
          setIsLoading(false);
        } else {
          setIsPolling(false);
        }
      }
    },
    [enabled],
  );

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchStatus(true);
    }
  }, [fetchStatus, enabled]);

  // Polling interval
  useEffect(() => {
    if (!enabled || pollingInterval <= 0) return;

    const interval = setInterval(() => {
      if (!isLoading) {
        fetchStatus(false);
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchStatus, isLoading, pollingInterval, enabled]);

  const refetch = useCallback(async () => {
    await fetchStatus(false);
  }, [fetchStatus]);

  return {
    currentSession,
    currencies,
    transactions,
    isLoading,
    isPolling,
    lastUpdated,
    error,
    refetch,
  };
};
