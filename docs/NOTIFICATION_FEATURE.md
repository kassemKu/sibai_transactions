# Pending Transactions Notification Feature

## Overview

This feature provides audio and visual notifications when new pending transactions are assigned to a cashier, ensuring they are promptly aware of transactions requiring action.

## Features

### 🎵 Audio Notifications

- **Web Audio API**: Uses browser's Web Audio API to generate notification sounds
- **No External Files**: No need for external audio files - generates sounds programmatically
- **Customizable Volume**: Users can adjust volume level (0-100%)
- **Test Function**: Users can test the notification sound in settings
- **External Transaction Filtering**: Only triggers for transactions created by other users (prevents self-triggered alerts)

### 👁️ Visual Notifications

- **Toast Notifications**: Green notification banner appears in top-right corner
- **External Transaction Focus**: Only shows for transactions created by other users
- **Auto-dismiss**: Notifications automatically disappear after 5 seconds
- **Manual Close**: Users can manually close notifications
- **Session-aware**: Only shows when cash session is active

### ⚙️ Settings Management

- **Profile Integration**: Notification settings available in user profile
- **Local Storage**: Settings persist across browser sessions
- **Individual Controls**: Separate toggles for sound and visual notifications
- **Volume Control**: Slider to adjust notification volume

## Technical Implementation

### Hooks Used

1. **`useNotificationSound`** (`resources/js/Hooks/useNotificationSound.ts`)
   - Manages audio playback using Web Audio API
   - Handles volume control and enable/disable functionality
   - Generates beep sounds programmatically

2. **`useNewTransactionNotification`** (`resources/js/Hooks/useNewTransactionNotification.ts`)
   - Detects new pending transactions by comparing transaction lists
   - Filters out self-created transactions to prevent noise
   - Triggers both audio and visual notifications for external transactions only
   - Reads settings from localStorage

### Components

1. **`NewTransactionNotification`** (`resources/js/Components/Casher/NewTransactionNotification.tsx`)
   - Visual notification component
   - Auto-dismissing toast notification
   - Accessible with proper ARIA labels

2. **`NotificationSettingsForm`** (`resources/js/Pages/Profile/Partials/NotificationSettingsForm.tsx`)
   - Settings form in user profile
   - Controls for sound/visual notifications
   - Volume slider and test button

3. **`PendingTransactionsTable`** (`resources/js/Components/Casher/PendingTransactionsTable.tsx`)
   - Self-contained notification system for cashiers
   - Integrated notification hooks and visual alerts

4. **`RecentTransactionsTable`** (`resources/js/Components/Dashboard/RecentTransactionsTable.tsx`)
   - Self-contained notification system for admins
   - Integrated notification hooks and visual alerts

### Integration Points

- **PendingTransactionsTable**: Self-contained notification system for cashier dashboard
- **RecentTransactionsTable**: Self-contained notification system for admin dashboard
- **Profile Page**: Settings management interface
- **Status Polling**: Works with existing `useStatusPolling` hook

## User Experience

### For Cashiers

1. **Automatic Detection**: System automatically detects new pending transactions
2. **External Transaction Filtering**: Only notifies for transactions created by other users (prevents self-triggered alerts)
3. **Immediate Alert**: Sound plays immediately when new external transaction arrives
4. **Visual Feedback**: Green notification banner appears
5. **Session Awareness**: Only active during open cash sessions

### For Administrators

1. **Settings Control**: Can manage notification preferences in profile
2. **Testing**: Can test notification sounds before using
3. **Customization**: Can adjust volume and enable/disable features
4. **External Transaction Filtering**: Only notified for transactions created by other users
5. **Dashboard Integration**: Notifications work in both cashier and admin dashboards

## Browser Compatibility

- **Web Audio API**: Supported in all modern browsers
- **Local Storage**: Settings persist across sessions
- **Graceful Fallback**: Handles cases where audio fails to play

## Future Enhancements

1. **Custom Sound Files**: Allow users to upload custom notification sounds
2. **Notification History**: Track and display notification history
3. **Advanced Settings**: Per-transaction type notifications
4. **Push Notifications**: Browser push notifications for offline awareness

## Configuration

### Default Settings

- Sound notifications: **Enabled**
- Visual notifications: **Enabled**
- Volume: **50%**

### Storage Keys

- `notification_sound_enabled`: Boolean for sound toggle
- `notification_visual_enabled`: Boolean for visual toggle
- `notification_volume`: Number (0-1) for volume level

## Testing

1. **Manual Testing**: Use test button in profile settings
2. **Real Scenarios**: Create new pending transactions to trigger notifications
3. **Settings Persistence**: Verify settings save and load correctly
4. **Session States**: Test notifications during different session states
