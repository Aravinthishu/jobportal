import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GraduationCap, X, Save } from "lucide-react";
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

const YEARS = Array.from(
  { length: 50 },
  (_, i) => new Date().getFullYear() - i,
);

const EducationSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchItems = async () => {
    try {
      const r = await resumesApi.getEducation();
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
      institution: item.institution,
      degree: item.degree,
      field: item.field || "",
      grade: item.grade || "",
      start_year: item.start_year,
      end_year: item.end_year || "",
      is_current: item.is_current,
      description: item.description || "",
    });
    setShowForm(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await resumesApi.updateEducation(editing, data);
      } else {
        await resumesApi.addEducation(data);
      }
      toast(editing ? "Education updated!" : "Education added!", "success");
      setShowForm(false);
      fetchItems();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this education entry?")) return;
    await resumesApi.deleteEducation(id);
    toast("Education entry deleted", "info");
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

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
          Education
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
              {editing ? "Edit education" : "Add education"}
            </p>
            <button onClick={() => setShowForm(false)}>
              <X size={16} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Institution"
              placeholder="IIT Madras"
              error={errors.institution?.message}
              {...register("institution", { required: "Required" })}
            />
            <Input
              label="Degree"
              placeholder="B.Tech, MBA, M.Sc..."
              error={errors.degree?.message}
              {...register("degree", { required: "Required" })}
            />
            <Input
              label="Field of study"
              placeholder="Computer Science"
              {...register("field")}
            />
            <Input
              label="Grade / CGPA"
              placeholder="8.5 / 10"
              {...register("grade")}
            />
            <div>
              <label className="label">Start year</label>
              <select
                className="input"
                {...register("start_year", { required: true })}
              >
                <option value="">Select year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">End year</label>
              <select className="input" {...register("end_year")}>
                <option value="">Present / Pursuing</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Textarea
            label="Description (optional)"
            rows={2}
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
          <GraduationCap size={28} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            No education added yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-4 rounded-xl"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--primary-light)" }}
              >
                <GraduationCap size={16} style={{ color: "var(--primary)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.degree} {item.field && `in ${item.field}`}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.institution}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.start_year} — {item.end_year || "Present"}
                      {item.grade && ` · ${item.grade}`}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducationSection;
