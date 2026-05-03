import { useState, useEffect } from "react";
import { X, FileText, Send } from "lucide-react";
import { Button, Textarea, Spinner, useToast, JobCardSkeleton  } from "../ui";
import { resumesApi } from "../../api/resumes";
import { applicationsApi } from "../../api/applications";

const ApplyModal = ({ job, onClose, onSuccess }) => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    resumesApi
      .getAll()
      .then((r) => {
        // handle both paginated {results:[]} and plain array responses
        const list = Array.isArray(r.data) ? r.data : (r.data.results ?? []);
        setResumes(list);
        const primary = list.find((resume) => resume.is_primary);
        if (primary) setSelectedResume(primary.id);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!selectedResume && resumes.length > 0) {
      setError("Please select a resume.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await applicationsApi.apply({
        job_id: job.id,
        cover_letter: coverLetter,
      });
      toast("Application submitted successfully! 🎉", "success");
      onSuccess();
    } catch (err) {
      const msg = err.response?.data;
      if (msg) setError(Object.values(msg).flat().join(" "));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)" }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>
              Apply for {job.title}
            </p>
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--text-secondary)" }}
            >
              {job.company.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm w-8 h-8 p-0 rounded-lg"
          >
            <X size={16} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {/* Resume selection */}
              <div>
                <label className="label">Select resume</label>
                {resumes.length === 0 ? (
                  <div
                    className="text-sm p-3 rounded-lg"
                    style={{
                      background: "var(--warning-light)",
                      color: "var(--warning)",
                    }}
                  >
                    No resumes uploaded.{" "}
                    <a href="/profile" className="font-medium underline">
                      Upload one first
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resumes.map((resume) => (
                      <label
                        key={resume.id}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                        style={{
                          background:
                            selectedResume === resume.id
                              ? "var(--primary-light)"
                              : "var(--surface-2)",
                          border: `1px solid ${
                            selectedResume === resume.id
                              ? "var(--primary)"
                              : "var(--border)"
                          }`,
                        }}
                      >
                        <input
                          type="radio"
                          name="resume"
                          value={resume.id}
                          checked={selectedResume === resume.id}
                          onChange={() => setSelectedResume(resume.id)}
                          className="hidden"
                        />
                        <FileText
                          size={16}
                          style={{
                            color:
                              selectedResume === resume.id
                                ? "var(--primary)"
                                : "var(--text-muted)",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {resume.title}
                          </p>
                          {resume.is_primary && (
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Primary resume
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover letter */}
              <Textarea
                label="Cover letter (optional)"
                placeholder={`Hi, I'm excited to apply for the ${job.title} role at ${job.company.name}...`}
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />

              {error && (
                <p
                  className="text-sm px-3 py-2 rounded-lg"
                  style={{
                    background: "var(--danger-light)",
                    color: "var(--danger)",
                  }}
                >
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            loading={submitting}
            disabled={resumes.length === 0}
            onClick={handleSubmit}
          >
            <Send size={14} /> Submit application
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
