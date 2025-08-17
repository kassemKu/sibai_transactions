import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Currency, CashSession, User, Customer, Transaction } from '../types';
import isEqual from 'lodash/isEqual';

interface CashierBalance {
  currency_id: number;
  amount: number;
  currency?: Currency;
}

interface MySession {
  id: number;
  opened_at: string;
  closed_at: string | null;
  opened_by: number;
  closed_by: number | null;
  opening_balances: Array<{
    amount: number;
    currency_id: number;
  }>;
  system_balances: any;
  differences: any;
  actual_closing_balances: any;
  cash_session_id: number;
  casher_id: number;
  transfers: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StatusData {
  current_session: CashSession | null;
  currencies: Currency[];
  transactions: Transaction[];
  available_cashers?: User[];
  my_session?: MySession;
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
  availableCashers: User[];
  mySession: MySession | null;
  isLoading: boolean;
  isPolling: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refetch: () => Promise<void>;
  // New functions for immediate state updates
  updateCurrentSession: (session: CashSession | null) => void;
  updateMySession: (session: MySession | null) => void;
  updateTransactions: (transactions: Transaction[]) => void;
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
  const [availableCashers, setAvailableCashers] = useState<User[]>([]);
  const [mySession, setMySession] = useState<MySession | null>(null);
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
            available_cashers: fetchedAvailableCashers = [],
            my_session: fetchedMySession = null,
          } = response.data.data;

          // Only update state if data has changed
          setCurrentSession(prev =>
            isEqual(prev, current_session) ? prev : current_session,
          );
          setCurrencies(prev =>
            isEqual(prev, fetchedCurrencies) ? prev : fetchedCurrencies,
          );
          setTransactions(prev =>
            isEqual(prev, fetchedTransactions) ? prev : fetchedTransactions,
          );
          setAvailableCashers(prev =>
            isEqual(prev, fetchedAvailableCashers)
              ? prev
              : fetchedAvailableCashers,
          );
          setMySession(prev =>
            isEqual(prev, fetchedMySession) ? prev : fetchedMySession,
          );
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

  // Functions for immediate state updates
  const updateCurrentSession = useCallback((session: CashSession | null) => {
    setCurrentSession(session);
    setLastUpdated(new Date());
  }, []);

  const updateMySession = useCallback((session: MySession | null) => {
    setMySession(session);
    setLastUpdated(new Date());
  }, []);

  const updateTransactions = useCallback((newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    setLastUpdated(new Date());
  }, []);

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
    availableCashers,
    mySession,
    isLoading,
    isPolling,
    lastUpdated,
    error,
    refetch,
    updateCurrentSession,
    updateMySession,
    updateTransactions,
  };
};
