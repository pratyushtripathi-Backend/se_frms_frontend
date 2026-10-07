import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
} from "../features/dashboard/services/notificationService";
import {
  onSocketConnect,
  subscribeToAlerts,
  subscribeToReadState,
} from "../services/notificationSocket";

// Cap kept in memory for this live/sustained feed. Full history beyond this
// is never lost - it's always in the database and reachable via
// fetchNotifications() with pagination if a page needs to look further back.
// This cap just keeps an always-open tab from accumulating alerts forever.
const MAX_NOTIFICATIONS = 100;

// Safety-net re-sync of the list and the unread count, on top of the live
// WebSocket push: catches anything missed while the socket was down or the
// tab was in the background.
const RESYNC_INTERVAL_MS = 30000;

// Read/unread used to be a "last seen" time in localStorage, which reset the
// bell to "99+" whenever browser storage was cleared. It now lives in
// notification-service (shared by all admins); this old key is only removed.
const LEGACY_LAST_SEEN_STORAGE_KEY = "frms.notifications.lastSeenAt";

const NotificationContext = createContext(null);

function toStableId(notification) {
  return notification.id;
}

function toCount(data) {
  const count = Number(data?.unreadCount);
  return Number.isFinite(count) && count >= 0 ? count : null;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // Ids already shown, so a duplicate WebSocket push never bumps the count twice.
  const seenIdsRef = useRef(new Set());
  const markReadInFlightRef = useRef(false);

  const refreshUnreadCount = useCallback(() => {
    fetchUnreadCount()
      .then((data) => {
        const count = toCount(data);
        if (count !== null) setUnreadCount(count);
      })
      .catch((error) => {
        console.error("Failed to load unread notification count", error);
      });
  }, []);

  // Loads the latest notifications and merges them into the list: anything
  // already shown (including live alerts that arrived meanwhile) is kept, and
  // anything new is added. Used on start-up, after a reconnect, when the tab
  // becomes visible again and every RESYNC_INTERVAL_MS.
  const isMountedRef = useRef(true);
  const loadNotificationList = useCallback(() => {
    fetchNotifications({ notificationType: "DASHBOARD", page: 0, size: MAX_NOTIFICATIONS })
      .then((data) => {
        if (!isMountedRef.current) return;
        const loaded = (data?.content ?? []).slice(0, MAX_NOTIFICATIONS);
        loaded.forEach((item) => seenIdsRef.current.add(toStableId(item)));
        setNotifications((current) => {
          // Keep any live alerts that arrived while this request was in flight.
          const loadedIds = new Set(loaded.map(toStableId));
          const liveOnly = current.filter((item) => !loadedIds.has(toStableId(item)));
          return [...liveOnly, ...loaded].slice(0, MAX_NOTIFICATIONS);
        });
      })
      .catch((error) => {
        console.error("Failed to load notifications", error);
      });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    try {
      window.localStorage.removeItem(LEGACY_LAST_SEEN_STORAGE_KEY);
    } catch {
      // Storage unavailable - nothing to clean up.
    }

    loadNotificationList();
    refreshUnreadCount();

    const unsubscribeAlerts = subscribeToAlerts((notification) => {
      const id = toStableId(notification);
      if (seenIdsRef.current.has(id)) return;
      seenIdsRef.current.add(id);

      setNotifications((current) => [notification, ...current].slice(0, MAX_NOTIFICATIONS));
      if (notification.read !== true) {
        setUnreadCount((count) => count + 1);
      }
    });

    // Read state is shared: when any admin opens the notifications view,
    // every open dashboard gets the new count.
    const unsubscribeReadState = subscribeToReadState((data) => {
      const count = toCount(data);
      if (count !== null) setUnreadCount(count);
    });

    // Re-sync after a reconnect, in case alerts or reads were missed meanwhile.
    const resync = () => {
      loadNotificationList();
      refreshUnreadCount();
    };
    const unsubscribeConnect = onSocketConnect(resync);

    // Also re-sync when the tab becomes visible again, and periodically.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") resync();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const resyncIntervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") resync();
    }, RESYNC_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      window.clearInterval(resyncIntervalId);
      unsubscribeAlerts();
      unsubscribeReadState();
      unsubscribeConnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // Mounted once, at the DashboardPage shell level - deliberately does not
    // depend on currentPage, so it survives navigation between pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opening the notifications view (bell click or the page itself) marks
  // everything read in the backend. The badge clears immediately; the server's
  // answer then sets the real count (normally 0).
  const markNotificationsSeen = useCallback(() => {
    if (markReadInFlightRef.current) return;
    markReadInFlightRef.current = true;
    setUnreadCount(0);

    markAllNotificationsRead()
      .then((data) => {
        const count = toCount(data);
        if (count !== null) setUnreadCount(count);
      })
      .catch((error) => {
        console.error("Failed to mark notifications as read", error);
        refreshUnreadCount();
      })
      .finally(() => {
        markReadInFlightRef.current = false;
      });
  }, [refreshUnreadCount]);

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

// Drives the header bell: the backend's unread count (shared by all admins),
// plus a way to mark everything read.
export function useNotificationBell() {
  const { unreadCount, markNotificationsSeen } = useNotificationContext();
  return { unreadCount, markNotificationsSeen };
}
