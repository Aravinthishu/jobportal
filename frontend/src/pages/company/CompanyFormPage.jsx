import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Camera, ArrowLeft } from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Select,
  Spinner,
  PageHeader,
  useToast,
  Skeleton,
} from "../../components/ui";
import { companiesApi } from "../../api/companies";

const SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"];
const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Media",
  "Consulting",
  "Real Estate",
  "Other",
];

const CompanyFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!isEdit) return;
    companiesApi
      .getById(id)
      .then((r) => {
        setLogoPreview(r.data.logo || null);
        reset({
          name: r.data.name || "",
          website: r.data.website || "",
          industry: r.data.industry || "",
          size: r.data.size || "",
          description: r.data.description || "",
          founded_year: r.data.founded_year || "",
          headquarters: r.data.headquarters || "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v !== "" && fd.append(k, v));
      if (logoFile) fd.append("logo", logoFile);
      if (isEdit) {
        await companiesApi.update(id, fd);
      } else {
        await companiesApi.create(fd);
      }
      toast(isEdit ? "Company updated!" : "Company created!", "success");
      navigate("/recruiter/companies");
    } catch (err) {
      const errors = err.response?.data;

      if (errors && typeof errors === "object") {
        Object.entries(errors).forEach(([field, messages]) => {
          toast(`${field}: ${messages[0]}`, "error");
        });
      } else {
        toast("An error occurred", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  if (loading)
    return (
      <div className="page-container py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 space-y-4">
            <Skeleton
              width="96px"
              height="96px"
              rounded="2xl"
              className="mx-auto"
            />
            <Skeleton height="36px" rounded="xl" />
          </div>
          <div className="lg:col-span-2 card p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton height="42px" rounded="xl" />
              <Skeleton height="42px" rounded="xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton height="42px" rounded="xl" />
              <Skeleton height="42px" rounded="xl" />
            </div>
            <Skeleton height="100px" rounded="xl" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="page-container py-6 sm:py-8">
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
        <ArrowLeft size={15} /> Back
      </button>

      <PageHeader
        title={isEdit ? "Edit Company" : "Add Company"}
        subtitle={
          isEdit ? "Update your company details" : "Create your company profile"
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logo upload */}
        <div className="card p-6 flex flex-col items-center gap-4 h-fit">
          <div
            className="w-24 h-24 rounded-2xl overflow-hidden flex items-center
            justify-center text-2xl font-bold"
            style={{
              background: "var(--primary-light)",
              color: "var(--primary-text)",
            }}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              "?"
            )}
          </div>
          <label className="btn btn-secondary btn-sm cursor-pointer">
            <Camera size={14} /> Upload logo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogo}
            />
          </label>
          <p
            className="text-xs text-center"
            style={{ color: "var(--text-muted)" }}
          >
            PNG, JPG up to 2MB
          </p>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company name"
              error={errors.name?.message}
              {...register("name", { required: "Company name is required" })}
            />
            <Input
              label="Website"
              placeholder="https://company.com"
              {...register("website")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Industry" {...register("industry")}>
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
            <Select label="Company size" {...register("size")}>
              <option value="">Select size</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} employees
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Headquarters"
              placeholder="Chennai, India"
              {...register("headquarters")}
            />
            <Input
              label="Founded year"
              type="number"
              placeholder="2010"
              {...register("founded_year")}
            />
          </div>

          <Textarea
            label="Company description"
            placeholder="What does your company do?"
            rows={4}
            {...register("description")}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="md" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              onClick={handleSubmit(onSubmit)}
            >
              {isEdit ? "Save changes" : "Create company"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyFormPage;
