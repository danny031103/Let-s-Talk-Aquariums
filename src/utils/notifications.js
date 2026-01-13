/**
 * Notification System
 * 
 * Handles browser notifications for new messages
 * - Request permission from user
 * - Show notifications when user is on different page/tab
 * - Manage notification state
 */

/**
 * Request notification permission
 * @returns {Promise<boolean>} - True if permission granted
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Show notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
export const showNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // Default options
  const defaultOptions = {
    icon: '/favicon.ico', // You can add a custom icon
    badge: '/favicon.ico',
    ...options,
  };

  try {
    const notification = new Notification(title, defaultOptions);

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle click to focus window
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

/**
 * Show message notification
 * @param {string} username - Sender username
 * @param {string} message - Message preview
 * @param {string} room - Room name (optional)
 */
export const showMessageNotification = (username, message, room = null) => {
  const title = room ? `New message in ${room}` : 'New message';
  const body = room 
    ? `${username}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`
    : `${username}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`;

  showNotification(title, {
    body,
    tag: `message-${Date.now()}`, // Prevent duplicate notifications
  });
};

/**
 * Notification System Explanation:
 * 
 * Provides browser notification functionality:
 * - requestNotificationPermission(): Asks user for permission
 * - showNotification(): Generic notification display
 * - showMessageNotification(): Specialized for chat messages
 * 
 * Notifications only show if:
 * - Browser supports notifications
 * - User has granted permission
 * - User is on a different page/tab (handled by browser)
 * 
 * Auto-closes after 5 seconds and focuses window on click.
 */
