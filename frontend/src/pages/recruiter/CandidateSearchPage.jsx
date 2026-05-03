import { useState } from "react";
import { Search, MapPin, Send, User } from "lucide-react";
import {
  Button,
  Input,
  Badge,
  Avatar,
  Spinner,
  PageHeader,
  useToast,
  CandidateCardSkeleton,
} from "../../components/ui";
import { applicationsApi } from "../../api/applications";
import { jobsApi } from "../../api/jobs";
import { Link } from "react-router-dom";

const CandidateSearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    q: "",
    location: "",
    skills: "",
    exp_min: "",
  });
  const [inviting, setInviting] = useState(null);
  const [selectedJob, setSelectedJob] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [showInviteFor, setShowInviteFor] = useState(null);
  const { toast } = useToast();

  const fetchJobs = async () => {
    if (jobs.length) return;
    const r = await jobsApi.getMine();
    setJobs(r.data.results || r.data);
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = {};
      if (filters.q) params.q = filters.q;
      if (filters.location) params.location = filters.location;
      if (filters.skills) params.skills = filters.skills;
      if (filters.exp_min) params.exp_min = filters.exp_min;
      const r = await applicationsApi.searchCandidates(params);
      setResults(r.data);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (userId) => {
    if (!selectedJob) {
      alert("Please select a job first.");
      return;
    }
    setInviting(userId);
    try {
      await applicationsApi.sendInvite({
        candidate_id: userId,
        job_id: selectedJob,
        message: inviteMsg,
      });
      setShowInviteFor(null);
      setInviteMsg("");
      toast("Invitation sent successfully! 📨", "success");
    } catch (err) {
      toast(err.response?.data?.error || "Failed to send invite.", "error");
    } finally {
      setInviting(null);
    }
  };

  return (
    <div className="page-container py-6 sm:py-8">
      <PageHeader
        title="Search Candidates"
        subtitle="Find and invite the right talent for your roles"
      />

      {/* Search filters */}
      <div className="card p-5 mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Name or headline..."
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          />
          <Input
            placeholder="Location..."
            value={filters.location}
            onChange={(e) =>
              setFilters((f) => ({ ...f, location: e.target.value }))
            }
          />
          <Input
            placeholder="Skills (comma separated)..."
            value={filters.skills}
            onChange={(e) =>
              setFilters((f) => ({ ...f, skills: e.target.value }))
            }
          />
          <Input
            type="number"
            placeholder="Min experience (years)"
            value={filters.exp_min}
            onChange={(e) =>
              setFilters((f) => ({ ...f, exp_min: e.target.value }))
            }
          />
        </div>
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            loading={loading}
            onClick={handleSearch}
          >
            <Search size={14} /> Search candidates
          </Button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CandidateCardSkeleton key={i} />
          ))}
        </div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-16">
          <User
            size={32}
            style={{ color: "var(--text-muted)", margin: "0 auto" }}
          />
          <p
            className="mt-3 font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            No candidates found
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((candidate) => (
            <div key={candidate.user_id} className="card p-5">
              <div className="flex items-start gap-3 mb-4">
                <Avatar
                  name={candidate.full_name}
                  src={candidate.profile_photo}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {candidate.full_name}
                  </p>
                  {candidate.headline && (
                    <p
                      className="text-xs mt-0.5 line-clamp-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {candidate.headline}
                    </p>
                  )}
                  {candidate.location && (
                    <p
                      className="flex items-center gap-1 text-xs mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <MapPin size={10} /> {candidate.location}
                    </p>
                  )}
                </div>
              </div>

              {candidate.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {candidate.skills.slice(0, 4).map((s) => (
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

              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {candidate.experience_years} yrs exp
                </span>
                <div className="flex gap-2">
                  <Link to={`/recruiter/candidates/${candidate.user_id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setShowInviteFor(candidate.user_id);
                      fetchJobs();
                    }}
                  >
                    <Send size={12} /> Invite
                  </Button>
                </div>
              </div>

              {/* Inline invite form */}
              {showInviteFor === candidate.user_id && (
                <div
                  className="mt-4 pt-4 space-y-3"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <select
                    className="input text-sm"
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                  >
                    <option value="">Select a job to invite for</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className="input resize-none text-sm"
                    rows={3}
                    placeholder="Add a personal message (optional)..."
                    value={inviteMsg}
                    onChange={(e) => setInviteMsg(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowInviteFor(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      loading={inviting === candidate.user_id}
                      onClick={() => handleInvite(candidate.user_id)}
                    >
                      Send invite
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateSearchPage;
