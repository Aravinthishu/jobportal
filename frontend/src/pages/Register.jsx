import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '../components/ui'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email:     z.string().email('Enter a valid email'),
  password:  z.string().min(8, 'Minimum 8 characters'),
  password2: z.string(),
  role:      z.enum(['jobseeker', 'recruiter']),
}).refine(d => d.password === d.password2, {
  message: "Passwords don't match",
  path: ['password2'],
})

const FEATURES = {
  jobseeker: [
    { label: 'Free forever',              detail: 'No hidden fees, no subscriptions' },
    { label: 'Smart job matching',        detail: 'AI-matched to your skills & goals' },
    { label: 'Application tracker',       detail: 'Every status update in one place' },
    { label: 'Direct recruiter contact',  detail: 'Skip the queue, apply directly' },
  ],
  recruiter: [
    { label: 'Verified talent pool',      detail: 'Pre-screened, active candidates' },
    { label: 'Applicant pipeline',        detail: 'Full visibility from apply to hire' },
    { label: 'Skill-based filtering',     detail: 'Find the right fit, faster' },
    { label: 'Instant notifications',     detail: 'Never miss a strong candidate' },
  ],
}

const STEPS = ['Create account', 'Complete profile', 'Get matched']

export default function Register() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState('')
  const [mounted, setMounted]   = useState(false)
  const { login } = useAuthStore()
  const navigate  = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'jobseeker' },
  })

  const role = watch('role')

  useEffect(() => { setMounted(true) }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    try {
      const res = await api.post('/auth/register/', data)
      login(res.data.user, res.data.tokens)
      navigate(res.data.user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard')
    } catch (err) {
      const errs = err.response?.data
      if (errs) setApiError(Object.values(errs).flat().join(' '))
    } finally {
      setLoading(false)
    }
  }

  const features = FEATURES[role]

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .auth-left  { font-family: 'DM Sans', sans-serif; }
        .auth-display { font-family: 'DM Serif Display', serif; }

        .panel-enter   { opacity: 0; transform: translateY(24px); }
        .panel-visible { opacity: 1; transform: translateY(0);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1),
                      transform 0.7s cubic-bezier(0.16,1,0.3,1); }

        .feat-item { opacity: 0; transform: translateX(-12px); }
        .feat-visible { opacity: 1; transform: translateX(0);
          transition: opacity 0.5s ease, transform 0.5s ease; }

        .line-reveal  { clip-path: inset(0 100% 0 0);
          transition: clip-path 1s cubic-bezier(0.16,1,0.3,1); }
        .line-visible { clip-path: inset(0 0% 0 0); }

        .role-card {
          transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .orb {
          position: absolute; border-radius: 50%; filter: blur(90px);
          animation: drift 14s ease-in-out infinite alternate;
        }
        @keyframes drift {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(20px,-30px) scale(1.06); }
        }

        .step-connector {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, var(--primary), rgba(148,163,184,0.15));
        }

        .feat-swap {
          animation: featIn 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes featIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Left panel ── */}
      <div
        className="auth-left hidden lg:flex lg:w-[52%] flex-col justify-between p-14
                   relative overflow-hidden"
        style={{ background: 'var(--secondary)' }}
      >
        <div className="grid-bg absolute inset-0" />

        <div className="orb" style={{
          width: 380, height: 380, top: '-60px', right: '-60px',
          background: 'var(--primary)', opacity: 0.07,
        }} />
        <div className="orb" style={{
          width: 280, height: 280, bottom: '80px', left: '-40px',
          background: '#7C3AED', opacity: 0.06,
          animationDuration: '11s', animationDelay: '-5s',
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

        {/* Main content */}
        <div className="relative">
          <h2
            className={`auth-display text-[50px] font-normal leading-[1.1] mb-6
              ${mounted ? 'panel-visible' : 'panel-enter'}`}
            style={{ color: '#f1f5f9', transitionDelay: '0.1s' }}
          >
            {role === 'jobseeker' ? (
              <>Find work<br /><span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>you love.</span></>
            ) : (
              <>Hire talent<br /><span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>that fits.</span></>
            )}
          </h2>

          <p
            className={`text-base leading-relaxed mb-10
              ${mounted ? 'panel-visible' : 'panel-enter'}`}
            style={{ color: '#64748b', maxWidth: 340, transitionDelay: '0.2s' }}
          >
            {role === 'jobseeker'
              ? 'Join 200K+ professionals who found their next role through Nexhire.'
              : 'Access a verified pool of active candidates. Post roles, manage pipelines, hire faster.'}
          </p>

          <div
            className={`mb-10 ${mounted ? 'line-visible' : 'line-reveal'}`}
            style={{
              height: 1,
              background: 'linear-gradient(90deg, var(--primary), transparent)',
              transitionDelay: '0.35s',
            }}
          />

          {/* Feature list — swaps on role change */}
          <div key={role} className="space-y-5 feat-swap mb-12">
            {features.map(({ label, detail }, i) => (
              <div
                key={label}
                className={`flex items-start gap-3
                  ${mounted ? 'feat-visible' : 'feat-item'}`}
                style={{ transitionDelay: `${0.4 + i * 0.08}s` }}
              >
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(var(--primary-rgb, 37,99,235),0.15)' }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="var(--primary)"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
                    {label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 3-step onboarding flow */}
          <div
            className="p-5 rounded-2xl"
            style={{
              background: 'rgba(148,163,184,0.04)',
              border: '1px solid rgba(148,163,184,0.1)',
            }}
          >
            <p className="text-xs font-medium tracking-widest uppercase mb-4"
              style={{ color: '#475569' }}>
              How it works
            </p>
            <div className="flex items-center gap-0">
              {STEPS.map((step, i) => (
                <>
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center
                                 text-xs font-bold mb-2"
                      style={{
                        background: i === 0 ? 'var(--primary)' : 'rgba(148,163,184,0.1)',
                        color: i === 0 ? 'white' : '#475569',
                      }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-xs text-center" style={{ color: i === 0 ? '#cbd5e1' : '#475569' }}>
                      {step}
                    </p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div key={`c-${i}`} className="step-connector mb-5 mx-2" />
                  )}
                </>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs relative" style={{ color: '#334155' }}>
          &copy; {new Date().getFullYear()} Nexhire. All rights reserved.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-[420px]">

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
            Create account
          </h1>
          <p className="text-sm mb-7" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)' }}
              className="font-medium hover:underline">
              Sign in
            </Link>
          </p>

          {/* Role toggle */}
          <div
            className="flex p-1 rounded-xl mb-6"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            {[
              {
                value: 'jobseeker', label: 'Job Seeker',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                ),
              },
              {
                value: 'recruiter', label: 'Recruiter',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                ),
              },
            ].map(({ value, label, icon }) => (
              <label key={value} className="flex-1 cursor-pointer">
                <input type="radio" value={value} {...register('role')} className="hidden" />
                <div
                  className="role-card flex items-center justify-center gap-2 py-2.5
                             rounded-lg text-sm font-medium"
                  style={role === value
                    ? {
                        background: 'var(--surface)',
                        color: 'var(--primary)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                      }
                    : { color: 'var(--text-muted)' }}
                >
                  {icon}
                  {label}
                </div>
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full name" placeholder="John Doe"
              error={errors.full_name?.message}
              {...register('full_name')} />

            <Input label="Email address" type="email" placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')} />

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
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

            <Input label="Confirm password" type="password"
              placeholder="Repeat your password"
              error={errors.password2?.message}
              {...register('password2')} />

            {apiError && (
              <div className="text-sm px-4 py-3 rounded-lg"
                style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                {apiError}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg"
              loading={loading} className="w-full mt-2">
              Create account
            </Button>

            <p className="text-xs text-center pt-1" style={{ color: 'var(--text-muted)' }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: 'var(--primary)' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" style={{ color: 'var(--primary)' }}>Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}