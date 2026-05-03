import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, ChevronDown, LogOut, User, Briefcase, Menu, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import useAuthStore from '../../store/authStore'
import { useState, useEffect, useRef } from 'react'
import NotificationDropdown from './NotificationDropdown'
import { profileApi } from '../../api/profile'

const NavLink = ({ to, children, onClick }) => {
  const { pathname } = useLocation()
  const isActive = pathname === to || pathname.startsWith(to + '/')
  return (
    <Link to={to} onClick={onClick}
      className="px-3 py-2 rounded-xl text-sm font-semibold transition-all"
      style={{
        color:      isActive ? 'var(--primary-text)' : 'var(--text-secondary)',
        background: isActive ? 'var(--primary-light)' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.color      = 'var(--primary-text)'
          e.currentTarget.style.background = 'var(--primary-light)'
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.color      = 'var(--text-secondary)'
          e.currentTarget.style.background = 'transparent'
        }
      }}>
      {children}
    </Link>
  )
}

const MobileNavLink = ({ to, children, onClick }) => {
  const { pathname } = useLocation()
  const isActive = pathname === to || pathname.startsWith(to + '/')
  return (
    <Link to={to} onClick={onClick}
      className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all"
      style={{
        color:      isActive ? 'var(--primary-text)' : 'var(--text-secondary)',
        background: isActive ? 'var(--primary-light)' : 'transparent',
      }}>
      {children}
    </Link>
  )
}

const Navbar = () => {
  const { dark, toggle }                = useTheme()
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate                        = useNavigate()
  const [menuOpen, setMenuOpen]         = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [photoUrl, setPhotoUrl]         = useState(null)
  const [photoError, setPhotoError]     = useState(false)
  const dropdownRef                     = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
  const { pathname } = useLocation()
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Fetch profile photo
  useEffect(() => {
    if (!isAuthenticated) { setPhotoUrl(null); return }
    const fetch = async () => {
      try {
        const r = user?.role === 'jobseeker'
          ? await profileApi.getJobseekerProfile()
          : await profileApi.getRecruiterProfile()
        setPhotoUrl(r.data.profile_photo || null)
      } catch { setPhotoUrl(null) }
    }
    fetch()
  }, [isAuthenticated, user?.role])

  const handleLogout = () => {
    logout()
    setPhotoUrl(null)
    setMenuOpen(false)
    setMobileOpen(false)
    navigate('/login')
  }

  const initial = user?.email?.[0]?.toUpperCase()

  const AvatarCircle = ({ size = 'sm' }) => {
    const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
    return (
      <div className={`${dim} rounded-full overflow-hidden flex items-center
        justify-center font-semibold flex-shrink-0`}
        style={{ background: 'var(--primary-light)', color: 'var(--primary-text)' }}>
        {photoUrl && !photoError
          ? <img src={photoUrl} alt="" className="w-full h-full object-cover"
              onError={() => setPhotoError(true)} />
          : initial}
      </div>
    )
  }

  const jobseekerLinks = [
    { label: 'Dashboard',        to: '/dashboard'     },
    { label: 'Browse Jobs',      to: '/jobs'          },
    { label: 'My Applications',  to: '/applications'  },
    { label: 'Job Alerts',       to: '/alerts'        },
  ]

  const recruiterLinks = [
    { label: 'Dashboard',    to: '/recruiter/dashboard'    },
    { label: 'My Jobs',      to: '/recruiter/jobs'         },
    { label: 'Applications', to: '/recruiter/applications' },
    { label: 'Candidates',   to: '/recruiter/candidates'   },
  ]

  const navLinks = user?.role === 'recruiter' ? recruiterLinks : jobseekerLinks

  return (
    <>
      <header className="sticky top-0 z-50"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="page-container">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--primary)' }}>
                <Briefcase size={16} color="white" />
              </div>
              <span className="text-base font-bold text-gradient">
                {/* Change to your portal name */}
                JobPortal
              </span>
            </Link>

            {/* Desktop nav links */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-0.5">
                {navLinks.map(link => (
                  <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
                ))}
              </nav>
            )}

            {/* Right side */}
            <div className="flex items-center gap-1.5">
              {/* Dark mode toggle */}
              <button onClick={toggle}
                className="btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl"
                aria-label="Toggle theme">
                {dark
                  ? <Sun size={16} style={{ color: 'var(--text-secondary)' }} />
                  : <Moon size={16} style={{ color: 'var(--text-secondary)' }} />}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <NotificationDropdown />

                  {/* User dropdown — desktop */}
                  <div className="relative hidden md:block" ref={dropdownRef}>
                    <button onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center gap-2 btn btn-ghost btn-sm rounded-xl px-2">
                      <AvatarCircle size="sm" />
                      <ChevronDown size={13}
                        style={{
                          color: 'var(--text-muted)',
                          transform: menuOpen ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 200ms ease',
                        }} />
                    </button>

                    {menuOpen && (
                      <div className="card absolute right-0 top-12 w-56 py-1 z-50 animate-scale-in"
                        style={{ boxShadow: 'var(--shadow-xl)' }}>
                        {/* User info */}
                        <div className="px-3 py-3 flex items-center gap-3"
                          style={{ borderBottom: '1px solid var(--border)' }}>
                          <AvatarCircle size="lg" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate"
                              style={{ color: 'var(--text-primary)' }}>
                              {user?.email}
                            </p>
                            <p className="text-xs capitalize mt-0.5"
                              style={{ color: 'var(--text-muted)' }}>
                              {user?.role}
                            </p>
                          </div>
                        </div>

                        {/* Menu items */}
                        {[
                          {
                            label: 'Profile',
                            to:    user?.role === 'recruiter' ? '/recruiter/profile' : '/profile',
                            icon:  User,
                          },
                          {
                            label: 'Notifications',
                            to:    '/notifications',
                            icon:  null,
                          },
                          ...(user?.role === 'jobseeker' ? [
                            { label: 'Saved Jobs', to: '/saved-jobs',  icon: null },
                            { label: 'Job Alerts', to: '/alerts',      icon: null },
                          ] : [
                            { label: 'My Companies', to: '/recruiter/companies', icon: null },
                          ]),
                        ].map(item => (
                          <Link key={item.label} to={item.to}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm
                              font-medium transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            onClick={() => setMenuOpen(false)}>
                            {item.icon && <item.icon size={14} />}
                            {item.label}
                          </Link>
                        ))}

                        <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px' }}>
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5
                              text-sm font-medium transition-colors text-left"
                            style={{ color: 'var(--danger)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <LogOut size={14} /> Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile hamburger */}
                  <button
                    className="md:hidden btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu">
                    {mobileOpen
                      ? <X size={18} style={{ color: 'var(--text-primary)' }} />
                      : <Menu size={18} style={{ color: 'var(--text-primary)' }} />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn btn-ghost btn-sm hidden sm:flex">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile menu drawer (authenticated) ── */}
        {isAuthenticated && mobileOpen && (
          <div className="md:hidden animate-slide-down"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div className="page-container py-3 space-y-1">

              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl"
                style={{ background: 'var(--surface-2)' }}>
                <AvatarCircle size="lg" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate"
                    style={{ color: 'var(--text-primary)' }}>
                    {user?.email}
                  </p>
                  <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                    {user?.role}
                  </p>
                </div>
              </div>

              {/* Nav links */}
              <div className="space-y-0.5">
                <p className="text-xs font-bold uppercase tracking-widest px-4 py-1"
                  style={{ color: 'var(--text-muted)' }}>
                  Navigation
                </p>
                {navLinks.map(link => (
                  <MobileNavLink key={link.to} to={link.to}
                    onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </MobileNavLink>
                ))}
              </div>

              {/* Extra links */}
              <div className="space-y-0.5 pt-2"
                style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-xs font-bold uppercase tracking-widest px-4 py-1"
                  style={{ color: 'var(--text-muted)' }}>
                  Account
                </p>
                <MobileNavLink
                  to={user?.role === 'recruiter' ? '/recruiter/profile' : '/profile'}
                  onClick={() => setMobileOpen(false)}>
                  My Profile
                </MobileNavLink>
                <MobileNavLink to="/notifications" onClick={() => setMobileOpen(false)}>
                  Notifications
                </MobileNavLink>
                {user?.role === 'jobseeker' && (
                  <>
                    <MobileNavLink to="/saved-jobs" onClick={() => setMobileOpen(false)}>
                      Saved Jobs
                    </MobileNavLink>
                    <MobileNavLink to="/alerts" onClick={() => setMobileOpen(false)}>
                      Job Alerts
                    </MobileNavLink>
                  </>
                )}
                {user?.role === 'recruiter' && (
                  <MobileNavLink to="/recruiter/companies" onClick={() => setMobileOpen(false)}>
                    My Companies
                  </MobileNavLink>
                )}
              </div>

              {/* Sign out */}
              <div className="pt-2 pb-1" style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl
                    text-sm font-semibold transition-all"
                  style={{ color: 'var(--danger)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Overlay to close mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setMobileOpen(false)} />
      )}
    </>
  )
}

export default Navbar