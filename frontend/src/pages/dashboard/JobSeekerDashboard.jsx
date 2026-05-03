import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Bookmark, CheckCircle, ArrowRight,
  Briefcase, MapPin, Clock, Eye, Users,
  Search, Upload, AlertCircle, ChevronRight,
  Bell, TrendingUp, Star, Zap, Plus
} from 'lucide-react'
import {
  StatCard, Spinner, Badge, EmptyState,
  PageHeader, Skeleton, useToast
} from '../../components/ui'
import { applicationsApi } from '../../api/applications'
import { jobsApi } from '../../api/jobs'
import { resumesApi } from '../../api/resumes'
import { profileApi } from '../../api/profile'
import useAuthStore from '../../store/authStore'

const STATUS_CONFIG = {
  applied:      { label: 'Applied',      variant: 'neutral',  dot: '#9B9B9B' },
  viewed:       { label: 'Viewed',       variant: 'primary',  dot: '#0A66C2' },
  shortlisted:  { label: 'Shortlisted',  variant: 'success',  dot: '#057642' },
  interviewing: { label: 'Interviewing', variant: 'warning',  dot: '#B5600D' },
  offered:      { label: 'Offered',      variant: 'success',  dot: '#057642' },
  rejected:     { label: 'Rejected',     variant: 'danger',   dot: '#C0392B' },
}

const PIPELINE_STAGES = [
  { key: 'applied',      label: 'Applied',      color: '#9B9B9B' },
  { key: 'viewed',       label: 'Viewed',       color: '#0A66C2' },
  { key: 'shortlisted',  label: 'Shortlisted',  color: '#057642' },
  { key: 'interviewing', label: 'Interviewing', color: '#B5600D' },
  { key: 'offered',      label: 'Offered',      color: '#057642' },
  { key: 'rejected',     label: 'Rejected',     color: '#C0392B' },
]

export default function JobSeekerDashboard() {
  const { user }                      = useAuthStore()
  const { toast }                     = useToast()
  const [stats, setStats]             = useState(null)
  const [recentApps, setRecentApps]   = useState([])
  const [savedJobs, setSavedJobs]     = useState([])
  const [profile, setProfile]         = useState(null)
  const [resumes, setResumes]         = useState([])
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      applicationsApi.getStats(),
      applicationsApi.getMyApplications({ limit: 5 }),
      jobsApi.getSaved(),
      profileApi.getJobseekerProfile(),
      resumesApi.getAll(),
      jobsApi.getAll({ limit: 6, ordering: '-created_at' }),
    ]).then(([statsRes, appsRes, savedRes, profileRes, resumesRes, jobsRes]) => {
      setStats(statsRes.data)
      setRecentApps((appsRes.data.results ?? appsRes.data).slice(0, 5))
      setSavedJobs((savedRes.data.results ?? savedRes.data).slice(0, 4))
      setProfile(profileRes.data)
      setResumes(Array.isArray(resumesRes.data) ? resumesRes.data : (resumesRes.data.results ?? []))
      setRecommended((jobsRes.data.results ?? jobsRes.data).slice(0, 5))
    }).catch(() => toast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  const completion = profile?.profile_completion || 0
  const name       = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const hasPrimary = resumes.some(r => r.is_primary)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-container py-5 sm:py-6">

        {/* ── Profile hero card (LinkedIn-style) ── */}
        <div className="card mb-4 overflow-hidden animate-fade-in-up">
          {/* Banner */}
          <div className="profile-banner" />
          <div className="px-5 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
              style={{ marginTop: '-36px' }}>
              {/* Avatar */}
              <div className="flex items-end gap-4">
                <div
                  className="w-20 h-20 rounded-full border-4 flex items-center justify-center
                             text-2xl font-bold flex-shrink-0 overflow-hidden"
                  style={{
                    borderColor: 'var(--surface)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                  }}
                >
                  {profile?.profile_photo
                    ? <img src={profile.profile_photo} alt="" className="w-full h-full object-cover" />
                    : name[0]?.toUpperCase()
                  }
                </div>
                <div className="pb-1">
                  <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {profile?.full_name || name}
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {profile?.headline || 'Add a headline to your profile'}
                  </p>
                  {profile?.location && (
                    <p className="text-xs mt-0.5 flex items-center gap-1"
                      style={{ color: 'var(--text-muted)' }}>
                      <MapPin size={11} /> {profile.location}
                    </p>
                  )}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-2 pb-1">
                <Link to="/jobs" className="btn btn-primary btn-sm gap-1.5">
                  <Search size={13} /> Find jobs
                </Link>
                <Link to="/profile" className="btn btn-secondary btn-sm gap-1.5">
                  Edit profile
                </Link>
              </div>
            </div>

            {/* Skills pills */}
            {profile?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.skills.slice(0, 6).map((s, i) => (
                  <span key={i}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: 'var(--surface-2)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Profile completion alert ── */}
        {completion < 80 && (
          <div className="card mb-4 p-4 animate-fade-in-up"
            style={{ borderLeft: '4px solid var(--warning)', borderRadius: 'var(--radius-lg)' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--warning-light)' }}>
                  <AlertCircle size={16} style={{ color: 'var(--warning)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Complete your profile — {completion}% done
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Profiles with 100% completion get 3× more recruiter views
                  </p>
                  <div className="mt-2 h-1.5 w-40 rounded-full overflow-hidden"
                    style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${completion}%`, background: 'var(--warning)' }} />
                  </div>
                </div>
              </div>
              <Link to="/profile" className="btn btn-sm flex-shrink-0"
                style={{ background: 'var(--warning)', color: 'white', border: 'none' }}>
                Complete <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* ── Resume alert ── */}
        {!hasPrimary && (
          <div className="card mb-4 p-4 animate-fade-in-up"
            style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--primary-light)' }}>
                  <Upload size={15} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Upload your resume
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Required to apply to jobs and get discovered by recruiters
                  </p>
                </div>
              </div>
              <Link to="/profile" className="btn btn-primary btn-sm flex-shrink-0">
                Upload now
              </Link>
            </div>
          </div>
        )}

        {/* ── Main layout: 2-col ── */}
        <div className="flex flex-col lg:flex-row gap-4">

          {/* ── Left column (main) ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Applied',   value: stats?.total        || 0, icon: FileText,    color: 'var(--primary)'  },
                { label: 'Profile Views',   value: stats?.viewed       || 0, icon: Eye,         color: '#7C3AED'         },
                { label: 'Shortlisted',     value: stats?.shortlisted  || 0, icon: CheckCircle, color: 'var(--success)'  },
                { label: 'Offers',          value: stats?.offered      || 0, icon: Bell,        color: 'var(--warning)'  },
              ].map((s, i) => (
                <div key={s.label}
                  className={`card p-4 animate-fade-in-up`}
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

            {/* Application pipeline card */}
            <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Application pipeline
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Status of all your applications
                  </p>
                </div>
                <Link to="/applications"
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: 'var(--primary)' }}>
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {/* Pipeline funnel visual */}
              <div className="grid grid-cols-6 gap-1 mb-5">
                {PIPELINE_STAGES.map(stage => {
                  const count = stats?.[stage.key] || 0
                  const pct   = stats?.total ? Math.round((count / stats.total) * 100) : 0
                  return (
                    <div key={stage.key} className="flex flex-col items-center gap-1.5">
                      <div className="w-full rounded text-center py-1.5 text-sm font-bold"
                        style={{
                          background: count > 0 ? stage.color + '18' : 'var(--surface-2)',
                          color: count > 0 ? stage.color : 'var(--text-muted)',
                          border: `1px solid ${count > 0 ? stage.color + '40' : 'var(--border)'}`,
                          fontSize: 18,
                          fontWeight: 700,
                        }}>
                        {count}
                      </div>
                      <p className="text-center leading-tight"
                        style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {stage.label}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Recent applications list */}
              {recentApps.length === 0 ? (
                <div className="text-center py-5">
                  <Briefcase size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    No applications yet.{' '}
                    <Link to="/jobs" style={{ color: 'var(--primary)' }} className="font-semibold">
                      Browse jobs
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {recentApps.map(app => (
                    <ApplicationRow key={app.id} app={app} />
                  ))}
                </div>
              )}
            </div>

            {/* Recommended jobs */}
            <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Recommended for you
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Based on your profile and skills
                  </p>
                </div>
                <Link to="/jobs"
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: 'var(--primary)' }}>
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {recommended.length === 0 ? (
                <EmptyState icon={Briefcase} title="No recommendations yet"
                  subtitle="Complete your profile to get personalized job matches" />
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {recommended.map(job => (
                    <RecommendedJobRow key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column sidebar ── */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">

            {/* Profile strength */}
            <div className="card p-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Profile strength
              </h3>
              <div className="flex items-center gap-3 mb-3">
                {/* Circular progress */}
                <div className="relative flex-shrink-0" style={{ width: 52, height: 52 }}>
                  <svg width="52" height="52" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="22"
                      fill="none" stroke="var(--border)" strokeWidth="3"/>
                    <circle cx="26" cy="26" r="22"
                      fill="none" stroke="var(--primary)" strokeWidth="3"
                      strokeDasharray={`${completion * 1.382} ${100 * 1.382 - completion * 1.382}`}
                      strokeLinecap="round"
                      transform="rotate(-90 26 26)"
                      style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>
                      {completion}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {completion === 100 ? 'All Star' : completion >= 80 ? 'Intermediate' : 'Beginner'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {completion < 100
                      ? `Add ${100 - completion}% more to reach All Star`
                      : 'Your profile is complete!'}
                  </p>
                </div>
              </div>

              {/* Checklist items */}
              {[
                { label: 'Profile photo',      done: !!profile?.profile_photo },
                { label: 'Headline',           done: !!profile?.headline },
                { label: 'Skills added',       done: (profile?.skills?.length || 0) > 0 },
                { label: 'Resume uploaded',    done: hasPrimary },
                { label: 'Experience added',   done: !!profile?.experience_years },
              ].map(item => (
                <div key={item.label}
                  className="flex items-center gap-2.5 py-1.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: item.done ? 'var(--success-light)' : 'var(--surface-2)',
                      border: `1.5px solid ${item.done ? 'var(--success)' : 'var(--border-strong)'}`,
                    }}>
                    {item.done && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3 5.5L6.5 2.5" stroke="var(--success)"
                          strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-xs" style={{
                    color: item.done ? 'var(--text-secondary)' : 'var(--text-primary)',
                    textDecoration: item.done ? 'line-through' : 'none',
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}

              <Link to="/profile" className="btn btn-secondary btn-sm w-full mt-3">
                Improve profile
              </Link>
            </div>

            {/* Saved jobs */}
            <div className="card p-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Saved jobs
                </h3>
                <Link to="/saved-jobs"
                  className="text-xs font-semibold"
                  style={{ color: 'var(--primary)' }}>
                  View all
                </Link>
              </div>

              {savedJobs.length === 0 ? (
                <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>
                  No saved jobs yet
                </p>
              ) : (
                <div className="space-y-0.5">
                  {savedJobs.map(job => (
                    <Link key={job.id} to={`/jobs/${job.slug}`}
                      className="flex items-center gap-2.5 py-2.5 px-2 rounded-lg group transition-all"
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-xs
                                   font-bold flex-shrink-0 overflow-hidden"
                        style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {job.company?.logo
                          ? <img src={job.company.logo} alt="" className="w-full h-full object-cover" />
                          : job.company?.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate"
                          style={{ color: 'var(--text-primary)' }}>
                          {job.title}
                        </p>
                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {job.company?.name}
                        </p>
                      </div>
                      <ChevronRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="card p-4 animate-fade-in-up" style={{ animationDelay: '140ms' }}>
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Quick links
              </h3>
              <div className="space-y-0.5">
                {[
                  { label: 'Set job alerts',  to: '/alerts',    icon: Bell },
                  { label: 'Upload resume',   to: '/profile',   icon: Upload },
                  { label: 'Browse jobs',     to: '/jobs',      icon: Briefcase },
                  { label: 'Find companies',  to: '/companies', icon: Users },
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

const ApplicationRow = ({ app }) => {
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
  return (
    <Link to={`/jobs/${app.job.slug}`}
      className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all"
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div className="w-9 h-9 rounded flex-shrink-0 flex items-center justify-center
        text-xs font-bold overflow-hidden"
        style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
        {app.job.company?.logo
          ? <img src={app.job.company.logo} alt="" className="w-full h-full object-cover" />
          : app.job.company?.name?.[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {app.job.title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {app.job.company?.name} &middot;{' '}
          <Clock size={9} className="inline" />{' '}
          {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </div>
    </Link>
  )
}

const RecommendedJobRow = ({ job }) => {
  const salary = job.salary_min
    ? `₹${(job.salary_min/100000).toFixed(1)}${job.salary_max ? `–${(job.salary_max/100000).toFixed(1)}` : '+'} LPA`
    : null

  return (
    <Link to={`/jobs/${job.slug}`}
      className="flex items-start gap-3 py-4 transition-all group"
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      style={{ paddingLeft: 8, paddingRight: 8, borderRadius: 8, margin: '0 -8px' }}>
      <div className="w-10 h-10 rounded flex-shrink-0 flex items-center justify-center
        text-sm font-bold overflow-hidden border"
        style={{
          background: 'var(--surface-2)',
          color: 'var(--primary)',
          borderColor: 'var(--border)',
        }}>
        {job.company?.logo
          ? <img src={job.company.logo} alt="" className="w-full h-full object-cover" />
          : job.company?.name?.[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold group-hover:text-[var(--primary)] transition-colors"
          style={{ color: 'var(--text-primary)' }}>
          {job.title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {job.company?.name}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <MapPin size={10} /> {job.location}
          </span>
          {salary && (
            <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>
              {salary}
            </span>
          )}
          <Badge variant={job.work_mode === 'remote' ? 'success'
                        : job.work_mode === 'hybrid' ? 'warning' : 'neutral'}>
            {job.work_mode}
          </Badge>
        </div>
      </div>
      <div className="flex-shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
        {new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </div>
    </Link>
  )
}

const DashboardSkeleton = () => (
  <div className="page-container py-5 space-y-4">
    <div className="card overflow-hidden">
      <div className="profile-banner" />
      <div className="p-5">
        <div className="flex gap-4" style={{ marginTop: -36 }}>
          <div className="w-20 h-20 rounded-full skeleton flex-shrink-0" />
          <div className="space-y-2 pt-4">
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-4 w-56" />
          </div>
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
        <div className="card p-4"><div className="skeleton h-48" /></div>
        <div className="card p-4"><div className="skeleton h-36" /></div>
      </div>
    </div>
  </div>
)