import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  TrendingUp,
  Users,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { Badge, Button, Spinner, JobDetailSkeleton } from "../components/ui";
import { jobsApi } from "../api/jobs";
import { applicationsApi } from "../api/applications";
import useAuthStore from "../store/authStore";
import ApplyModal from "../components/jobs/ApplyModal";

// ─── Success Modal ────────────────────────────────────────────────────────────
const SuccessModal = ({ job, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.5)" }}
  >
    <div
      className="w-full max-w-md rounded-2xl p-8 text-center"
      style={{ background: "var(--surface)", boxShadow: "var(--shadow-lg)" }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: "var(--success-light)" }}
      >
        <CheckCircle2 size={32} style={{ color: "var(--success)" }} />
      </div>
      <h2
        className="text-xl font-bold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        Application submitted!
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Your application for <strong>{job.title}</strong> at{" "}
        <strong>{job.company.name}</strong> has been sent successfully. We'll
        notify you of any updates.
      </p>
      <div className="flex gap-3">
        <Link to="/applications" className="flex-1">
          <Button variant="secondary" size="lg" className="w-full">
            View applications
          </Button>
        </Link>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={onClose}
        >
          Continue browsing
        </Button>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const JobDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    jobsApi
      .getBySlug(slug)
      .then((r) => {
        setJob(r.data);
        setSaved(r.data.is_saved);
      })
      .catch(() => navigate("/jobs"))
      .finally(() => setLoading(false));
  }, [slug]);

  // check if already applied
  useEffect(() => {
    if (!isAuthenticated || !job) return;
    applicationsApi
      .getMyApplications()
      .then((r) => {
        const apps = r.data.results || r.data;
        setAlreadyApplied(apps.some((a) => a.job.slug === slug));
      })
      .catch(() => {});
  }, [job, isAuthenticated]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const r = await jobsApi.toggleSave(slug);
      setSaved(r.data.saved);
    } catch {}
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.role === "recruiter") return;
    setShowApply(true);
  };

  const handleApplySuccess = () => {
    setShowApply(false);
    setShowSuccess(true);
    setAlreadyApplied(true);
    setJob((prev) => ({
      ...prev,
      applications_count: (prev.applications_count || 0) + 1,
    }));
  };

  const salary =
    job?.salary_min && job?.salary_max
      ? `₹${(job.salary_min / 100000).toFixed(1)}–${(job.salary_max / 100000).toFixed(1)} LPA`
      : job?.salary_min
        ? `₹${(job.salary_min / 100000).toFixed(1)}+ LPA`
        : null;

  const isRecruiter = user?.role === "recruiter";

  if (loading)
    return (
      <div className="page-container py-6 sm:py-8">
        <JobDetailSkeleton />
      </div>
    );

  if (!job) return null;

  return (
    <>
      {/* Modals */}
      {showApply && (
        <ApplyModal
          job={job}
          onClose={() => setShowApply(false)}
          onSuccess={handleApplySuccess}
        />
      )}
      {showSuccess && (
        <SuccessModal job={job} onClose={() => setShowSuccess(false)} />
      )}

      <div className="page-container py-6 sm:py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-secondary)")
          }
        >
          <ArrowLeft size={15} /> Back to jobs
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Job header card */}
            <div className="card p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Company logo */}
                <div
                  className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center
                  justify-center text-lg font-bold overflow-hidden"
                  style={{
                    background: "var(--primary-light)",
                    color: "var(--primary-text)",
                  }}
                >
                  {job.company.logo ? (
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    job.company.name?.[0]
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {job.title}
                      </h1>
                      <Link
                        to={`/companies/${job.company.id}`}
                        className="text-sm font-medium mt-1 hover:underline inline-block"
                        style={{ color: "var(--primary)" }}
                      >
                        {job.company.name}
                      </Link>
                    </div>

                    {/* Save + Share */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={handleSave}
                        className="btn btn-secondary btn-sm w-9 h-9 p-0"
                      >
                        {saved ? (
                          <BookmarkCheck
                            size={15}
                            style={{ color: "var(--primary)" }}
                          />
                        ) : (
                          <Bookmark size={15} />
                        )}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm w-9 h-9 p-0"
                        onClick={() =>
                          navigator.clipboard?.writeText(window.location.href)
                        }
                      >
                        <Share2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div
                    className="flex flex-wrap gap-4 mt-4 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin
                        size={14}
                        style={{ color: "var(--text-muted)" }}
                      />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase
                        size={14}
                        style={{ color: "var(--text-muted)" }}
                      />
                      {job.job_type.replace(/_/g, " ")}
                    </span>
                    {salary && (
                      <span className="flex items-center gap-1.5">
                        <TrendingUp
                          size={14}
                          style={{ color: "var(--text-muted)" }}
                        />
                        {salary}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users size={14} style={{ color: "var(--text-muted)" }} />
                      {job.applications_count} applicants
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
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
                      {job.experience_level.replace(/_/g, " ")}
                    </Badge>
                    {job.is_featured && (
                      <Badge variant="primary">Featured</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <JobSection title="About the role">
              <Prose content={job.description} />
            </JobSection>

            {job.responsibilities && (
              <JobSection title="Responsibilities">
                <Prose content={job.responsibilities} />
              </JobSection>
            )}

            {job.requirements && (
              <JobSection title="Requirements">
                <Prose content={job.requirements} />
              </JobSection>
            )}

            {/* Skills */}
            {job.skills_required?.length > 0 && (
              <JobSection title="Skills required">
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg"
                      style={{
                        background: "var(--primary-light)",
                        color: "var(--primary-text)",
                      }}
                    >
                      <CheckCircle2 size={13} />
                      {s}
                    </span>
                  ))}
                </div>
              </JobSection>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
            <div className="card p-5 sticky top-24">
              {/* Apply button */}
              {!isRecruiter &&
                (alreadyApplied ? (
                  <div
                    className="flex items-center justify-center gap-2 w-full py-3
                    rounded-xl text-sm font-semibold mb-3"
                    style={{
                      background: "var(--success-light)",
                      color: "var(--success)",
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Already applied
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full mb-3"
                    onClick={handleApplyClick}
                  >
                    Apply now
                  </Button>
                ))}

              {/* Save button */}
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={handleSave}
              >
                {saved ? "Saved ✓" : "Save job"}
              </Button>

              {/* Job meta */}
              <div
                className="mt-5 space-y-3 pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <MetaRow
                  label="Posted"
                  value={new Date(job.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                />
                {job.expires_at && (
                  <MetaRow
                    label="Deadline"
                    value={new Date(job.expires_at).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  />
                )}
                <MetaRow
                  label="Views"
                  value={job.views_count.toLocaleString()}
                />
                <MetaRow
                  label="Applicants"
                  value={job.applications_count.toLocaleString()}
                />
              </div>
            </div>

            {/* Company card */}
            <div className="card p-5">
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                About company
              </p>
              <p
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {job.company.name}
              </p>
              {job.company.industry && (
                <p
                  className="text-sm mt-0.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {job.company.industry}
                </p>
              )}
              <Link
                to={`/companies/${job.company.id}`}
                className="text-xs font-medium mt-3 inline-block hover:underline"
                style={{ color: "var(--primary)" }}
              >
                View company →
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile sticky apply bar */}
        {!isRecruiter && (
          <div
            className="fixed bottom-0 left-0 right-0 lg:hidden p-4"
            style={{
              background: "var(--surface)",
              borderTop: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {alreadyApplied ? (
              <div
                className="flex items-center justify-center gap-2 w-full py-3
                rounded-xl text-sm font-semibold"
                style={{
                  background: "var(--success-light)",
                  color: "var(--success)",
                }}
              >
                <CheckCircle2 size={16} />
                Already applied
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleApplyClick}
              >
                Apply now
              </Button>
            )}
          </div>
        )}

        {/* Padding for mobile bar */}
        {!isRecruiter && <div className="h-24 lg:hidden" />}
      </div>
    </>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const JobSection = ({ title, children }) => (
  <div className="card p-5 sm:p-6">
    <h2
      className="text-base font-bold mb-4"
      style={{ color: "var(--text-primary)" }}
    >
      {title}
    </h2>
    {children}
  </div>
);

const Prose = ({ content }) => (
  <div
    className="text-sm leading-7 whitespace-pre-line"
    style={{ color: "var(--text-secondary)" }}
  >
    {content}
  </div>
);

const MetaRow = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm">
    <span style={{ color: "var(--text-muted)" }}>{label}</span>
    <span style={{ color: "var(--text-primary)" }}>{value}</span>
  </div>
);

export default JobDetailPage;
