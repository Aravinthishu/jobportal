import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, Users, FileText, Plus, ArrowRight,
  MapPin, Clock, ChevronRight, Eye, CheckCircle,
  Search, Building2, Bell, Zap, BarChart2,
  TrendingUp, UserCheck, AlertTriangle
} from 'lucide-react'
import {
  StatCard, Spinner, Badge, EmptyState,
  PageHeader, Skeleton, useToast
} from '../../components/ui'
import { applicationsApi } from '../../api/applications'
import { jobsApi } from '../../api/jobs'
import { companiesApi } from '../../api/companies'
import useAuthStore from '../../store/authStore'

const STATUS_CONFIG = {
  applied:      { label: 'Applied',      variant: 'neutral' },
  viewed:       { label: 'Viewed',       variant: 'primary' },
  shortlisted:  { label: 'Shortlisted',  variant: 'success' },
  interviewing: { label: 'Interviewing', variant: 'warning' },
  offered:      { label: 'Offered',      variant: 'success' },
  rejected:     { label: 'Rejected',     variant: 'danger'  },
}

const FUNNEL = [
  { key: 'new_applications', label: 'Received',    color: '#9B9B9B', pct: 100 },
  { key: 'shortlisted',      label: 'Shortlisted', color: '#0A66C2', pct: 65  },
  { key: 'interviewing',     label: 'Interviewing',color: '#B5600D', pct: 35  },
  { key: 'offered',          label: 'Offered',     color: '#057642', pct: 12  },
]

export default function RecruiterDashboard() {
  const { user }                    = useAuthStore()
  const { toast }                   = useToast()
  const [stats, setStats]           = useState(null)
  const [recentApps, setRecentApps] = useState([])
  const [myJobs, setMyJobs]         = useState([])
  const [companies, setCompanies]   = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      applicationsApi.getStats(),
      applicationsApi.getRecruiterApps({ limit: 8 }),
      jobsApi.getMine(),
      companiesApi.getMine(),
    ]).then(([statsRes, appsRes, jobsRes, companiesRes]) => {
      setStats(statsRes.data)
      setRecentApps((appsRes.data.results ?? appsRes.data).slice(0, 8))
      setMyJobs(jobsRes.data.results ?? jobsRes.data)
      setCompanies(companiesRes.data.results ?? companiesRes.data)
    }).catch(() => toast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <RecruiterSkeleton />

  const activeJobs = myJobs.filter(j => j.status === 'active')
  const draftJobs  = myJobs.filter(j => j.status === 'draft')
  const newApps    = recentApps.filter(a => a.status === 'applied')
  const hasCompany = companies.length > 0

  const companyName = companies[0]?.name || ''
  const companyLogo = companies[0]?.logo || null

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-container py-5 sm:py-6">

        {/* ── Recruiter hero card ── */}
        <div className="card mb-4 overflow-hidden animate-fade-in-up">
          <div className="profile-banner" style={{
            background: 'linear-gradient(135deg, #004182 0%, #0A66C2 60%, #7C3AED 100%)'
          }} />
          <div className="px-5 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
              style={{ marginTop: '-36px' }}>
              <div className="flex items-end gap-4">
                <div
                  className="w-20 h-20 rounded-lg border-4 flex items-center justify-center
                             text-xl font-bold flex-shrink-0 overflow-hidden"
                  style={{
                    borderColor: 'var(--surface)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                  }}
                >
                  {companyLogo
                    ? <img src={companyLogo} alt="" className="w-full h-full object-cover" />
                    : companyName?.[0] || <Building2 size={28} />
                  }
                </div>
                <div className="pb-1">
                  <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {companyName || user?.email?.split('@')[0] || 'Your Company'}
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {activeJobs.length} active position{activeJobs.length !== 1 ? 's' : ''} &middot;{' '}
                    {stats?.total_applications || 0} total applications
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pb-1">
                <Link to="/recruiter/candidates" className="btn btn-secondary btn-sm gap-1.5">
                  <Search size={13} /> Find candidates
                </Link>
                <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm gap-1.5">
                  <Plus size={13} /> Post job
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Alerts ── */}
        {!hasCompany && (
          <div className="card mb-4 p-4 animate-fade-in-up"
            style={{ borderLeft: '4px solid var(--warning)' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--warning-light)' }}>
                  <Building2 size={15} style={{ color: 'var(--warning)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Set up your company profile first
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Required before posting jobs
                  </p>
                </div>
              </div>
              <Link to="/recruiter/companies/new"
                className="btn btn-sm flex-shrink-0"
                style={{ background: 'var(--warning)', color: 'white', border: 'none' }}>
                Create company
              </Link>
            </div>
          </div>
        )}

        {draftJobs.length > 0 && (
          <div className="card mb-4 p-4 animate-fade-in-up"
            style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--primary-light)' }}>
                  <Zap size={15} style={{ color: 'var(--primary)' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {draftJobs.length} draft job{draftJobs.length > 1 ? 's' : ''} — publish to start receiving applications
                </p>
              </div>
              <Link to="/recruiter/jobs" className="btn btn-primary btn-sm flex-shrink-0">
                Review drafts
              </Link>
            </div>
          </div>
        )}

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Active Jobs',        value: activeJobs.length,              icon: Briefcase,  color: 'var(--primary)'  },
            { label: 'Total Applications', value: stats?.total_applications || 0, icon: FileText,   color: '#7C3AED'         },
            { label: 'New Applications',   value: stats?.new_applications   || 0, icon: Bell,       color: 'var(--warning)'  },
            { label: 'Shortlisted',        value: stats?.shortlisted        || 0, icon: UserCheck,  color: 'var(--success)'  },
          ].map((s, i) => (
            <div key={s.label}
              className="card p-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold animate-count-up"
                    style={{ color: s.color }}>
                    {s.value}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {s.label}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: s.color + '15' }}>
                  <s.icon size={15} style={{ color: s.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main 2-col layout ── */}
        <div className="flex flex-col lg:flex-row gap-4">

          {/* Left: Applications */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* New applications highlight */}
            {newApps.length > 0 && (
              <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--danger)', animation: 'pulse 2s infinite' }} />
                    <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      New applications ({newApps.length})
                    </h2>
                  </div>
                  <Link to="/recruiter/applications"
                    className="text-xs font-semibold"
                    style={{ color: 'var(--primary)' }}>
                    View all <ArrowRight size={11} className="inline" />
                  </Link>
                </div>
                <div className="space-y-0.5">
                  {newApps.slice(0, 4).map(app => (
                    <RecruiterAppRow key={app.id} app={app} highlight />
                  ))}
                </div>
              </div>
            )}

            {/* All recent applications */}
            <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Recent applications
                </h2>
                <Link to="/recruiter/applications"
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: 'var(--primary)' }}>
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              {recentApps.length === 0 ? (
                <EmptyState icon={Users} title="No applications yet"
                  subtitle="Post a job to start receiving applications" />
              ) : (
                <div className="space-y-0.5">
                  {recentApps.map(app => (
                    <RecruiterAppRow key={app.id} app={app} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">

            {/* Hiring funnel */}
            <div className="card p-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Hiring funnel
                </h3>
                <BarChart2 size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="space-y-3">
                {FUNNEL.map((stage, i) => {
                  const value = stats?.[stage.key] || 0
                  const total = stats?.new_applications || 1
                  const pct   = Math.round((value / total) * 100)
                  return (
                    <div key={stage.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {stage.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {pct}%
                          </span>
                          <span className="text-xs font-bold" style={{ color: stage.color }}>
                            {value}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--surface-2)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${stage.pct}%`,
                            background: stage.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Job performance */}
            <div className="card p-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  My jobs
                </h3>
                <Link to="/recruiter/jobs"
                  className="text-xs font-semibold"
                  style={{ color: 'var(--primary)' }}>
                  Manage
                </Link>
              </div>

              {myJobs.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    No jobs posted yet
                  </p>
                  <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm">
                    Post first job
                  </Link>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {myJobs.slice(0, 5).map(job => (
                    <div key={job.id}
                      className="flex items-center gap-2.5 py-2.5 px-2 rounded-lg transition-all"
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate"
                          style={{ color: 'var(--text-primary)' }}>
                          {job.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {job.applications_count} applied &middot; {job.views_count} views
                        </p>
                      </div>
                      <Badge variant={job.status === 'active' ? 'success' : 'neutral'}>
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/recruiter/jobs/new"
                className="btn btn-secondary btn-sm w-full mt-3 gap-1.5">
                <Plus size={13} /> Post new job
              </Link>
            </div>

            {/* Quick actions */}
            <div className="card p-4 animate-fade-in-up" style={{ animationDelay: '140ms' }}>
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Quick actions
              </h3>
              <div className="space-y-0.5">
                {[
                  { label: 'Post a new job',        to: '/recruiter/jobs/new',      icon: Plus      },
                  { label: 'Search candidates',     to: '/recruiter/candidates',    icon: Search    },
                  { label: 'View applications',     to: '/recruiter/applications',  icon: FileText  },
                  { label: 'Manage companies',      to: '/recruiter/companies',     icon: Building2 },
                  { label: 'My profile',            to: '/recruiter/profile',       icon: Users     },
                ].map(link => (
                  <Link key={link.label} to={link.to}
                    className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-xs
                               font-medium transition-all"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--primary-light)'
                      e.currentTarget.style.color      = 'var(--primary)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color      = 'var(--text-secondary)'
                    }}>
                    <link.icon size={14} />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

const RecruiterAppRow = ({ app, highlight = false }) => {
  const cfg       = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
  const candidateId = app.applicant_id || app.applicant?.id || app.applicant

  return (
    <Link to={`/recruiter/candidates/${candidateId}`}
      className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all"
      style={highlight ? { background: 'var(--primary-light)' } : {}}
      onMouseEnter={e => e.currentTarget.style.background = highlight
        ? 'var(--surface-3)' : 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = highlight
        ? 'var(--primary-light)' : 'transparent'}>
      <div
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center
                   text-sm font-bold"
        style={{ background: 'var(--surface-2)', color: 'var(--primary)', border: '1.5px solid var(--border)' }}>
        {app.applicant_profile?.profile_photo
          ? <img src={app.applicant_profile.profile_photo} alt=""
              className="w-full h-full object-cover rounded-full" />
          : app.applicant_name?.[0]?.toUpperCase() || '?'
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {app.applicant_name}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
          {app.job?.title} &middot;{' '}
          {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
      </div>
      <Badge variant={cfg.variant}>{cfg.label}</Badge>
    </Link>
  )
}

const RecruiterSkeleton = () => (
  <div className="page-container py-5 space-y-4">
    <div className="card overflow-hidden">
      <div className="h-24 skeleton" style={{ borderRadius: '10px 10px 0 0' }} />
      <div className="p-5 flex gap-4" style={{ marginTop: -36 }}>
        <div className="w-20 h-20 rounded-lg skeleton flex-shrink-0" />
        <div className="space-y-2 pt-4">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-4 w-56" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1,2,3,4].map(i => <div key={i} className="card p-4"><div className="skeleton h-14" /></div>)}
    </div>
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 space-y-4">
        <div className="card p-5"><div className="skeleton h-48" /></div>
        <div className="card p-5"><div className="skeleton h-64" /></div>
      </div>
      <div className="w-full lg:w-72 space-y-4">
        <div className="card p-4"><div className="skeleton h-40" /></div>
        <div className="card p-4"><div className="skeleton h-52" /></div>
      </div>
    </div>
  </div>
)