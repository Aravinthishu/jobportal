import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  ExternalLink,
  Send,
  Globe,
  GitBranch,
  CircleFadingPlus,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Spinner,
  useToast,
  ProfileSkeleton,
} from "../../components/ui";
import { resumesApi } from "../../api/resumes";
import { jobsApi } from "../../api/jobs";
import { applicationsApi } from "../../api/applications";

const CandidateProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([resumesApi.getPublicProfile(userId), jobsApi.getMine()])
      .then(([profileRes, jobsRes]) => {
        setData(profileRes.data);
        setJobs(jobsRes.data.results || jobsRes.data);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSendInvite = async () => {
    if (!selectedJob) {
      alert("Select a job first.");
      return;
    }
    setSending(true);
    try {
      await applicationsApi.sendInvite({
        candidate_id: userId,
        job_id: selectedJob,
        message: inviteMsg,
      });
      setShowInvite(false);
      toast("Invitation sent successfully! 📨", "success");
    } catch (err) {
      toast(err.response?.data?.error || "Failed to send invite.", "error");
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return (
      <div className="page-container py-6 sm:py-8">
        <ProfileSkeleton />
      </div>
    );

  if (!data) return null;

  const { profile, education, experience, resumes } = data;

  return (
    <div className="page-container py-6 sm:py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-6"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left — profile info */}
        <div className="flex-1 space-y-5">
          {/* Header card */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Avatar
                name={profile?.full_name || "U"}
                src={profile?.profile_photo}
                size="2xl"
              />
              <div className="flex-1">
                <h1
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {profile?.full_name}
                </h1>
                {profile?.headline && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {profile.headline}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 mt-3">
                  {profile?.location && (
                    <span
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <MapPin size={13} /> {profile.location}
                    </span>
                  )}
                  {profile?.experience_years !== undefined && (
                    <span
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Briefcase size={13} /> {profile.experience_years} yrs
                      experience
                    </span>
                  )}
                </div>

                {/* Social links */}
                <div className="flex gap-3 mt-3">
                  {profile?.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost btn-sm px-2 gap-1.5 text-xs"
                      style={{ color: "var(--primary)" }}
                    >
                      <CircleFadingPlus size={13} /> LinkedIn
                    </a>
                  )}
                  {profile?.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost btn-sm px-2 gap-1.5 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <GitBranch size={13} /> GitHub
                    </a>
                  )}
                  {profile?.portfolio_url && (
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost btn-sm px-2 gap-1.5 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Globe size={13} /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>

            {profile?.summary && (
              <div
                className="mt-5 pt-5"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {profile.summary}
                </p>
              </div>
            )}

            {/* Skills */}
            {profile?.skills?.length > 0 && (
              <div
                className="mt-5 pt-5"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wide mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span key={s} className="badge badge-primary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Experience */}
          {experience?.length > 0 && (
            <div className="card p-6">
              <p
                className="text-sm font-bold mb-5"
                style={{ color: "var(--text-primary)" }}
              >
                Work experience
              </p>
              <div className="space-y-5">
                {experience.map((exp, idx) => (
                  <div key={exp.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--primary-light)" }}
                      >
                        <Briefcase
                          size={14}
                          style={{ color: "var(--primary)" }}
                        />
                      </div>
                      {idx < experience.length - 1 && (
                        <div
                          className="w-px flex-1 mt-2"
                          style={{
                            background: "var(--border)",
                            minHeight: "20px",
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {exp.designation}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {exp.company_name}
                        {exp.location && ` · ${exp.location}`}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {new Date(exp.start_date).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        —{" "}
                        {exp.is_current
                          ? "Present"
                          : exp.end_date
                            ? new Date(exp.end_date).toLocaleDateString(
                                "en-IN",
                                { month: "short", year: "numeric" },
                              )
                            : "Present"}
                      </p>
                      {exp.description && (
                        <p
                          className="text-xs mt-2 leading-relaxed"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education?.length > 0 && (
            <div className="card p-6">
              <p
                className="text-sm font-bold mb-5"
                style={{ color: "var(--text-primary)" }}
              >
                Education
              </p>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--primary-light)" }}
                    >
                      <GraduationCap
                        size={14}
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {edu.degree}
                        {edu.field && ` in ${edu.field}`}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {edu.institution}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {edu.start_year} — {edu.end_year || "Present"}
                        {edu.grade && ` · ${edu.grade}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-full lg:w-72 xl:w-80 space-y-4">
          {/* Actions */}
          <div className="card p-5 sticky top-24">
            <Button
              variant="primary"
              size="lg"
              className="w-full gap-2"
              onClick={() => setShowInvite(!showInvite)}
            >
              <Send size={14} /> Send invitation
            </Button>

            {showInvite && (
              <div
                className="mt-4 space-y-3 pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <select
                  className="input text-sm"
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                >
                  <option value="">Select job to invite for</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
                <textarea
                  className="input resize-none text-sm"
                  rows={3}
                  placeholder="Personal message (optional)..."
                  value={inviteMsg}
                  onChange={(e) => setInviteMsg(e.target.value)}
                />
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  loading={sending}
                  onClick={handleSendInvite}
                >
                  Send invite
                </Button>
              </div>
            )}
          </div>

          {/* Resumes */}
          {resumes?.length > 0 && (
            <div className="card p-5">
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Resumes
              </p>
              <div className="space-y-2">
                {resumes.map((r) => (
                  <a
                    key={r.id}
                    href={r.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                    style={{ background: "var(--surface-2)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--primary-light)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "var(--surface-2)")
                    }
                  >
                    <FileText size={16} style={{ color: "var(--primary)" }} />
                    <span
                      className="text-sm flex-1 truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {r.title}
                    </span>
                    <ExternalLink
                      size={13}
                      style={{ color: "var(--text-muted)" }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
