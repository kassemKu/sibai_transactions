import { useCallback, useState } from 'react';
import { playBeepSound } from '../utils/notificationSound';

interface UseNotificationSoundOptions {
  enabled?: boolean;
  volume?: number;
}

interface UseNotificationSoundReturn {
  playNotification: () => void;
  setEnabled: (enabled: boolean) => void;
  isEnabled: boolean;
  setVolume: (volume: number) => void;
  volume: number;
}

export const useNotificationSound = ({
  enabled = true,
  volume = 0.5,
}: UseNotificationSoundOptions = {}): UseNotificationSoundReturn => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [currentVolume, setCurrentVolume] = useState(volume);

  const playNotification = useCallback(() => {
    if (!isEnabled) return;

    try {
      // Use Web Audio API for better control and no file dependency
      playBeepSound();
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }, [isEnabled]);

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
  }, []);

  const setVolume = useCallback((volume: number) => {
    setCurrentVolume(Math.max(0, Math.min(1, volume)));
  }, []);

  return {
    playNotification,
    setEnabled,
    isEnabled,
    setVolume,
    volume: currentVolume,
  };
};
