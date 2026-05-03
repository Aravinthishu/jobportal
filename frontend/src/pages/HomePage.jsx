import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, MapPin, Briefcase, Users, TrendingUp, ArrowRight,
  CheckCircle, Zap, Globe, Building2, Code, Heart,
  DollarSign, GraduationCap, Star, Sparkles, ChevronRight
} from 'lucide-react'
import { Badge, Button, JobCardSkeleton } from '../components/ui'
import { jobsApi } from '../api/jobs'
import { companiesApi } from '../api/companies'
import Navbar from '../components/layout/Navbar'
import LandingNavbar from '../components/layout/LandingNavbar'
import useAuthStore from '../store/authStore'

const CATEGORIES = [
  { label: 'Engineering',   icon: Code,          color: '#059669', q: 'engineer'    },
  { label: 'Design',        icon: Sparkles,      color: '#6366F1', q: 'design'      },
  { label: 'Marketing',     icon: TrendingUp,    color: '#F59E0B', q: 'marketing'   },
  { label: 'Finance',       icon: DollarSign,    color: '#10B981', q: 'finance'     },
  { label: 'Healthcare',    icon: Heart,         color: '#EF4444', q: 'health'      },
  { label: 'Education',     icon: GraduationCap, color: '#8B5CF6', q: 'education'   },
  { label: 'Remote',        icon: Globe,         color: '#06B6D4', q: 'remote'      },
  { label: 'Management',    icon: Users,         color: '#F97316', q: 'manager'     },
]

const STATS = [
  { value: '50K+',  label: 'Active jobs'       },
  { value: '12K+',  label: 'Companies hiring'  },
  { value: '200K+', label: 'Job seekers'        },
  { value: '95%',   label: 'Placement rate'     },
]

const HomePage = () => {
  const navigate             = useNavigate()
  const { isAuthenticated }  = useAuthStore()
  const [search, setSearch]  = useState('')
  const [location, setLocation] = useState('')
  const [featuredJobs, setFeaturedJobs]     = useState([])
  const [companies, setCompanies]           = useState([])
  const [loadingJobs, setLoadingJobs]       = useState(true)
  const [loadingCompanies, setLoadingCompanies] = useState(true)

  useEffect(() => {
    jobsApi.getAll({ limit: 6, ordering: '-created_at' })
      .then(r => setFeaturedJobs(r.data.results || r.data))
      .finally(() => setLoadingJobs(false))

    companiesApi.getAll({ limit: 8 })
      .then(r => setCompanies(r.data.results || r.data))
      .finally(() => setLoadingCompanies(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search)   params.set('search', search)
    if (location) params.set('location', location)
    navigate(`/jobs?${params.toString()}`)
  }

  const handleCategory = (q) => {
    navigate(`/jobs?search=${q}`)
  }

  return (
    <div style={{ background: 'var(--bg)' }}>
      <LandingNavbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'var(--primary)' }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10 blur-3xl"
            style={{ background: 'var(--accent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
            style={{ background: 'var(--primary)' }} />
        </div>

        <div className="page-container relative">
          <div className="max-w-3xl mx-auto text-center">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              mb-6 animate-fade-in-up"
              style={{
                background: 'var(--primary-light)',
                border: '1px solid var(--border-strong)',
              }}>
              <Zap size={13} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--primary-text)' }}>
                India's fastest growing job portal
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight
              mb-6 animate-fade-in-up delay-100"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Find your{' '}
              <span className="text-gradient">dream job</span>
              <br />faster than ever
            </h1>

            <p className="text-base sm:text-lg mb-10 animate-fade-in-up delay-150 max-w-xl mx-auto"
              style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              Connect with top companies, discover opportunities that match your skills,
              and take the next step in your career journey.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch}
              className="animate-fade-in-up delay-200 mb-4">
              <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl shadow-xl max-w-2xl mx-auto"
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border-strong)',
                }}>
                <div className="flex items-center gap-3 flex-1 px-3">
                  <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <input
                    className="flex-1 text-sm font-medium outline-none bg-transparent py-2"
                    placeholder="Job title, skills or company..."
                    style={{ color: 'var(--text-primary)' }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="hidden sm:block w-px self-stretch my-2"
                  style={{ background: 'var(--border)' }} />
                <div className="flex items-center gap-3 px-3 sm:w-44">
                  <MapPin size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <input
                    className="flex-1 text-sm font-medium outline-none bg-transparent py-2"
                    placeholder="Location..."
                    style={{ color: 'var(--text-primary)' }}
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="primary" size="lg"
                  className="rounded-xl w-full sm:w-auto px-7">
                  Search jobs
                </Button>
              </div>
            </form>

            {/* Popular searches */}
            <div className="flex flex-wrap justify-center gap-2 animate-fade-in-up delay-300">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Popular:
              </span>
              {['React Developer', 'Data Scientist', 'DevOps', 'Product Manager', 'UI Designer'].map(t => (
                <button key={t} onClick={() => navigate(`/jobs?search=${t}`)}
                  className="text-xs font-medium px-3 py-1 rounded-full transition-all hover-lift"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-strong)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--primary-light)'
                    e.currentTarget.style.color      = 'var(--primary-text)'
                    e.currentTarget.style.borderColor= 'var(--primary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--surface)'
                    e.currentTarget.style.color      = 'var(--text-secondary)'
                    e.currentTarget.style.borderColor= 'var(--border-strong)'
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="py-12 border-y" style={{ borderColor: 'var(--border)' }}>
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map((s, i) => (
              <div key={s.label}
                className={`text-center animate-fade-in-up`}
                style={{ animationDelay: `${i * 75}ms` }}>
                <p className="text-3xl sm:text-4xl font-bold mb-1"
                  style={{ color: 'var(--primary)', letterSpacing: '-0.03em' }}>
                  {s.value}
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="section-title mb-2">Browse by category</h2>
            <p className="section-subtitle">Explore opportunities across all industries</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((cat, i) => (
              <button key={cat.label}
                onClick={() => handleCategory(cat.q)}
                className={`card card-glow p-4 flex flex-col items-center gap-3
                  text-center group animate-fade-in-up`}
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center
                  transition-all group-hover:scale-110"
                  style={{ background: `${cat.color}18` }}>
                  <cat.icon size={20} style={{ color: cat.color }} />
                </div>
                <span className="text-xs font-semibold"
                  style={{ color: 'var(--text-secondary)' }}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ──────────────────────────────────── */}
      <section className="py-16 sm:py-20"
        style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
        <div className="page-container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-1">Latest opportunities</h2>
              <p className="section-subtitle">Fresh jobs posted in the last 24 hours</p>
            </div>
            <Link to="/jobs">
              <Button variant="secondary" size="md" className="hidden sm:flex">
                View all jobs <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {loadingJobs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {featuredJobs.map((job, i) => (
                <FeaturedJobCard key={job.id} job={job} index={i} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/jobs">
              <Button variant="primary" size="lg">
                View all jobs <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Top Companies ─────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="page-container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-1">Top companies hiring</h2>
              <p className="section-subtitle">Join industry leaders</p>
            </div>
            <Link to="/companies">
              <Button variant="secondary" size="md" className="hidden sm:flex">
                All companies <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {loadingCompanies
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card p-5 space-y-3">
                    <div className="skeleton w-12 h-12 rounded-xl" />
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                ))
              : companies.map((c, i) => (
                  <Link key={c.id} to={`/companies/${c.id}`}
                    className={`card card-glow p-5 flex flex-col gap-3 animate-fade-in-up`}
                    style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center
                      justify-center font-bold text-lg flex-shrink-0"
                      style={{ background: 'var(--primary-light)', color: 'var(--primary-text)' }}>
                      {c.logo
                        ? <img src={c.logo} alt={c.name} className="w-full h-full object-cover" />
                        : c.name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm truncate"
                        style={{ color: 'var(--text-primary)' }}>
                        {c.name}
                      </p>
                      <p className="text-xs mt-0.5 truncate"
                        style={{ color: 'var(--text-secondary)' }}>
                        {c.industry || 'Technology'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium"
                        style={{ color: 'var(--text-muted)' }}>
                        {c.job_count || 0} open roles
                      </span>
                      {c.is_verified && (
                        <CheckCircle size={13} style={{ color: 'var(--primary)' }} />
                      )}
                    </div>
                  </Link>
                ))
            }
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="py-16 sm:py-20"
        style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title mb-2">How it works</h2>
            <p className="section-subtitle">Get hired in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Create your profile',
                desc:  'Build a complete profile with your skills, experience, and upload your resume.',
                icon:  Users,
                color: 'var(--primary)',
              },
              {
                step: '02',
                title: 'Discover opportunities',
                desc:  'Browse thousands of jobs filtered by your skills, location, and preferences.',
                icon:  Search,
                color: 'var(--accent)',
              },
              {
                step: '03',
                title: 'Get hired fast',
                desc:  'Apply with one click, track applications, and land your dream job.',
                icon:  CheckCircle,
                color: 'var(--success)',
              },
            ].map((step, i) => (
              <div key={step.step}
                className={`card p-7 text-center animate-fade-in-up`}
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                  mx-auto mb-5 shadow-md"
                  style={{ background: `${step.color}18` }}>
                  <step.icon size={24} style={{ color: step.color }} />
                </div>
                <div className="text-xs font-bold mb-2 tracking-widest"
                  style={{ color: step.color }}>
                  STEP {step.step}
                </div>
                <h3 className="text-base font-bold mb-2"
                  style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="page-container">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065F46 100%)' }}>
            {/* BG decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
              style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl"
              style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                mb-6 bg-white/20 border border-white/30">
                <Star size={13} color="white" />
                <span className="text-xs font-semibold text-white">
                  Join 200,000+ professionals
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4"
                style={{ letterSpacing: '-0.02em' }}>
                Ready to find your<br />next opportunity?
              </h2>
              <p className="text-base text-white/80 mb-8 max-w-lg mx-auto">
                Create your free profile today and let top companies come to you.
              </p>

              {isAuthenticated ? (
                <Link to="/jobs">
                  <button className="inline-flex items-center gap-2 bg-white font-bold
                    text-sm px-8 py-3.5 rounded-xl transition-all hover-lift shadow-lg"
                    style={{ color: 'var(--primary-text)' }}>
                    Browse jobs <ArrowRight size={16} />
                  </button>
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/register">
                    <button className="inline-flex items-center gap-2 bg-white font-bold
                      text-sm px-8 py-3.5 rounded-xl transition-all hover-lift shadow-lg"
                      style={{ color: 'var(--primary-text)' }}>
                      Get started free <ArrowRight size={16} />
                    </button>
                  </Link>
                  <Link to="/jobs">
                    <button className="inline-flex items-center gap-2 font-bold
                      text-sm px-8 py-3.5 rounded-xl transition-all
                      bg-white/10 border border-white/30 text-white hover:bg-white/20">
                      Browse jobs
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="py-12 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="page-container">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--primary)' }}>
                  <Briefcase size={15} color="white" />
                </div>
                <span className="font-bold text-gradient">JobPortal</span>
              </div>
              <p className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}>
                India's trusted job portal connecting talent with opportunity.
              </p>
            </div>

            {[
              {
                title: 'For Job Seekers',
                links: [
                  { label: 'Browse Jobs',      to: '/jobs'         },
                  { label: 'Companies',         to: '/companies'    },
                  { label: 'My Applications',   to: '/applications' },
                  { label: 'Job Alerts',        to: '/alerts'       },
                ],
              },
              {
                title: 'For Recruiters',
                links: [
                  { label: 'Post a Job',        to: '/recruiter/jobs/new'      },
                  { label: 'Find Candidates',   to: '/recruiter/candidates'    },
                  { label: 'My Jobs',           to: '/recruiter/jobs'          },
                  { label: 'Applications',      to: '/recruiter/applications'  },
                ],
              },
              {
                title: 'Account',
                links: [
                  { label: 'Login',    to: '/login'    },
                  { label: 'Register', to: '/register' },
                  { label: 'Profile',  to: '/profile'  },
                ],
              },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: 'var(--text-muted)' }}>
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link to={l.to}
                        className="text-sm font-medium transition-colors hover:underline"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t flex flex-col sm:flex-row items-center
            justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              © 2025 JobPortal. Built with ❤️ in Chennai, India.
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              For skill development purposes only
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Featured job card for homepage
const FeaturedJobCard = ({ job, index }) => {
  const salary = job.salary_min && job.salary_max
    ? `₹${(job.salary_min/100000).toFixed(1)}–${(job.salary_max/100000).toFixed(1)} LPA`
    : job.salary_min ? `₹${(job.salary_min/100000).toFixed(1)}+ LPA` : null

  return (
    <Link to={`/jobs/${job.slug}`}
      className={`card card-glow p-5 flex flex-col gap-4 animate-fade-in-up`}
      style={{ animationDelay: `${index * 75}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center
            justify-center text-sm font-bold overflow-hidden"
            style={{ background: 'var(--primary-light)', color: 'var(--primary-text)' }}>
            {job.company?.logo
              ? <img src={job.company.logo} alt={job.company.name}
                  className="w-full h-full object-cover" />
              : job.company?.name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate"
              style={{ color: 'var(--text-secondary)' }}>
              {job.company?.name}
            </p>
            <h3 className="text-sm font-bold mt-0.5 group-hover:text-[var(--primary)]
              transition-colors line-clamp-2"
              style={{ color: 'var(--text-primary)' }}>
              {job.title}
            </h3>
          </div>
        </div>
        <Badge variant={job.work_mode === 'remote' ? 'success'
                      : job.work_mode === 'hybrid' ? 'warning' : 'neutral'}>
          {job.work_mode}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(job.skills_required || []).slice(0, 3).map(s => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-md font-medium"
            style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 mt-auto"
        style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1 text-xs"
          style={{ color: 'var(--text-muted)' }}>
          <MapPin size={11} /> {job.location}
        </div>
        {salary && (
          <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
            {salary}
          </span>
        )}
      </div>
    </Link>
  )
}

export default HomePage