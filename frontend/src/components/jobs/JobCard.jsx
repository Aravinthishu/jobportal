import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, Briefcase, Bookmark, BookmarkCheck, TrendingUp } from 'lucide-react'
import { Badge } from '../ui'
import { jobsApi } from '../../api/jobs'

const JOB_TYPE_LABELS = {
  full_time: 'Full Time', part_time: 'Part Time',
  contract: 'Contract',   internship: 'Internship', freelance: 'Freelance',
}
const WORK_MODE_COLORS = {
  remote: 'success', hybrid: 'warning', onsite: 'neutral',
}
const EXP_LABELS = {
  fresher: 'Fresher', '1_3': '1–3 yrs', '3_5': '3–5 yrs',
  '5_10': '5–10 yrs', '10_plus': '10+ yrs',
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return `${diff}d ago`
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`
  return `${Math.floor(diff / 30)}mo ago`
}

export default function JobCard({ job, onSaveToggle }) {
  const [saved, setSaved]   = useState(job.is_saved)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await jobsApi.toggleSave(job.slug)
      setSaved(res.data.saved)
      onSaveToggle?.()
    } catch {}
    finally { setSaving(false) }
  }

  const salary = job.salary_min && job.salary_max
    ? `₹${(job.salary_min / 100000).toFixed(1)}–${(job.salary_max / 100000).toFixed(1)} LPA`
    : job.salary_min
      ? `₹${(job.salary_min / 100000).toFixed(1)}+ LPA`
      : null

  return (
    <Link to={`/jobs/${job.slug}`} className="block group">
      <div className="card card-hover p-5 h-full flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Company logo */}
            <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold overflow-hidden"
              style={{ background: 'var(--primary-light)', color: 'var(--primary-text)' }}>
              {job.company.logo
                ? <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                : job.company.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
                {job.company.name}
              </p>
              <h3 className="text-sm font-semibold mt-0.5 group-hover:text-[var(--primary)] transition-colors line-clamp-2"
                style={{ color: 'var(--text-primary)' }}>
                {job.title}
              </h3>
            </div>
          </div>

          {/* Save button */}
          <button onClick={handleSave} disabled={saving}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: saved ? 'var(--primary-light)' : 'var(--surface-2)',
              color: saved ? 'var(--primary)' : 'var(--text-muted)',
            }}>
            {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={WORK_MODE_COLORS[job.work_mode]}>
            {job.work_mode}
          </Badge>
          <Badge variant="neutral">{JOB_TYPE_LABELS[job.job_type]}</Badge>
          <Badge variant="neutral">{EXP_LABELS[job.experience_level]}</Badge>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs"
          style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {job.location}
          </span>
          {salary && (
            <span className="flex items-center gap-1">
              <TrendingUp size={11} />
              {salary}
            </span>
          )}
        </div>

        {/* Skills */}
        {job.skills_required?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.skills_required.slice(0, 4).map(s => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-md"
                style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                {s}
              </span>
            ))}
            {job.skills_required.length > 4 && (
              <span className="text-xs px-2 py-0.5 rounded-md"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                +{job.skills_required.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3"
          style={{ borderTop: '1px solid var(--border)' }}>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Clock size={11} />
            {timeAgo(job.created_at)}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {job.applications_count} applied
          </span>
        </div>
      </div>
    </Link>
  )
}