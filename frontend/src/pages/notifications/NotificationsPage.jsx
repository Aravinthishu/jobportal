import { useState, useEffect } from "react";
import {
  Trash2,
  CheckCheck,
  Bell,
  FileText,
  Briefcase,
  Mail,
  AlertCircle,
  X,
} from "lucide-react";
import {
  Button,
  Spinner,
  PageHeader,
  EmptyState,
  NotificationSkeleton,
} from "../../components/ui";
import { notificationsApi } from "../../api/notifications";
import { useToast } from "../../components/ui";

const TYPE_ICON = {
  application_status: FileText,
  new_application: Briefcase,
  invite: Mail,
  job_alert: Briefcase,
  system: AlertCircle,
};

const TYPE_COLOR = {
  application_status: "var(--primary)",
  new_application: "var(--success)",
  invite: "var(--warning)",
  job_alert: "var(--primary)",
  system: "var(--text-muted)",
};

const TYPE_BG = {
  application_status: "var(--primary-light)",
  new_application: "var(--success-light)",
  invite: "var(--warning-light)",
  job_alert: "var(--primary-light)",
  system: "var(--surface-2)",
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff} minute${diff > 1 ? "s" : ""} ago`;
  if (diff < 1440)
    return `${Math.floor(diff / 60)} hour${Math.floor(diff / 60) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diff / 1440)} day${Math.floor(diff / 1440) > 1 ? "s" : ""} ago`;
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const r = await notificationsApi.getAll();
      setNotifications(r.data.results ?? r.data ?? []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast("All notifications marked as read", "success");
  };

  const handleDelete = async (id) => {
    await notificationsApi.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast("Notification deleted", "info");
  };

  const handleDeleteAll = async () => {
    if (!confirm("Delete all notifications?")) return;
    await notificationsApi.deleteAll();
    setNotifications([]);
    toast("All notifications deleted", "info");
  };

  const unread = notifications.filter((n) => !n.is_read).length;
  const filtered =
    filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((n) => !n.is_read)
        : notifications.filter((n) => n.type === filter);

  const FILTERS = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unread },
    {
      key: "application_status",
      label: "Applications",
      count: notifications.filter((n) => n.type === "application_status")
        .length,
    },
    {
      key: "new_application",
      label: "New Apps",
      count: notifications.filter((n) => n.type === "new_application").length,
    },
    {
      key: "invite",
      label: "Invites",
      count: notifications.filter((n) => n.type === "invite").length,
    },
    {
      key: "job_alert",
      label: "Job Alerts",
      count: notifications.filter((n) => n.type === "job_alert").length,
    },
  ].filter((f) => f.count > 0 || f.key === "all" || f.key === "unread");

  return (
    <div className="page-container py-6 sm:py-8">
      <PageHeader
        title="Notifications"
        subtitle={
          unread > 0
            ? `${unread} unread notification${unread > 1 ? "s" : ""}`
            : "All caught up!"
        }
        action={
          notifications.length > 0 && (
            <div className="flex gap-2">
              {unread > 0 && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleMarkAllRead}
                >
                  <CheckCheck size={14} /> Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="md"
                onClick={handleDeleteAll}
                style={{ color: "var(--danger)" }}
              >
                <Trash2 size={14} /> Clear all
              </Button>
            </div>
          )
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                       font-medium whitespace-nowrap transition-all flex-shrink-0"
            style={
              filter === f.key
                ? { background: "var(--primary)", color: "#fff" }
                : {
                    background: "var(--surface-2)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }
            }
          >
            {f.label}
            {f.count > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px]"
                style={
                  filter === f.key
                    ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                    : {
                        background: "var(--border)",
                        color: "var(--text-muted)",
                      }
                }
              >
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={
            filter === "unread" ? "No unread notifications" : "No notifications"
          }
          subtitle="You're all caught up!"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NotificationItem = ({ notification: n, onMarkRead, onDelete }) => {
  const Icon = TYPE_ICON[n.type] || Bell;
  const color = TYPE_COLOR[n.type] || "var(--text-muted)";
  const bgColor = TYPE_BG[n.type] || "var(--surface-2)";

  return (
    <div
      className="card p-4 transition-all"
      style={{
        background: n.is_read ? "var(--surface)" : "var(--primary-light)",
        borderColor: n.is_read ? "var(--border)" : "var(--primary)",
        opacity: 1,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: bgColor }}
        >
          <Icon size={16} style={{ color }} />
        </div>

        {/* Content */}
        <div
          className="flex-1 min-w-0"
          onClick={() => !n.is_read && onMarkRead(n.id)}
          style={{ cursor: n.is_read ? "default" : "pointer" }}
        >
          <div className="flex items-start justify-between gap-2">
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {n.title}
            </p>
            {!n.is_read && (
              <span
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                style={{ background: "var(--primary)" }}
              />
            )}
          </div>
          <p
            className="text-sm mt-0.5 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {n.message}
          </p>
          <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
            {timeAgo(n.created_at)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!n.is_read && (
            <button
              onClick={() => onMarkRead(n.id)}
              className="btn btn-ghost btn-sm w-7 h-7 p-0 rounded-lg"
              title="Mark as read"
            >
              <CheckCheck size={13} style={{ color: "var(--primary)" }} />
            </button>
          )}
          <button
            onClick={() => onDelete(n.id)}
            className="btn btn-ghost btn-sm w-7 h-7 p-0 rounded-lg"
            title="Delete"
          >
            <X size={13} style={{ color: "var(--danger)" }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
