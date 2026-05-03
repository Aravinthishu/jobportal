import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Briefcase,
  FileText,
  Mail,
  AlertCircle,
} from "lucide-react";
import { notificationsApi } from "../../api/notifications";
import { Link } from "react-router-dom";

const TYPE_ICON = {
  application_status: FileText,
  new_application: Briefcase,
  invite: Mail,
  job_alert: Briefcase,
  system: AlertCircle,
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Poll unread count every 30s
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const r = await notificationsApi.getUnreadCount();
        setUnread(r.data.count);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open) {
      setLoading(true);
      try {
        const r = await notificationsApi.getAll();
        setNotifications(r.data.results || r.data);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkRead = async (id) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="btn btn-ghost btn-sm w-9 h-9 p-0 rounded-lg relative"
      >
        <Bell size={16} style={{ color: "var(--text-secondary)" }} />
        {unread > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full
            flex items-center justify-center text-white text-[10px] font-bold px-1"
            style={{ background: "var(--danger)" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 w-80 sm:w-96 rounded-xl overflow-hidden z-50"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <p
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Notifications
              {unread > 0 && (
                <span
                  className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "var(--danger-light)",
                    color: "var(--danger)",
                  }}
                >
                  {unread} new
                </span>
              )}
            </p>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs"
                style={{ color: "var(--primary)" }}
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div
                  className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: "var(--primary)" }}
                />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell
                  size={24}
                  style={{ color: "var(--text-muted)", margin: "0 auto" }}
                />
                <p
                  className="text-sm mt-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICON[n.type] || Bell;
                return (
                  <div
                    key={n.id}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      background: n.is_read
                        ? "transparent"
                        : "var(--primary-light)",
                      borderBottom: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) =>
                      !n.is_read &&
                      (e.currentTarget.style.background = "var(--surface-2)")
                    }
                    onMouseLeave={(e) =>
                      !n.is_read &&
                      (e.currentTarget.style.background =
                        "var(--primary-light)")
                    }
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: n.is_read
                          ? "var(--surface-2)"
                          : "var(--primary-light)",
                        color: n.is_read
                          ? "var(--text-muted)"
                          : "var(--primary)",
                      }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {n.title}
                      </p>
                      <p
                        className="text-xs mt-0.5 line-clamp-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {n.message}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div
                        className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                        style={{ background: "var(--primary)" }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className="px-4 py-3 text-center"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-medium hover:underline"
                style={{ color: "var(--primary)" }}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
