import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, MapPin, Clock, Trash2, ExternalLink } from "lucide-react";
import {
  Badge,
  Button,
  Spinner,
  PageHeader,
  TabBar,
  EmptyState,
  ApplicationRowSkeleton,
} from "../../components/ui";
import { applicationsApi } from "../../api/applications";
import { useToast } from "../../components/ui";

const STATUS_CONFIG = {
  applied: { label: "Applied", variant: "neutral" },
  viewed: { label: "Viewed", variant: "primary" },
  shortlisted: { label: "Shortlisted", variant: "success" },
  interviewing: { label: "Interviewing", variant: "warning" },
  offered: { label: "Offered", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  withdrawn: { label: "Withdrawn", variant: "neutral" },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "applied", label: "Applied" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offered", label: "Offered" },
  { key: "rejected", label: "Rejected" },
];

const MyApplicationsPage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [withdrawing, setWithdrawing] = useState(null);
  const toast = useToast();

  const fetchApps = async (status) => {
    setLoading(true);
    try {
      const params = status !== "all" ? { status } : {};
      const res = await applicationsApi.getMyApplications(params);
      setApps(res.data.results || res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps(tab);
  }, [tab]);

  const handleWithdraw = async (id) => {
    if (!confirm("Withdraw this application?")) return;
    setWithdrawing(id);
    try {
      await applicationsApi.withdraw(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
      toast("Application withdrawn successfully", "info");
    } catch {
    } finally {
      setWithdrawing(null);
    }
  };

  return (
    <div className="page-container py-6 sm:py-8">
      <PageHeader
        title="My Applications"
        subtitle={`${apps.length} application${apps.length !== 1 ? "s" : ""}`}
      />

      <div className="mb-6 overflow-x-auto">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ApplicationRowSkeleton key={i} />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          subtitle="Start applying to jobs and track them here"
          action={
            <Link to="/jobs">
              <Button variant="primary">Browse jobs</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <ApplicationRow
              key={app.id}
              app={app}
              onWithdraw={handleWithdraw}
              withdrawing={withdrawing === app.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ApplicationRow = ({ app, onWithdraw, withdrawing }) => {
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
  const canWithdraw = ["applied", "viewed"].includes(app.status);

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Company logo */}
        <div
          className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center
          justify-center font-bold text-sm overflow-hidden"
          style={{
            background: "var(--primary-light)",
            color: "var(--primary-text)",
          }}
        >
          {app.job.company.logo ? (
            <img
              src={app.job.company.logo}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            app.job.company.name?.[0]
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link
                to={`/jobs/${app.job.slug}`}
                className="font-semibold text-sm hover:underline flex items-center gap-1"
                style={{ color: "var(--text-primary)" }}
              >
                {app.job.title}
                <ExternalLink
                  size={12}
                  style={{ color: "var(--text-muted)" }}
                />
              </Link>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {app.job.company.name}
              </p>
            </div>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>

          <div className="flex flex-wrap gap-4 mt-2">
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <MapPin size={11} /> {app.job.location}
            </span>
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Clock size={11} />
              Applied{" "}
              {new Date(app.applied_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        {canWithdraw && (
          <Button
            variant="ghost"
            size="sm"
            loading={withdrawing}
            onClick={() => onWithdraw(app.id)}
            className="flex-shrink-0 text-xs gap-1.5"
            style={{ color: "var(--danger)" }}
          >
            <Trash2 size={13} /> Withdraw
          </Button>
        )}
      </div>
    </div>
  );
};

export default MyApplicationsPage;
