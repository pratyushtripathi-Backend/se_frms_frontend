import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchNotifications } from "../features/dashboard_1/services/notificationService";
import { subscribeToAlerts } from "../services/notificationSocket";

// Cap kept in memory for this live/sustained feed. Full history beyond this
// is never lost - it's always in the database and reachable via
// fetchNotifications() with pagination if a page needs to look further back.
// This cap just keeps an always-open tab from accumulating alerts forever.
const MAX_NOTIFICATIONS = 100;

// Persists the "last time the admin looked at their notifications" across
// page reloads, so the unread bell badge doesn't reset to "everything is
// unread" every time the app is refreshed.
const LAST_SEEN_STORAGE_KEY = "frms.notifications.lastSeenAt";

const NotificationContext = createContext(null);

function toStableId(notification) {
  return notification.id;
}

function toOccurredAt(notification) {
  return notification?.createdDate ? new Date(notification.createdDate) : new Date(0);
}

function readStoredLastSeenAt() {
  try {
    const raw = window.localStorage.getItem(LAST_SEEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    console.error("Failed to read notification last-seen time", error);
    return null;
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [lastSeenAt, setLastSeenAt] = useState(readStoredLastSeenAt);

  useEffect(() => {
    let isMounted = true;

    fetchNotifications({ notificationType: "DASHBOARD", page: 0, size: MAX_NOTIFICATIONS })
      .then((data) => {
        if (!isMounted) return;
        setNotifications((data?.content ?? []).slice(0, MAX_NOTIFICATIONS));
      })
      .catch((error) => {
        console.error("Failed to load notifications", error);
      });

    const unsubscribe = subscribeToAlerts((notification) => {
      setNotifications((current) => {
        if (current.some((item) => toStableId(item) === toStableId(notification))) {
          return current;
        }
        return [notification, ...current].slice(0, MAX_NOTIFICATIONS);
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
    // Mounted once, at the DashboardPage shell level - deliberately does not
    // depend on currentPage, so it survives navigation between pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unread = notifications that arrived after the admin last opened the
  // notifications view. Before the bell has ever been checked (lastSeenAt is
  // null), everything currently loaded counts as unread/new.
  const unreadCount = useMemo(() => {
    if (!lastSeenAt) return notifications.length;
    return notifications.filter((notification) => toOccurredAt(notification) > lastSeenAt).length;
  }, [notifications, lastSeenAt]);

  const markNotificationsSeen = useCallback(() => {
    const now = new Date();
    setLastSeenAt(now);
    try {
      window.localStorage.setItem(LAST_SEEN_STORAGE_KEY, now.toISOString());
    } catch (error) {
      console.error("Failed to persist notification last-seen time", error);
    }
  }, []);

  const value = useMemo(
    () => ({ notifications, unreadCount, markNotificationsSeen }),
    [notifications, unreadCount, markNotificationsSeen],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

export function useNotifications() {
  return useNotificationContext().notifications;
}

// Drives the header bell: how many new notifications have arrived since the
// admin last viewed the notifications page, plus a way to clear that count.
export function useNotificationBell() {
  const { unreadCount, markNotificationsSeen } = useNotificationContext();
  return { unreadCount, markNotificationsSeen };
}
