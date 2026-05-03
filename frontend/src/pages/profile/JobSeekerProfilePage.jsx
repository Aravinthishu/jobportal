import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Input,
  Textarea,
  Spinner,
  ProfileSkeleton,
  Avatar,
  PageHeader,
  TabBar,
  useToast,
} from "../../components/ui";
import { profileApi } from "../../api/profile";
import ResumeSection from "../../components/profile/ResumeSection";
import EducationSection from "../../components/profile/EducationSection";
import ExperienceSection from "../../components/profile/ExperienceSection";
import {
  Camera,
  Plus,
  X,
  Save,
  Lock,
  User,
  Briefcase,
  GraduationCap,
  FileText,
  TrendingUp,
} from "lucide-react";

const TABS = [
  { key: "basic", label: "Basic Info", icon: User },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "resume", label: "Resumes", icon: FileText },
  { key: "career", label: "Career", icon: TrendingUp },
  { key: "security", label: "Security", icon: Lock },
];

const JobSeekerProfilePage = () => {
  const [tab, setTab] = useState("basic");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const pwForm = useForm();

  useEffect(() => {
    profileApi
      .getJobseekerProfile()
      .then((r) => {
        setProfile(r.data);
        setSkills(r.data.skills || []);
        setPhotoPreview(r.data.profile_photo || null);
        reset({
          full_name: r.data.full_name || "",
          phone: r.data.phone || "",
          headline: r.data.headline || "",
          summary: r.data.summary || "",
          location: r.data.location || "",
          experience_years: r.data.experience_years || 0,
          current_ctc: r.data.current_ctc || "",
          expected_ctc: r.data.expected_ctc || "",
          notice_period_days: r.data.notice_period_days || 30,
          linkedin_url: r.data.linkedin_url || "",
          github_url: r.data.github_url || "",
          portfolio_url: r.data.portfolio_url || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    setSaved(false);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v !== "" && fd.append(k, v));
      fd.append("skills", JSON.stringify(skills));
      if (photoFile) fd.append("profile_photo", photoFile);
      const res = await profileApi.updateJobseekerProfile(fd);
      setProfile(res.data);
      setSaved(true);
      toast("Profile saved successfully!", "success");
      setTimeout(() => setSaved(false), 3000);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setSaving(true);
    try {
      await profileApi.changePassword(data);
      pwForm.reset();
      toast("Password updated successfully!", "success");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const msg =
        err.response?.data?.old_password?.[0] || "Something went wrong";
      pwForm.setError("old_password", { message: msg });
      toast("Current password is incorrect.", "error");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };

  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  if (loading)
    return (
      <div className="page-container py-6 sm:py-8">
        <ProfileSkeleton />
      </div>
    );

  return (
    <div className="page-container py-6 sm:py-8">
      <PageHeader
        title="My Profile"
        subtitle={`Profile ${profile?.profile_completion || 0}% complete`}
        action={
          <Button
            variant="primary"
            size="md"
            loading={saving}
            onClick={handleSubmit(onSubmit)}
            className="gap-2"
          >
            <Save size={14} />
            {saved ? "Saved!" : "Save changes"}
          </Button>
        }
      />

      {/* Progress bar */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Profile completion
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--primary)" }}>
            {profile?.profile_completion || 0}%
          </p>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "var(--surface-2)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${profile?.profile_completion || 0}%`,
              background: "var(--primary)",
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-6">
        {tab === "basic" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Photo card */}
            <div className="card p-6 flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar
                  src={photoPreview}
                  name={profile?.full_name || "U"}
                  size="2xl"
                />
                <label
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full
                  flex items-center justify-center cursor-pointer transition-colors"
                  style={{ background: "var(--primary)" }}
                >
                  <Camera size={14} color="white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhoto}
                  />
                </label>
              </div>
              <div className="text-center">
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {profile?.full_name || "Your Name"}
                </p>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {profile?.headline || "Add a headline"}
                </p>
              </div>
              <div
                className="w-full pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>Experience</span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {profile?.experience_years || 0} yrs
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span style={{ color: "var(--text-muted)" }}>Location</span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {profile?.location || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 card p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full name"
                  placeholder="John Doe"
                  error={errors.full_name?.message}
                  {...register("full_name", { required: "Required" })}
                />
                <Input
                  label="Phone"
                  placeholder="+91 98765 43210"
                  {...register("phone")}
                />
              </div>
              <Input
                label="Headline"
                placeholder="Senior Frontend Developer at Acme Corp"
                {...register("headline")}
              />
              <Textarea
                label="Professional summary"
                placeholder="Tell recruiters about yourself..."
                rows={4}
                {...register("summary")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  placeholder="Chennai, Tamil Nadu"
                  {...register("location")}
                />
                <Input
                  label="Experience (years)"
                  type="number"
                  min="0"
                  {...register("experience_years")}
                />
              </div>

              {/* Skills */}
              <div>
                <label className="label">Skills</label>
                <div className="flex gap-2 mb-3">
                  <input
                    className="input flex-1"
                    placeholder="e.g. React, Python, SQL"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                  />
                  <Button variant="secondary" size="md" onClick={addSkill}>
                    <Plus size={14} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full"
                      style={{
                        background: "var(--primary-light)",
                        color: "var(--primary-text)",
                      }}
                    >
                      {s}
                      <button
                        onClick={() => removeSkill(s)}
                        className="hover:opacity-70"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Social links */}
              <div
                className="pt-2"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <p
                  className="text-sm font-semibold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Social links
                </p>
                <div className="space-y-3">
                  <Input
                    label="LinkedIn URL"
                    placeholder="https://linkedin.com/in/yourname"
                    {...register("linkedin_url")}
                  />
                  <Input
                    label="GitHub URL"
                    placeholder="https://github.com/yourname"
                    {...register("github_url")}
                  />
                  <Input
                    label="Portfolio URL"
                    placeholder="https://yoursite.com"
                    {...register("portfolio_url")}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "career" && (
          <div className="card p-6">
            <p
              className="text-sm font-semibold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Career preferences
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Current CTC (₹ LPA)"
                type="number"
                step="0.1"
                placeholder="e.g. 8.5"
                {...register("current_ctc")}
              />
              <Input
                label="Expected CTC (₹ LPA)"
                type="number"
                step="0.1"
                placeholder="e.g. 12"
                {...register("expected_ctc")}
              />
              <Input
                label="Notice period (days)"
                type="number"
                placeholder="30"
                {...register("notice_period_days")}
              />
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                size="md"
                loading={saving}
                onClick={handleSubmit(onSubmit)}
              >
                <Save size={14} /> Save changes
              </Button>
            </div>
          </div>
        )}

        {tab === "experience" && (
          <div className="card p-6">
            <ExperienceSection />
          </div>
        )}

        {tab === "education" && (
          <div className="card p-6">
            <EducationSection />
          </div>
        )}

        {tab === "resume" && (
          <div className="card p-6">
            <ResumeSection />
          </div>
        )}

        {tab === "security" && (
          <div className="card p-6 max-w-md">
            <p
              className="text-sm font-semibold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Change password
            </p>
            <form
              onSubmit={pwForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <Input
                label="Current password"
                type="password"
                error={pwForm.formState.errors.old_password?.message}
                {...pwForm.register("old_password", { required: "Required" })}
              />
              <Input
                label="New password"
                type="password"
                error={pwForm.formState.errors.new_password?.message}
                {...pwForm.register("new_password", {
                  required: "Required",
                  minLength: { value: 8, message: "Minimum 8 characters" },
                })}
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={saving}
              >
                Update password
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerProfilePage;
