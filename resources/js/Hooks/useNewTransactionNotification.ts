import { useEffect, useRef, useState } from 'react';
import { Transaction } from '../types';
import { useNotificationSound } from './useNotificationSound';

interface UseNewTransactionNotificationOptions {
  enabled?: boolean;
  soundEnabled?: boolean;
  visualEnabled?: boolean;
  currentUserEmail?: string; // Add current user email to filter self-created transactions
}

export const useNewTransactionNotification = (
  transactions: Transaction[],
  options: UseNewTransactionNotificationOptions = {},
) => {
  const { enabled = true, currentUserEmail } = options;

  // Read settings from localStorage
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notification_sound_enabled');
    return saved === null ? true : saved === 'true';
  });

  const [visualEnabled, setVisualEnabled] = useState(() => {
    const saved = localStorage.getItem('notification_visual_enabled');
    return saved === null ? true : saved === 'true';
  });

  const previousTransactionsRef = useRef<Set<number>>(new Set());
  const { playNotification } = useNotificationSound({ enabled: soundEnabled });
  const [showVisualNotification, setShowVisualNotification] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const currentTransactionIds = new Set(transactions.map(t => t.id));
    const previousTransactionIds = previousTransactionsRef.current;

    // Check for new transactions (transactions that weren't in the previous list)
    const newTransactions = transactions.filter(
      transaction => !previousTransactionIds.has(transaction.id),
    );

    // If there are new pending transactions, trigger notifications
    const newPendingTransactions = newTransactions.filter(
      transaction => transaction.status === 'pending',
    );

    // Filter out transactions created by the current user (if email is provided)
    const externalPendingTransactions = currentUserEmail
      ? newPendingTransactions.filter(
          transaction => transaction.created_by?.email !== currentUserEmail,
        )
      : newPendingTransactions;

    if (externalPendingTransactions.length > 0) {
      console.log(
        `New external pending transactions detected: ${externalPendingTransactions.length}`,
      );

      // Play sound notification
      if (soundEnabled) {
        playNotification();
      }

      // Show visual notification
      if (visualEnabled) {
        setShowVisualNotification(true);
      }
    }

    // Update the previous transactions reference
    previousTransactionsRef.current = currentTransactionIds;
  }, [transactions, enabled, soundEnabled, visualEnabled, playNotification]);

  const hideVisualNotification = () => {
    setShowVisualNotification(false);
  };

  return {
    showVisualNotification,
    hideVisualNotification,
  };
};
