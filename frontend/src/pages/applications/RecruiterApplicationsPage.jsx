import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, MapPin, Clock } from "lucide-react";
import {
  Badge,
  Spinner,
  RecruiterAppSkeleton,
  PageHeader,
  TabBar,
  EmptyState,
  Avatar,
  useToast,
} from "../../components/ui";
import { applicationsApi } from "../../api/applications";

const STATUS_OPTIONS = [
  "applied",
  "viewed",
  "shortlisted",
  "interviewing",
  "offered",
  "rejected",
];

const STATUS_CONFIG = {
  applied: { label: "Applied", variant: "neutral" },
  viewed: { label: "Viewed", variant: "primary" },
  shortlisted: { label: "Shortlisted", variant: "success" },
  interviewing: { label: "Interviewing", variant: "warning" },
  offered: { label: "Offered", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "applied", label: "New" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offered", label: "Offered" },
  { key: "rejected", label: "Rejected" },
];

const RecruiterApplicationsPage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [updating, setUpdating] = useState(null);
  const toast = useToast();

  const fetchApps = async (status) => {
    setLoading(true);
    try {
      const params = status !== "all" ? { status } : {};
      const res = await applicationsApi.getRecruiterApps(params);
      setApps(res.data.results ?? res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps(tab);
  }, [tab]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdating(appId);
    try {
      await applicationsApi.updateStatus(appId, { status: newStatus });
      setApps((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)),
      );
      toast(`Status updated to ${newStatus}`, "success");
    } catch {
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="page-container py-6 sm:py-8">
      <PageHeader
        title="Applications"
        subtitle={`${apps.length} application${apps.length !== 1 ? "s" : ""}`}
      />

      <div className="mb-6 overflow-x-auto">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <RecruiterAppSkeleton key={i} />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applications"
          subtitle="Applications will appear here"
        />
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onStatusChange={handleStatusChange}
              updating={updating === app.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ApplicationCard = ({ app, onStatusChange, updating }) => {
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
  console.log(app);

  // applicant user id — try common field names your backend might return
  const candidateId =
    app.applicant_profile?.user_id || app.applicant_profile?.id || app.user_id;

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar — clicking goes to candidate profile */}
        <Link
          to={`/recruiter/candidates/${candidateId}`}
          className="flex-shrink-0"
        >
          <Avatar
            name={app.applicant_name || "U"}
            src={app.applicant_profile?.profile_photo}
            size="lg"
          />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              {/* Name links to candidate profile */}
              <Link
                to={`/recruiter/candidates/${candidateId}`}
                className="font-semibold hover:underline"
                style={{ color: "var(--text-primary)" }}
              >
                {app.applicant_name}
              </Link>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Applied for <span className="font-medium">{app.job.title}</span>
              </p>
            </div>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>

          {/* Candidate details */}
          {app.applicant_profile && (
            <div className="flex flex-wrap gap-4 mt-2">
              {app.applicant_profile.experience_years !== undefined && (
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {app.applicant_profile.experience_years} yrs experience
                </span>
              )}
              {app.applicant_profile.location && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  <MapPin size={10} /> {app.applicant_profile.location}
                </span>
              )}
            </div>
          )}

          {/* Skills */}
          {app.applicant_profile?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {app.applicant_profile.skills.slice(0, 5).map((s) => (
                <span
                  key={s}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Applied date + status changer */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Clock size={10} />
              Applied{" "}
              {new Date(app.applied_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>

            {/* View profile link */}
            <Link
              to={`/recruiter/candidates/${candidateId}`}
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--primary)" }}
            >
              View profile →
            </Link>

            {/* Status dropdown */}
            <select
              disabled={updating}
              value={app.status}
              onChange={(e) => onStatusChange(app.id, e.target.value)}
              className="input text-xs py-1.5 px-3 pr-7 h-auto cursor-pointer"
              style={{ width: "auto" }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterApplicationsPage;
