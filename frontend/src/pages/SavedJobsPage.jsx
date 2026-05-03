import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  MapPin,
  Clock,
  TrendingUp,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  Badge,
  Button,
  Spinner,
  PageHeader,
  EmptyState,
  JobCardSkeleton,
} from "../components/ui";
import { jobsApi } from "../api/jobs";
import { useToast } from "../components/ui";

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  return `${Math.floor(diff / 7)}w ago`;
};

const SavedJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    jobsApi
      .getSaved()
      .then((r) => setJobs(r.data.results || r.data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (slug, e) => {
    e.preventDefault();
    setRemoving(slug);
    try {
      await jobsApi.toggleSave(slug);
      setJobs((prev) => prev.filter((j) => j.slug !== slug));
      toast("Job removed from saved list", "info");
    } catch {
      toast("Failed to remove job", "error");
    } finally {
      setRemoving(null);
    }
  };

  const salary = (job) => {
    if (job.salary_min && job.salary_max)
      return `₹${(job.salary_min / 100000).toFixed(1)}–${(job.salary_max / 100000).toFixed(1)} LPA`;
    if (job.salary_min) return `₹${(job.salary_min / 100000).toFixed(1)}+ LPA`;
    return null;
  };

  return (
    <div className="page-container py-6 sm:py-8">
      <PageHeader
        title="Saved Jobs"
        subtitle={
          loading
            ? "Loading..."
            : `${jobs.length} saved job${jobs.length !== 1 ? "s" : ""}`
        }
        action={
          !loading &&
          jobs.length > 0 && (
            <Link to="/jobs">
              <Button variant="primary" size="md">
                Browse more jobs
              </Button>
            </Link>
          )
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          subtitle="Bookmark jobs you're interested in and apply when you're ready"
          action={
            <Link to="/jobs">
              <Button variant="primary" size="md">
                Browse jobs
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              className={`card card-glow flex flex-col animate-fade-in-up`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Link
                to={`/jobs/${job.slug}`}
                className="flex flex-col gap-4 p-5 flex-1"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center
                    justify-center text-sm font-bold overflow-hidden"
                    style={{
                      background: "var(--primary-light)",
                      color: "var(--primary-text)",
                    }}
                  >
                    {job.company?.logo ? (
                      <img
                        src={job.company.logo}
                        alt={job.company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      job.company?.name?.[0]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {job.company?.name}
                    </p>
                    <h3
                      className="text-sm font-bold mt-0.5 line-clamp-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {job.title}
                    </h3>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant={
                      job.work_mode === "remote"
                        ? "success"
                        : job.work_mode === "hybrid"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {job.work_mode}
                  </Badge>
                  <Badge variant="neutral">
                    {job.job_type?.replace("_", " ")}
                  </Badge>
                  <Badge variant="neutral">
                    {job.experience_level?.replace("_", "–")} yrs
                  </Badge>
                </div>

                {/* Meta */}
                <div
                  className="flex flex-wrap gap-4 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {job.location}
                  </span>
                  {salary(job) && (
                    <span
                      className="flex items-center gap-1 font-bold"
                      style={{ color: "var(--primary)" }}
                    >
                      <TrendingUp size={11} /> {salary(job)}
                    </span>
                  )}
                </div>

                {/* Skills */}
                {job.skills_required?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills_required.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                    {job.skills_required.length > 4 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--text-muted)",
                        }}
                      >
                        +{job.skills_required.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </Link>

              {/* Footer */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Clock size={11} /> {timeAgo(job.created_at)}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/jobs/${job.slug}`}
                    className="btn btn-ghost btn-xs gap-1"
                    style={{ color: "var(--primary)" }}
                  >
                    <ExternalLink size={12} /> Apply
                  </Link>
                  <button
                    onClick={(e) => handleUnsave(job.slug, e)}
                    disabled={removing === job.slug}
                    className="btn btn-ghost btn-xs gap-1"
                    style={{ color: "var(--danger)" }}
                  >
                    {removing === job.slug ? (
                      <span
                        className="w-3 h-3 border border-current border-t-transparent
                          rounded-full animate-spin"
                      />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
