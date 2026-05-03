import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Menu, X } from 'lucide-react'

const LandingNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="glass sticky top-0 z-50"
      style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="page-container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'var(--primary)' }}>
              <Briefcase size={17} color="white" />
            </div>
            <span className="text-base font-bold tracking-tight text-gradient">
              JobPortal
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Browse Jobs',  to: '/jobs'      },
              { label: 'Companies',    to: '/companies' },
              { label: 'For Recruiters', to: '/register?role=recruiter' },
            ].map(link => (
              <Link key={link.label} to={link.to}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color      = 'var(--primary-text)'
                  e.currentTarget.style.background = 'var(--primary-light)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color      = 'var(--text-secondary)'
                  e.currentTarget.style.background = 'transparent'
                }}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"
              className="btn btn-ghost btn-md font-semibold"
              style={{ color: 'var(--text-primary)' }}>
              Sign in
            </Link>
            <Link to="/register" className="btn btn-primary btn-md">
              Get started free →
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden btn btn-ghost btn-sm w-9 h-9 p-0"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen
              ? <X size={18} style={{ color: 'var(--text-primary)' }} />
              : <Menu size={18} style={{ color: 'var(--text-primary)' }} />
            }
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1 animate-slide-down">
            {[
              { label: 'Browse Jobs',     to: '/jobs'      },
              { label: 'Companies',       to: '/companies' },
              { label: 'For Recruiters',  to: '/register?role=recruiter' },
            ].map(link => (
              <Link key={link.label} to={link.to}
                className="flex px-3 py-2.5 rounded-xl text-sm font-semibold"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMenuOpen(false)}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <Link to="/login" className="btn btn-secondary btn-md flex-1"
                onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-md flex-1"
                onClick={() => setMenuOpen(false)}>
                Get started
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default LandingNavbar