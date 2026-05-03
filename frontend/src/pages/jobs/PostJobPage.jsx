import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, X, Save } from 'lucide-react'
import { Button, Input, Textarea, Select, PageHeader, useToast } from '../../components/ui'
import { jobsApi } from '../../api/jobs'
import { companiesApi } from '../../api/companies'

const schema = z.object({
  title:            z.string().min(3, 'Title is required'),
  company:          z.string().min(1, 'Select a company'),
  description:      z.string().min(50, 'Description must be at least 50 characters'),
  requirements:     z.string().optional(),
  responsibilities: z.string().optional(),
  job_type:         z.string().min(1, 'Select job type'),
  work_mode:        z.string().min(1, 'Select work mode'),
  experience_level: z.string().min(1, 'Select experience level'),
  location:         z.string().min(2, 'Location is required'),
  salary_min:       z.string().optional(),
  salary_max:       z.string().optional(),
  status:           z.string().default('draft'),
  expires_at:       z.string().optional(),
})

const PostJobPage = () => {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const isEdit    = Boolean(id)
  const { toast } = useToast()

  const [saving, setSaving]       = useState(false)
  const [companies, setCompanies] = useState([])
  const [skills, setSkills]       = useState([])
  const [skillInput, setSkillInput] = useState('')

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'draft', job_type: '', work_mode: '', experience_level: '',
    },
  })

  useEffect(() => {
    companiesApi.getMine()
      .then(r => setCompanies(r.data.results || r.data))
      .catch(() => setCompanies([]))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    jobsApi.getBySlug(id).then(r => {
      const j = r.data
      setSkills(j.skills_required || [])
      reset({
        title:            j.title,
        company:          String(j.company.id),
        description:      j.description,
        requirements:     j.requirements     || '',
        responsibilities: j.responsibilities || '',
        job_type:         j.job_type,
        work_mode:        j.work_mode,
        experience_level: j.experience_level,
        location:         j.location,
        salary_min:       j.salary_min       ? String(j.salary_min) : '',
        salary_max:       j.salary_max       ? String(j.salary_max) : '',
        status:           j.status,
        expires_at:       j.expires_at       || '',
      })
    }).catch(() => toast('Failed to load job details.', 'error'))
  }, [id])

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s])
    setSkillInput('')
  }

  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s))

  // shared save logic
  const saveJob = async (data, status) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        status,
        skills_required: skills,
        salary_min: data.salary_min ? parseInt(data.salary_min) : null,
        salary_max: data.salary_max ? parseInt(data.salary_max) : null,
      }
      if (isEdit) {
        await jobsApi.update(id, payload)
        toast(status === 'active' ? 'Job updated & published! 🚀' : 'Job saved as draft!', 'success')
      } else {
        await jobsApi.create(payload)
        toast(status === 'active' ? 'Job published successfully! 🚀' : 'Job saved as draft!', 'success')
      }
      navigate('/recruiter/jobs')
    } catch (err) {
      const errData = err.response?.data
      if (errData) {
        const msg = Object.values(errData).flat().join(' ')
        toast(msg || 'Failed to save job.', 'error')
      } else {
        toast('Something went wrong. Please try again.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  // these call handleSubmit which triggers validation first
  const handleSaveDraft = handleSubmit((data) => saveJob(data, 'draft'))
  const handlePublish   = handleSubmit((data) => saveJob(data, 'active'))

  return (
    <div className="page-container py-6 sm:py-8">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
        <ArrowLeft size={15} /> Back
      </button>

      <PageHeader
        title={isEdit ? 'Edit Job' : 'Post a Job'}
        subtitle={isEdit ? 'Update job details' : 'Fill in the details to attract the right candidates'}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="md" loading={saving} onClick={handleSaveDraft}>
              <Save size={14} /> Save draft
            </Button>
            <Button variant="primary" size="md" loading={saving} onClick={handlePublish}>
              {isEdit ? 'Update & Publish' : 'Publish job'}
            </Button>
          </div>
        }
      />

      {/* Validation error summary */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-5 p-4 rounded-xl text-sm space-y-1"
          style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
          <p className="font-semibold mb-2">Please fix the following errors:</p>
          {Object.entries(errors).map(([field, err]) => (
            <p key={field}>• {err.message}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Basic information
            </p>

            <Input label="Job title" placeholder="e.g. Senior React Developer"
              error={errors.title?.message}
              {...register('title')} />

            <Select label="Company" error={errors.company?.message}
              {...register('company')}>
              <option value="">Select company</option>
              {companies.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </Select>

            {companies.length === 0 && (
              <div className="text-sm px-4 py-3 rounded-lg"
                style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                You have no companies yet.{' '}
                <a href="/recruiter/companies/new" className="font-medium underline">
                  Add a company first
                </a>
              </div>
            )}

            <Textarea label="Job description"
              placeholder="Describe the role, team culture, and what makes this opportunity exciting..."
              rows={6}
              error={errors.description?.message}
              {...register('description')} />

            <Textarea label="Responsibilities"
              placeholder="List the key responsibilities..."
              rows={5}
              {...register('responsibilities')} />

            <Textarea label="Requirements"
              placeholder="List required qualifications and skills..."
              rows={5}
              {...register('requirements')} />
          </div>

          {/* Skills */}
          <div className="card p-6">
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Required skills
            </p>
            <div className="flex gap-2 mb-3">
              <input
                className="input flex-1"
                placeholder="e.g. React, Python, Docker..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button variant="secondary" size="md" onClick={addSkill}>
                <Plus size={14} />
              </Button>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s}
                    className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary-text)' }}>
                    {s}
                    <button onClick={() => removeSkill(s)} className="hover:opacity-70">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No skills added yet. Type a skill and press Enter.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Job details
            </p>

            <Select label="Job type" error={errors.job_type?.message}
              {...register('job_type')}>
              <option value="">Select type</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </Select>

            <Select label="Work mode" error={errors.work_mode?.message}
              {...register('work_mode')}>
              <option value="">Select mode</option>
              <option value="onsite">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </Select>

            <Select label="Experience level" error={errors.experience_level?.message}
              {...register('experience_level')}>
              <option value="">Select level</option>
              <option value="fresher">Fresher</option>
              <option value="1_3">1–3 years</option>
              <option value="3_5">3–5 years</option>
              <option value="5_10">5–10 years</option>
              <option value="10_plus">10+ years</option>
            </Select>

            <Input label="Location" placeholder="e.g. Chennai, Tamil Nadu or Remote"
              error={errors.location?.message}
              {...register('location')} />

            <Input label="Application deadline" type="date"
              {...register('expires_at')} />
          </div>

          {/* Salary */}
          <div className="card p-5 space-y-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Salary range (₹ per year)
            </p>
            <Input label="Minimum salary" type="number" placeholder="e.g. 800000"
              {...register('salary_min')} />
            <Input label="Maximum salary" type="number" placeholder="e.g. 1500000"
              {...register('salary_max')} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Jobs with salary info get 3× more applications
            </p>
          </div>

          {/* Status */}
          <div className="card p-5">
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Visibility
            </p>
            <Select label="Status" {...register('status')}>
              <option value="draft">Draft (not visible)</option>
              <option value="active">Active (visible to all)</option>
              <option value="closed">Closed</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden p-4 flex gap-3"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}>
        <Button variant="secondary" size="lg" className="flex-1"
          loading={saving} onClick={handleSaveDraft}>
          Save draft
        </Button>
        <Button variant="primary" size="lg" className="flex-1"
          loading={saving} onClick={handlePublish}>
          Publish
        </Button>
      </div>

      <div className="h-24 lg:hidden" />
    </div>
  )
}

export default PostJobPage