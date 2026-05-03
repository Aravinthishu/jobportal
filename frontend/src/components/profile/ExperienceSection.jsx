import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Briefcase, X, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Button,
  Input,
  Textarea,
  Spinner,
  useToast,
  TimelineSkeleton,
} from "../ui";
import { resumesApi } from "../../api/resumes";

const ExperienceSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  const isCurrent = watch("is_current");

  const fetchItems = async () => {
    try {
      const r = await resumesApi.getExperience();
      // handle both paginated {results:[]} and plain array responses
      setItems(Array.isArray(r.data) ? r.data : (r.data.results ?? []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAdd = () => {
    reset({});
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item.id);
    reset({
      company_name: item.company_name,
      designation: item.designation,
      location: item.location || "",
      start_date: item.start_date,
      end_date: item.end_date || "",
      is_current: item.is_current,
      description: item.description || "",
    });
    setShowForm(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    const payload = {
      ...data,
      end_date: data.is_current ? null : data.end_date || null,
    };
    try {
      if (editing) {
        await resumesApi.updateExperience(editing, payload);
      } else {
        await resumesApi.addExperience(payload);
      }
      toast(editing ? "Experience updated!" : "Experience added!", "success");
      setShowForm(false);
      fetchItems();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this experience?")) return;
    await resumesApi.deleteExperience(id);
    toast("Experience deleted", "info");
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        })
      : "Present";

  if (loading)
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <TimelineSkeleton key={i} />
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
          Work experience
        </p>
        <Button variant="secondary" size="sm" onClick={openAdd}>
          <Plus size={13} /> Add
        </Button>
      </div>

      {showForm && (
        <div
          className="p-4 rounded-xl mb-4 space-y-3"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {editing ? "Edit experience" : "Add experience"}
            </p>
            <button onClick={() => setShowForm(false)}>
              <X size={16} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Company name"
              placeholder="Google, TCS, Startup..."
              error={errors.company_name?.message}
              {...register("company_name", { required: "Required" })}
            />
            <Input
              label="Designation"
              placeholder="Software Engineer, Manager..."
              error={errors.designation?.message}
              {...register("designation", { required: "Required" })}
            />
            <Input
              label="Location"
              placeholder="Chennai, Remote..."
              {...register("location")}
            />
            <div className="flex items-center gap-2 self-end pb-1">
              <input
                type="checkbox"
                id="is_current"
                {...register("is_current")}
                className="w-4 h-4"
              />
              <label
                htmlFor="is_current"
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                I currently work here
              </label>
            </div>
            <Input
              label="Start date"
              type="date"
              error={errors.start_date?.message}
              {...register("start_date", { required: "Required" })}
            />
            {!isCurrent && (
              <Input label="End date" type="date" {...register("end_date")} />
            )}
          </div>
          <Textarea
            label="Description"
            rows={3}
            placeholder="Describe your responsibilities and achievements..."
            {...register("description")}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={handleSubmit(onSubmit)}
            >
              <Save size={13} /> Save
            </Button>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Briefcase size={28} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            No experience added yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id}>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <Briefcase size={16} style={{ color: "var(--primary)" }} />
                  </div>
                  {idx < items.length - 1 && (
                    <div
                      className="w-px flex-1 mt-2"
                      style={{ background: "var(--border)", minHeight: "16px" }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.designation}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.company_name}
                        {item.location && ` · ${item.location}`}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatDate(item.start_date)} —{" "}
                        {item.is_current
                          ? "Present"
                          : formatDate(item.end_date)}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEdit(item)}
                        className="btn btn-ghost btn-sm w-7 h-7 p-0"
                      >
                        <Pencil
                          size={12}
                          style={{ color: "var(--text-muted)" }}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-ghost btn-sm w-7 h-7 p-0"
                      >
                        <Trash2 size={12} style={{ color: "var(--danger)" }} />
                      </button>
                    </div>
                  </div>
                  {item.description && (
                    <p
                      className="text-xs mt-2 leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceSection;
