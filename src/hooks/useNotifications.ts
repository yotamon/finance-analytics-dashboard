import { useState, useCallback, useEffect } from "react";

/**
 * Notification severity levels
 */
export type NotificationSeverity = "success" | "info" | "warning" | "error";

/**
 * Notification object structure
 */
export interface Notification {
  /**
   * Unique ID for the notification
   */
  id: string;

  /**
   * Notification message
   */
  message: string;

  /**
   * Notification title (optional)
   */
  title?: string;

  /**
   * Notification severity
   */
  severity: NotificationSeverity;

  /**
   * Auto-hide duration in milliseconds (0 means it won't auto-hide)
   */
  autoHideDuration?: number;

  /**
   * Timestamp when the notification was created
   */
  timestamp: number;

  /**
   * Any additional data to attach to the notification
   */
  data?: Record<string, any>;
}

/**
 * Options for creating a notification
 */
export interface NotificationOptions {
  /**
   * Notification title (optional)
   */
  title?: string;

  /**
   * Notification severity
   */
  severity?: NotificationSeverity;

  /**
   * Auto-hide duration in milliseconds (0 means it won't auto-hide)
   */
  autoHideDuration?: number;

  /**
   * Any additional data to attach to the notification
   */
  data?: Record<string, any>;
}

/**
 * Return type of the useNotifications hook
 */
export interface UseNotificationsReturn {
  /**
   * Current list of notifications
   */
  notifications: Notification[];

  /**
   * Add a success notification
   */
  showSuccess: (message: string, options?: Omit<NotificationOptions, "severity">) => void;

  /**
   * Add an info notification
   */
  showInfo: (message: string, options?: Omit<NotificationOptions, "severity">) => void;

  /**
   * Add a warning notification
   */
  showWarning: (message: string, options?: Omit<NotificationOptions, "severity">) => void;

  /**
   * Add an error notification
   */
  showError: (message: string, options?: Omit<NotificationOptions, "severity">) => void;

  /**
   * Add a custom notification
   */
  addNotification: (message: string, options?: NotificationOptions) => void;

  /**
   * Remove a notification by ID
   */
  removeNotification: (id: string) => void;

  /**
   * Clear all notifications
   */
  clearNotifications: () => void;
}

/**
 * Custom hook for managing application notifications
 *
 * @returns {UseNotificationsReturn} Functions and state for notifications management
 */
export default function useNotifications(): UseNotificationsReturn {
  // State to hold all notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Generate a unique ID for each notification
  const generateId = useCallback((): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }, []);

  // Add a notification to the list
  const addNotification = useCallback(
    (message: string, options: NotificationOptions = {}): void => {
      const notification: Notification = {
        id: generateId(),
        message,
        title: options.title,
        severity: options.severity || "info",
        autoHideDuration: options.autoHideDuration !== undefined ? options.autoHideDuration : 5000,
        timestamp: Date.now(),
        data: options.data,
      };

      setNotifications((prev) => [...prev, notification]);
    },
    [generateId]
  );

  // Helper functions for different notification types
  const showSuccess = useCallback(
    (message: string, options?: Omit<NotificationOptions, "severity">): void => {
      addNotification(message, { ...options, severity: "success" });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message: string, options?: Omit<NotificationOptions, "severity">): void => {
      addNotification(message, { ...options, severity: "info" });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (message: string, options?: Omit<NotificationOptions, "severity">): void => {
      addNotification(message, { ...options, severity: "warning" });
    },
    [addNotification]
  );

  const showError = useCallback(
    (message: string, options?: Omit<NotificationOptions, "severity">): void => {
      addNotification(message, { ...options, severity: "error" });
    },
    [addNotification]
  );

  // Remove a notification by ID
  const removeNotification = useCallback((id: string): void => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback((): void => {
    setNotifications([]);
  }, []);

  // Auto-remove notifications based on their autoHideDuration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      if (notification.autoHideDuration && notification.autoHideDuration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.autoHideDuration);

        timers.push(timer);
      }
    });

    // Cleanup timers on unmount or when notifications change
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [notifications, removeNotification]);

  return {
    notifications,
    showSuccess,
    showInfo,
    showWarning,
    showError,
    addNotification,
    removeNotification,
    clearNotifications,
  };
}
