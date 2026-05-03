import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save, Camera, Building2, User, Lock, Plus } from "lucide-react";
import {
  Button,
  Input,
  Spinner,
  Avatar,
  PageHeader,
  TabBar,
  useToast,
  ProfileSkeleton,
} from "../../components/ui";
import { profileApi } from "../../api/profile";
import { Link } from "react-router-dom";
import { companiesApi } from "../../api/companies";

const TABS = [
  { key: "profile", label: "My Profile", icon: User },
  { key: "company", label: "Company", icon: Building2 },
  { key: "security", label: "Security", icon: Lock },
];

const RecruiterProfilePage = () => {
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const pwForm = useForm();

  useEffect(() => {
    profileApi
      .getRecruiterProfile()
      .then((r) => {
        setProfile(r.data);
        setPhotoPreview(r.data.profile_photo || null);
        reset({
          full_name: r.data.full_name || "",
          phone: r.data.phone || "",
          designation: r.data.designation || "",
          linkedin_url: r.data.linkedin_url || "",
          profile_photo: r.data.profile_photo || "",
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
      if (photoFile) fd.append("profile_photo", photoFile);
      const res = await profileApi.updateRecruiterProfile(fd);
      setProfile(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast("Profile saved successfully!", "success");
    } catch {
      toast("Failed to save profile. Please check all fields.", "error");
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setSaving(true);
    try {
      await profileApi.changePassword(data);
      pwForm.reset();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast("Password updated!", "success");
    } catch (err) {
      const msg =
        err.response?.data?.old_password?.[0] || "Something went wrong";
      pwForm.setError("old_password", { message: msg });
      toast("Current password is incorrect.", "error");
    } finally {
      setSaving(false);
    }
  };

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
        subtitle="Manage your recruiter profile"
        action={
          tab !== "security" && (
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
          )
        }
      />

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-6">
        {tab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Photo */}
            <div className="card p-6 flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar
                  src={photoPreview}
                  name={profile?.full_name || "R"}
                  size="2xl"
                />
                <label
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full
                  flex items-center justify-center cursor-pointer"
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
                  {profile?.designation || "Add your designation"}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 card p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full name"
                  error={errors.full_name?.message}
                  {...register("full_name", { required: "Required" })}
                />
                <Input label="Phone" {...register("phone")} />
              </div>
              <Input
                label="Designation"
                placeholder="HR Manager, Talent Acquisition..."
                {...register("designation")}
              />
              <Input
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/yourname"
                {...register("linkedin_url")}
              />
            </div>
          </div>
        )}

        {tab === "company" && <CompanyTab />}

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

const CompanyTab = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesApi
      .getMine()
      .then((r) => setCompanies(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Your companies
        </p>
        <Link to="/recruiter/companies/new">
          <Button variant="primary" size="sm">
            <Plus size={13} /> Add company
          </Button>
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-10">
          <Building2
            size={28}
            style={{ color: "var(--text-muted)", margin: "0 auto" }}
          />
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            No companies yet
          </p>
          <Link to="/recruiter/companies/new" className="mt-4 inline-block">
            <Button variant="primary" size="sm">
              Add your company
            </Button>
          </Link>
        </div>
      ) : (
        companies.map((c) => (
          <div key={c.id} className="card p-4 flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl overflow-hidden flex items-center
              justify-center font-bold text-sm flex-shrink-0"
              style={{
                background: "var(--primary-light)",
                color: "var(--primary-text)",
              }}
            >
              {c.logo ? (
                <img
                  src={c.logo}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                c.name?.[0]
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-sm truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {c.name}
              </p>
              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                {c.industry}
                {c.headquarters && ` · ${c.headquarters}`}
              </p>
            </div>
            <Link to={`/recruiter/companies/${c.id}/edit`}>
              <Button variant="secondary" size="sm">
                Edit
              </Button>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default RecruiterProfilePage;
