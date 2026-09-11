import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchNotifications } from "../features/dashboard_1/services/notificationService";
import { subscribeToAlerts } from "../services/notificationSocket";

// Cap kept in memory for this live/sustained feed. Full history beyond this
// is never lost - it's always in the database and reachable via
// fetchNotifications() with pagination if a page needs to look further back.
// This cap just keeps an always-open tab from accumulating alerts forever.
const MAX_NOTIFICATIONS = 100;

const NotificationContext = createContext(null);

function toStableId(notification) {
  return notification.id;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

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

  const value = useMemo(() => ({ notifications }), [notifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context.notifications;
}
