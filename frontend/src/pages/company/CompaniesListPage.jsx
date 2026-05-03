import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Building2, Globe, MapPin } from "lucide-react";
import {
  Button,
  Badge,
  Spinner,
  PageHeader,
  Avatar,
  CompanyCardSkeleton,
} from "../../components/ui";
import { companiesApi } from "../../api/companies";
import useAuthStore from "../../store/authStore";

const CompaniesListPage = () => {
  const { user } = useAuthStore();
  const isRecruiter = user?.role === "recruiter";
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = isRecruiter ? companiesApi.getMine : companiesApi.getAll;
    fetch()
      .then((r) => setCompanies(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CompanyCardSkeleton key={i} />
        ))}
      </div>
    );

  return (
    <div className="page-container py-6 sm:py-8">
      <PageHeader
        title={isRecruiter ? "My Companies" : "Companies"}
        subtitle={`${companies.length} ${isRecruiter ? "registered" : "total"} companies`}
        action={
          isRecruiter && (
            <Link to="/recruiter/companies/new">
              <Button variant="primary" size="md">
                <Plus size={14} /> Add company
              </Button>
            </Link>
          )
        }
      />

      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "var(--surface-2)" }}
          >
            <Building2 size={24} style={{ color: "var(--text-muted)" }} />
          </div>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>
            No companies yet
          </p>
          {isRecruiter && (
            <Link to="/recruiter/companies/new" className="mt-4">
              <Button variant="primary" size="md">
                Add your company
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {companies.map((c) => (
            <CompanyCard key={c.id} company={c} isRecruiter={isRecruiter} />
          ))}
        </div>
      )}
    </div>
  );
};

const CompanyCard = ({ company, isRecruiter }) => (
  <div className="card card-hover p-5">
    <div className="flex items-start gap-4">
      <Avatar src={company.logo} name={company.name} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-sm truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {company.name}
          </h3>
          {company.is_verified && <Badge variant="success">Verified</Badge>}
        </div>
        {company.industry && (
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            {company.industry}
          </p>
        )}
      </div>
    </div>

    <div className="mt-4 space-y-1.5">
      {company.headquarters && (
        <p
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <MapPin size={11} /> {company.headquarters}
        </p>
      )}
      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs hover:underline"
          style={{ color: "var(--primary)" }}
        >
          <Globe size={11} /> {company.website.replace(/https?:\/\//, "")}
        </a>
      )}
    </div>

    <div
      className="flex items-center justify-between mt-4 pt-3"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {company.job_count || 0} open jobs
      </span>
      <div className="flex gap-2">
        <Link to={`/companies/${company.id}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
        {isRecruiter && (
          <Link to={`/recruiter/companies/${company.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
        )}
      </div>
    </div>
  </div>
);

export default CompaniesListPage;
