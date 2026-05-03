import { useState, useEffect } from "react";
import { Plus, Bell, BellOff, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Button,
  Input,
  Select,
  Badge,
  Spinner,
  PageHeader,
  EmptyState,
  useToast,
  AlertSkeleton,
} from "../../components/ui";
import { notificationsApi } from "../../api/notifications";

const JobAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { frequency: "daily" },
  });

  const fetchAlerts = async () => {
    try {
      const r = await notificationsApi.getAlerts();
      // handle both paginated and plain array responses
      setAlerts(r.data.results ?? r.data ?? []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await notificationsApi.createAlert(data);
      reset({ frequency: "daily" });
      setShowForm(false);
      fetchAlerts();
      toast(
        "Job alert created! You'll get notified of matching jobs.",
        "success",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (alert) => {
    await notificationsApi.updateAlert(alert.id, {
      is_active: !alert.is_active,
    });
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alert.id ? { ...a, is_active: !a.is_active } : a,
      ),
    );
    toast(alert.is_active ? "Alert paused" : "Alert activated", "info");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this alert?")) return;
    await notificationsApi.deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast("Alert deleted", "info");
  };

  return (
    <div className="page-container py-6 sm:py-8">
      <PageHeader
        title="Job Alerts"
        subtitle="Get notified when new jobs match your preferences"
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={14} /> New alert
          </Button>
        }
      />

      {/* Create form */}
      {showForm && (
        <div className="card p-6 mb-6 space-y-4">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Create job alert
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Keywords"
              placeholder="React Developer, Python..."
              {...register("keywords")}
            />
            <Input
              label="Location"
              placeholder="Chennai, Remote..."
              {...register("location")}
            />
            <Select label="Job type" {...register("job_type")}>
              <option value="">Any</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </Select>
            <Select label="Work mode" {...register("work_mode")}>
              <option value="">Any</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </Select>
            <Input
              label="Minimum salary (₹)"
              type="number"
              placeholder="e.g. 500000"
              {...register("min_salary")}
            />
            <Select label="Alert frequency" {...register("frequency")}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </Select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              onClick={handleSubmit(onSubmit)}
            >
              Create alert
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <AlertSkeleton key={i} />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No job alerts yet"
          subtitle="Create an alert to get notified about new matching jobs"
          action={
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Create your first alert
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AlertRow = ({ alert, onToggle, onDelete }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: alert.is_active
              ? "var(--primary-light)"
              : "var(--surface-2)",
          }}
        >
          <Bell
            size={16}
            style={{
              color: alert.is_active ? "var(--primary)" : "var(--text-muted)",
            }}
          />
        </div>
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {alert.keywords || "All jobs"}
          </p>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {alert.location && (
              <Badge variant="neutral">{alert.location}</Badge>
            )}
            {alert.job_type && (
              <Badge variant="neutral">
                {alert.job_type.replace("_", " ")}
              </Badge>
            )}
            {alert.work_mode && (
              <Badge variant="neutral">{alert.work_mode}</Badge>
            )}
            <Badge variant={alert.is_active ? "success" : "neutral"}>
              {alert.frequency}
            </Badge>
          </div>
          {alert.last_sent && (
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Last sent: {new Date(alert.last_sent).toLocaleDateString("en-IN")}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onToggle(alert)}
          className="btn btn-ghost btn-sm gap-1.5 text-xs"
          style={{
            color: alert.is_active ? "var(--warning)" : "var(--success)",
          }}
        >
          {alert.is_active ? (
            <>
              <BellOff size={13} /> Pause
            </>
          ) : (
            <>
              <Bell size={13} /> Activate
            </>
          )}
        </button>
        <button
          onClick={() => onDelete(alert.id)}
          className="btn btn-ghost btn-sm"
          style={{ color: "var(--danger)" }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  </div>
);

export default JobAlertsPage;
