import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Globe,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  Building2,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import {
  Badge,
  Button,
  Spinner,
  EmptyState,
  JobCardSkeleton,
  Skeleton,
} from "../../components/ui";
import { companiesApi } from "../../api/companies";
import { jobsApi } from "../../api/jobs";

const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    companiesApi
      .getById(id)
      .then((r) => setCompany(r.data))
      .catch(() => navigate("/companies"))
      .finally(() => setLoading(false));

    jobsApi
      .getAll({ company: id, status: "active" })
      .then((r) => setJobs(r.data.results || r.data))
      .finally(() => setLoadingJobs(false));
  }, [id]);

  if (loading)
    return (
      <div className="page-container py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-5">
            <div className="card p-6 sm:p-8 space-y-4">
              <div className="flex gap-5">
                <Skeleton width="80px" height="80px" rounded="2xl" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton height="24px" width="60%" />
                  <Skeleton height="14px" width="35%" />
                  <div className="flex gap-4 pt-1">
                    <Skeleton height="12px" width="80px" />
                    <Skeleton height="12px" width="80px" />
                    <Skeleton height="12px" width="80px" />
                  </div>
                </div>
              </div>
              <Skeleton height="12px" />
              <Skeleton height="12px" width="90%" />
              <Skeleton height="12px" width="75%" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-72 space-y-4">
            <div className="card p-5 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex justify-between py-1">
                  <Skeleton height="12px" width="35%" />
                  <Skeleton height="12px" width="40%" />
                </div>
              ))}
              <Skeleton height="40px" rounded="xl" className="mt-3" />
            </div>
          </div>
        </div>
      </div>
    );

  if (!company) return null;

  return (
    <div className="page-container py-6 sm:py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors font-medium"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--text-secondary)")
        }
      >
        <ArrowLeft size={15} /> Back to companies
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Company header */}
          <div className="card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-5">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden flex items-center
                justify-center text-3xl font-bold flex-shrink-0"
                style={{
                  background: "var(--primary-light)",
                  color: "var(--primary-text)",
                }}
              >
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  company.name?.[0]
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-3 justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1
                        className="text-2xl font-bold"
                        style={{
                          color: "var(--text-primary)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {company.name}
                      </h1>
                      {company.is_verified && (
                        <CheckCircle
                          size={18}
                          style={{ color: "var(--primary)" }}
                        />
                      )}
                    </div>
                    {company.industry && (
                      <p
                        className="text-sm mt-1 font-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {company.industry}
                      </p>
                    )}
                  </div>
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noreferrer">
                      <Button variant="secondary" size="md" className="gap-2">
                        <Globe size={14} /> Visit website
                        <ExternalLink size={12} />
                      </Button>
                    </a>
                  )}
                </div>

                {/* Company meta */}
                <div className="flex flex-wrap gap-5 mt-4">
                  {company.headquarters && (
                    <span
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <MapPin
                        size={14}
                        style={{ color: "var(--text-muted)" }}
                      />
                      {company.headquarters}
                    </span>
                  )}
                  {company.size && (
                    <span
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Users size={14} style={{ color: "var(--text-muted)" }} />
                      {company.size} employees
                    </span>
                  )}
                  {company.founded_year && (
                    <span
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Calendar
                        size={14}
                        style={{ color: "var(--text-muted)" }}
                      />
                      Founded {company.founded_year}
                    </span>
                  )}
                  <span
                    className="flex items-center gap-1.5 text-sm"
                    style={{ color: "var(--primary)" }}
                  >
                    <Briefcase size={14} />
                    {jobs.length} open roles
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {company.description && (
              <div
                className="mt-6 pt-6"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <h2
                  className="text-sm font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  About {company.name}
                </h2>
                <p
                  className="text-sm leading-7 whitespace-pre-line"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {company.description}
                </p>
              </div>
            )}
          </div>

          {/* Open positions */}
          <div>
            <h2
              className="text-base font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Open positions at {company.name}
            </h2>

            {loadingJobs ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No open positions"
                subtitle="This company has no active job postings right now"
              />
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <CompanyJobRow key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
          <div className="card p-5 sticky top-24">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: "var(--text-muted)" }}
            >
              Company overview
            </p>
            <div className="space-y-3">
              {[
                { label: "Industry", value: company.industry },
                {
                  label: "Size",
                  value: company.size ? `${company.size} employees` : null,
                },
                { label: "Founded", value: company.founded_year },
                { label: "Location", value: company.headquarters },
                { label: "Open roles", value: `${jobs.length} positions` },
                {
                  label: "Status",
                  value: company.is_verified ? "Verified ✓" : "Unverified",
                },
              ]
                .filter((r) => r.value)
                .map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center py-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {row.label}
                    </span>
                    <span
                      className="text-xs font-semibold text-right max-w-[60%]"
                      style={{
                        color:
                          row.label === "Status" && company.is_verified
                            ? "var(--success)"
                            : "var(--text-primary)",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
            </div>

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-md w-full mt-5 gap-2"
              >
                <Globe size={14} /> Visit website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CompanyJobRow = ({ job }) => {
  const salary =
    job.salary_min && job.salary_max
      ? `₹${(job.salary_min / 100000).toFixed(1)}–${(job.salary_max / 100000).toFixed(1)} LPA`
      : null;

  return (
    <Link
      to={`/jobs/${job.slug}`}
      className="card card-glow p-4 sm:p-5 flex items-center gap-4 block"
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3
            className="font-bold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {job.title}
          </h3>
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
        </div>
        <div
          className="flex flex-wrap gap-4 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="flex items-center gap-1">
            <MapPin size={10} /> {job.location}
          </span>
          <span>{job.job_type?.replace("_", " ")}</span>
          {salary && (
            <span className="font-bold" style={{ color: "var(--primary)" }}>
              {salary}
            </span>
          )}
        </div>
      </div>
      <Button variant="primary" size="sm" className="flex-shrink-0">
        Apply
      </Button>
    </Link>
  );
};

export default CompanyDetailPage;
