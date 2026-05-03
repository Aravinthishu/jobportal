import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '../components/ui'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

const METRICS = [
  { value: '50K+',  label: 'Active Positions' },
  { value: '12K+',  label: 'Partner Companies' },
  { value: '200K+', label: 'Professionals' },
  { value: '94%',   label: 'Placement Rate' },
]

const TESTIMONIALS = [
  {
    quote: 'Landed my dream role at a Series B startup within three weeks of signing up.',
    name: 'Priya R.',
    title: 'Product Designer',
  },
  {
    quote: 'The quality of candidates we hire through Nexhire is noticeably higher.',
    name: 'Karthik M.',
    title: 'Engineering Manager',
  },
  {
    quote: 'Finally a platform that respects both sides of the hiring process.',
    name: 'Ananya S.',
    title: 'Full Stack Engineer',
  },
]

export default function Login() {
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [apiError, setApiError]   = useState('')
  const [mounted, setMounted]     = useState(false)
  const [testimonial, setTestimonial] = useState(0)
  const { login } = useAuthStore()
  const navigate  = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => setTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    try {
      const res = await api.post('/auth/login/', data)
      const me  = await api.get('/auth/me/', {
        headers: { Authorization: `Bearer ${res.data.access}` }
      })
      login(me.data, { access: res.data.access, refresh: res.data.refresh })
      navigate(me.data.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard')
    } catch {
      setApiError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const current = TESTIMONIALS[testimonial]

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .auth-left { font-family: 'DM Sans', sans-serif; }
        .auth-display { font-family: 'DM Serif Display', serif; }

        .panel-enter { opacity: 0; transform: translateY(24px); }
        .panel-visible { opacity: 1; transform: translateY(0);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1),
                      transform 0.7s cubic-bezier(0.16,1,0.3,1); }

        .metric-item { opacity: 0; transform: translateY(16px); }
        .metric-visible { opacity: 1; transform: translateY(0);
          transition: opacity 0.6s ease, transform 0.6s ease; }

        .line-reveal {
          clip-path: inset(0 100% 0 0);
          transition: clip-path 1s cubic-bezier(0.16,1,0.3,1);
        }
        .line-visible { clip-path: inset(0 0% 0 0); }

        .testimonial-fade { animation: tfade 0.5s ease; }
        @keyframes tfade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .orb {
          position: absolute; border-radius: 50%; filter: blur(80px);
          animation: drift 12s ease-in-out infinite alternate;
        }
        @keyframes drift {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(30px, -20px) scale(1.08); }
        }

        .dot-pulse {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--primary); display: inline-block;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 0.3; transform: scale(1); }
          50%     { opacity: 1;   transform: scale(1.4); }
        }
      `}</style>

      {/* ── Left panel ── */}
      <div
        className="auth-left hidden lg:flex lg:w-[52%] flex-col justify-between p-14
                   relative overflow-hidden"
        style={{ background: 'var(--secondary)' }}
      >
        {/* Grid texture */}
        <div className="grid-bg absolute inset-0" />

        {/* Orbs */}
        <div className="orb" style={{
          width: 400, height: 400, top: '-80px', left: '-80px',
          background: 'var(--primary)', opacity: 0.08,
          animationDuration: '14s',
        }} />
        <div className="orb" style={{
          width: 300, height: 300, bottom: '60px', right: '-60px',
          background: '#7C3AED', opacity: 0.07,
          animationDuration: '10s', animationDelay: '-4s',
        }} />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight"
            style={{ color: 'var(--primary)', letterSpacing: '-0.3px' }}>
            Nexhire
          </span>
        </div>

        {/* Hero content */}
        <div className="relative">
          {/* Overline */}
          <div className="flex items-center gap-2 mb-8">
            <span className="dot-pulse" />
            <span className="text-xs font-medium tracking-widest uppercase"
              style={{ color: 'var(--primary)', opacity: 0.7 }}>
              Trusted by 200K+ professionals
            </span>
          </div>

          <h2
            className={`auth-display text-[52px] font-normal leading-[1.1] mb-6
              ${mounted ? 'panel-visible' : 'panel-enter'}`}
            style={{ color: 'var(--primary)', transitionDelay: '0.1s' }}
          >
            Welcome<br />
            <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>back.</span>
          </h2>

          <p
            className={`text-base mb-12 leading-relaxed
              ${mounted ? 'panel-visible' : 'panel-enter'}`}
            style={{ color: '#64748b', maxWidth: 340, transitionDelay: '0.25s' }}
          >
            Your next career move is waiting. Sign in to access
            thousands of curated opportunities.
          </p>

          {/* Divider line */}
          <div
            className={`mb-10 ${mounted ? 'line-visible' : 'line-reveal'}`}
            style={{
              height: 1, background: 'linear-gradient(90deg, var(--primary), transparent)',
              transitionDelay: '0.4s',
            }}
          />

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {METRICS.map(({ value, label }, i) => (
              <div
                key={label}
                className={`${mounted ? 'metric-visible' : 'metric-item'}`}
                style={{ transitionDelay: `${0.45 + i * 0.1}s` }}
              >
                <p className="auth-display text-3xl font-normal"
                  style={{ color: 'var(--primary)' }}>
                  {value}
                </p>
                <p className="text-xs mt-1 tracking-wide"
                  style={{ color: '#475569' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          {/* <div
            className="p-5 rounded-2xl"
            style={{
              background: 'rgba(148,163,184,0.04)',
              border: '1px solid rgba(148,163,184,0.1)',
            }}
          >
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="var(--primary)">
                  <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8.5 3 10.1l.6-3.3L1.2 4.5l3.3-.5z"/>
                </svg>
              ))}
            </div>
            <p
              key={testimonial}
              className="text-sm leading-relaxed mb-3 testimonial-fade"
              style={{ color: '#94a3b8' }}
            >
              &ldquo;{current.quote}&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ background: 'var(--primary)', color: 'white', opacity: 0.9 }}>
                {current.name[0]}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#cbd5e1' }}>
                  {current.name}
                </p>
                <p className="text-xs" style={{ color: '#475569' }}>{current.title}</p>
              </div>
            </div>

            <div className="flex gap-1.5 mt-4">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonial(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === testimonial ? 20 : 6,
                    height: 6,
                    background: i === testimonial ? 'var(--primary)' : 'rgba(148,163,184,0.2)',
                  }}
                />
              ))}
            </div>
          </div> */}
        </div>

        <p className="text-xs relative" style={{ color: '#334155' }}>
          &copy; {new Date().getFullYear()} Nexhire. All rights reserved.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--primary)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
            <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Nexhire
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-1.5 tracking-tight"
            style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
            Sign in
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)' }}
              className="font-medium hover:underline">
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password"
                  className="text-xs font-medium hover:underline"
                  style={{ color: 'var(--primary)' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="field-error">{errors.password.message}</p>
              )}
            </div>

            {apiError && (
              <div className="text-sm px-4 py-3 rounded-lg"
                style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                {apiError}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg"
              loading={loading} className="w-full mt-2">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}