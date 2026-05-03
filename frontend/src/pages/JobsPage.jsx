import { useState, useEffect, useCallback } from "react";
import { Briefcase } from "lucide-react";
import JobCard from "../components/jobs/JobCard";
import JobFilters from "../components/jobs/JobFilters";
import { Spinner, JobCardSkeleton } from "../components/ui";
import { jobsApi } from "../api/jobs";
import Navbar from "../components/layout/Navbar";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, ...buildParams(filters) };
      const res = await jobsApi.getAll(params);
      setJobs(res.data.results || res.data);
      setTotal(res.data.count || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <>
      <div className="page-container py-6 sm:py-8">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="section-title">Browse Jobs</h1>
          <p className="section-subtitle">
            {total > 0
              ? `${total.toLocaleString()} jobs available`
              : "Find your next role"}
          </p>
        </div>

        <JobFilters filters={filters} onChange={setFilters} total={total} />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Grid — responsive columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onSaveToggle={fetchJobs} />
              ))}
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary btn-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span
                  className="text-sm px-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                  className="btn btn-secondary btn-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "var(--surface-2)" }}
      >
        <Briefcase size={24} style={{ color: "var(--text-muted)" }} />
      </div>
      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
        No jobs found
      </p>
      <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
        Try adjusting your filters or search terms
      </p>
    </div>
  );
}

function buildParams(filters) {
  const p = {};
  if (filters.search) p.search = filters.search;
  if (filters.location) p.location = filters.location;
  if (filters.job_type?.length) p.job_type = filters.job_type.join(",");
  if (filters.work_mode?.length) p.work_mode = filters.work_mode.join(",");
  if (filters.experience_level?.length)
    p.experience_level = filters.experience_level.join(",");
  return p;
}
