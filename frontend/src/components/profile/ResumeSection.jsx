import { useState, useEffect } from "react";
import { Upload, Trash2, Star, FileText, CheckCircle } from "lucide-react";
import { Button, Spinner, useToast, Skeleton } from "../ui";
import { resumesApi } from "../../api/resumes";

const ResumeSection = () => {
  const toast = useToast();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchResumes = async () => {
    try {
      const r = await resumesApi.getAll();
      // handle both paginated {results:[]} and plain array responses
      setResumes(Array.isArray(r.data) ? r.data : (r.data.results ?? []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", file.name.replace(/\.[^/.]+$/, ""));
      await resumesApi.upload(fd);
      fetchResumes();
      toast("Resume uploaded successfully!", "success");
    } catch {
      toast("Failed to upload resume", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this resume?")) return;
    await resumesApi.delete(id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
    toast("Resume deleted", "info");
  };

  const handleSetPrimary = async (id) => {
    await resumesApi.setPrimary(id);
    setResumes((prev) => prev.map((r) => ({ ...r, is_primary: r.id === id })));
  };

  if (loading)
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "var(--surface-2)" }}
          >
            <Skeleton width="36px" height="36px" rounded="lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton height="13px" width="60%" />
              <Skeleton height="11px" width="40%" />
            </div>
            <Skeleton height="28px" width="48px" rounded="lg" />
          </div>
        ))}
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Resumes ({resumes.length}/5)
        </p>
        {resumes.length < 5 && (
          <label className="btn btn-secondary btn-sm cursor-pointer gap-1.5">
            {uploading ? <Spinner size="sm" /> : <Upload size={13} />}
            Upload resume
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {resumes.length === 0 ? (
        <label
          className="flex flex-col items-center justify-center p-8 rounded-xl
          border-2 border-dashed cursor-pointer transition-colors"
          style={{ borderColor: "var(--border-strong)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "var(--primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-strong)")
          }
        >
          <Upload size={24} style={{ color: "var(--text-muted)" }} />
          <p
            className="text-sm font-medium mt-2"
            style={{ color: "var(--text-primary)" }}
          >
            Upload your resume
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            PDF, DOC, DOCX — max 5MB
          </p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      ) : (
        <div className="space-y-2">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: resume.is_primary
                    ? "var(--primary-light)"
                    : "var(--surface)",
                  color: resume.is_primary
                    ? "var(--primary)"
                    : "var(--text-muted)",
                }}
              >
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {resume.title}
                  </p>
                  {resume.is_primary && (
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "var(--primary)" }}
                    >
                      <CheckCircle size={11} /> Primary
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {new Date(resume.uploaded_at).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!resume.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(resume.id)}
                    className="btn btn-ghost btn-sm px-2 gap-1 text-xs"
                    style={{ color: "var(--text-muted)" }}
                    title="Set as primary"
                  >
                    <Star size={13} />
                  </button>
                )}
                <a
                  href={resume.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost btn-sm px-2 text-xs"
                  style={{ color: "var(--primary)" }}
                >
                  View
                </a>
                <button
                  onClick={() => handleDelete(resume.id)}
                  className="btn btn-ghost btn-sm px-2"
                  style={{ color: "var(--danger)" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeSection;
