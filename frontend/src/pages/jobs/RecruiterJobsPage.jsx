import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, MapPin, Users, Edit, Briefcase } from "lucide-react";
import {
  Badge,
  Button,
  Spinner,
  PageHeader,
  EmptyState,
  Skeleton,
} from "../../components/ui";
import { jobsApi } from "../../api/jobs";

const STATUS_COLOR = {
  active: "success",
  draft: "neutral",
  closed: "danger",
};

const RecruiterJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi
      .getMine()
      .then((r) => setJobs(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container py-6 sm:py-8">
      <PageHeader
        title="My Job Postings"
        subtitle={`${jobs.length} job${jobs.length !== 1 ? "s" : ""} posted`}
        action={
          <Link to="/recruiter/jobs/new">
            <Button variant="primary" size="md">
              <Plus size={14} /> Post a job
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 sm:p-5 flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton height="16px" width="200px" />
                  <Skeleton height="20px" width="60px" rounded="2xl" />
                </div>
                <div className="flex gap-4">
                  <Skeleton height="12px" width="80px" />
                  <Skeleton height="12px" width="60px" />
                  <Skeleton height="12px" width="80px" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton height="32px" width="100px" rounded="lg" />
                <Skeleton height="32px" width="60px" rounded="lg" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          subtitle="Post your first job to start receiving applications"
          action={
            <Link to="/recruiter/jobs/new">
              <Button variant="primary">Post first job</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

const JobRow = ({ job }) => (
  <div className="card p-4 sm:p-5">
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {job.title}
          </h3>
          <Badge variant={STATUS_COLOR[job.status] || "neutral"}>
            {job.status}
          </Badge>
          {job.is_featured && <Badge variant="primary">Featured</Badge>}
        </div>

        <div className="flex flex-wrap gap-4">
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <MapPin size={11} /> {job.location}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {job.job_type?.replace("_", " ")}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {job.work_mode}
          </span>
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <Users size={11} /> {job.applications_count} applicants
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link to={`/recruiter/applications?job=${job.id}`}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Users size={13} /> Applications
          </Button>
        </Link>
        <Link to={`/recruiter/jobs/${job.slug}/edit`}>
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Edit size={13} /> Edit
          </Button>
        </Link>
      </div>
    </div>
  </div>
);

export default RecruiterJobsPage;
