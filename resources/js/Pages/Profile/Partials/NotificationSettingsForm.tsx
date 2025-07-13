import React, { useState, useEffect } from 'react';
import SectionTitle from '@/Components/SectionTitle';
import FormSection from '@/Components/FormSection';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useNotificationSound } from '@/Hooks/useNotificationSound';

export default function NotificationSettingsForm() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [visualEnabled, setVisualEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('');

  const { playNotification, setEnabled, setVolume } = useNotificationSound({
    enabled: soundEnabled,
    volume: volume,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSoundEnabled = localStorage.getItem(
      'notification_sound_enabled',
    );
    const savedVisualEnabled = localStorage.getItem(
      'notification_visual_enabled',
    );
    const savedVolume = localStorage.getItem('notification_volume');

    if (savedSoundEnabled !== null) {
      setSoundEnabled(savedSoundEnabled === 'true');
    }
    if (savedVisualEnabled !== null) {
      setVisualEnabled(savedVisualEnabled === 'true');
    }
    if (savedVolume !== null) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notification_sound_enabled', soundEnabled.toString());
    localStorage.setItem(
      'notification_visual_enabled',
      visualEnabled.toString(),
    );
    localStorage.setItem('notification_volume', volume.toString());
  }, [soundEnabled, visualEnabled, volume]);

  // Update notification sound settings
  useEffect(() => {
    setEnabled(soundEnabled);
    setVolume(volume);
  }, [soundEnabled, volume, setEnabled, setVolume]);

  const testNotification = () => {
    playNotification();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setStatus('تم حفظ الإعدادات بنجاح');
      setProcessing(false);

      // Clear status after 3 seconds
      setTimeout(() => setStatus(''), 3000);
    }, 1000);
  };

  return (
    <FormSection
      onSubmit={submit}
      title="إعدادات الإشعارات"
      description="تخصيص إعدادات الإشعارات للمعاملات المعلقة"
      renderActions={() => (
        <>
          <PrimaryButton
            className={`ml-4 ${processing && 'opacity-25'}`}
            disabled={processing}
          >
            حفظ الإعدادات
          </PrimaryButton>

          {status && <div className="text-sm text-gray-600">{status}</div>}
        </>
      )}
    >
      <div className="col-span-6 sm:col-span-4">
        <InputLabel htmlFor="sound_enabled" value="إشعارات الصوت" />

        <div className="mt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              checked={soundEnabled}
              onChange={e => setSoundEnabled(e.target.checked)}
            />
            <span className="mr-2 text-sm text-gray-600">
              تفعيل إشعارات الصوت للمعاملات الجديدة
            </span>
          </label>
        </div>

        {soundEnabled && (
          <div className="mt-4">
            <InputLabel htmlFor="volume" value="مستوى الصوت" />
            <div className="mt-2 flex items-center space-x-4 space-x-reverse">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="flex-1"
                aria-label="مستوى الصوت"
                title="مستوى الصوت"
              />
              <span className="text-sm text-gray-600 w-12">
                {Math.round(volume * 100)}%
              </span>
              <button
                type="button"
                onClick={testNotification}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                اختبار
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-6 sm:col-span-4">
        <InputLabel htmlFor="visual_enabled" value="الإشعارات المرئية" />

        <div className="mt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              checked={visualEnabled}
              onChange={e => setVisualEnabled(e.target.checked)}
            />
            <span className="mr-2 text-sm text-gray-600">
              إظهار الإشعارات المرئية للمعاملات الجديدة
            </span>
          </label>
        </div>
      </div>
    </FormSection>
  );
}
