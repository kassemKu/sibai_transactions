import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Currency, CashSession, User, Customer, Transaction } from '../types';

interface CashierBalance {
  currency_id: number;
  amount: number;
  currency?: Currency;
}

interface Cashier {
  id: number;
  name: string;
  email: string;
  system_balances?: CashierBalance[];
  has_active_session?: boolean;
}

interface StatusData {
  current_session: CashSession | null;
  currencies: Currency[];
  transactions: Transaction[];
  cashiers?: Cashier[];
  available_cashers?: User[];
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
  cashiers: Cashier[];
  availableCashers: User[];
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
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [availableCashers, setAvailableCashers] = useState<User[]>([]);
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
            cashiers: fetchedCashiers = [],
            available_cashers: fetchedAvailableCashers = [],
          } = response.data.data;

          setCurrentSession(current_session);
          setCurrencies(fetchedCurrencies);
          setTransactions(fetchedTransactions);
          setCashiers(fetchedCashiers);
          setAvailableCashers(fetchedAvailableCashers);
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
    cashiers,
    availableCashers,
    isLoading,
    isPolling,
    lastUpdated,
    error,
    refetch,
  };
};
