import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '../ui'

const JOB_TYPES    = [['full_time','Full Time'],['part_time','Part Time'],['contract','Contract'],['internship','Internship']]
const WORK_MODES   = [['remote','Remote'],['hybrid','Hybrid'],['onsite','On-site']]
const EXP_LEVELS   = [['fresher','Fresher'],['1_3','1–3 yrs'],['3_5','3–5 yrs'],['5_10','5–10 yrs'],['10_plus','10+ yrs']]

export default function JobFilters({ filters, onChange, total }) {
  const [open, setOpen] = useState(false)

  const toggle = (key, val) => {
    const current = filters[key] || []
    const updated  = current.includes(val)
      ? current.filter(v => v !== val)
      : [...current, val]
    onChange({ ...filters, [key]: updated })
  }

  const hasFilters = Object.entries(filters)
    .some(([k, v]) => k !== 'search' && k !== 'location' && (Array.isArray(v) ? v.length : v))

  const clearAll = () => onChange({ search: filters.search || '', location: '' })

  return (
    <div>
      {/* Search bar — always visible */}
      <div className="card p-3 mb-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input
              className="input pl-9 text-sm"
              placeholder="Job title, skills or company..."
              value={filters.search || ''}
              onChange={e => onChange({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="relative w-40 hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input
              className="input pl-9 text-sm"
              placeholder="Location..."
              value={filters.location || ''}
              onChange={e => onChange({ ...filters, location: e.target.value })}
            />
          </div>
          <Button variant="secondary" size="md"
            className="flex-shrink-0 gap-1.5"
            onClick={() => setOpen(!open)}>
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: 'var(--primary)' }} />
            )}
          </Button>
        </div>

        {/* Mobile location */}
        <div className="sm:hidden mt-2">
          <input
            className="input text-sm"
            placeholder="Location..."
            value={filters.location || ''}
            onChange={e => onChange({ ...filters, location: e.target.value })}
          />
        </div>
      </div>

      {/* Expanded filters */}
      {open && (
        <div className="card p-4 mb-3 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Filter jobs {total !== undefined && (
                <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                  ({total} results)
                </span>
              )}
            </p>
            {hasFilters && (
              <button onClick={clearAll}
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--danger)' }}>
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FilterGroup label="Job type" options={JOB_TYPES}
              selected={filters.job_type || []}
              onToggle={v => toggle('job_type', v)} />
            <FilterGroup label="Work mode" options={WORK_MODES}
              selected={filters.work_mode || []}
              onToggle={v => toggle('work_mode', v)} />
            <FilterGroup label="Experience" options={EXP_LEVELS}
              selected={filters.experience_level || []}
              onToggle={v => toggle('experience_level', v)} />
          </div>
        </div>
      )}
    </div>
  )
}

function FilterGroup({ label, options, selected, onToggle }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(([val, lbl]) => {
          const active = selected.includes(val)
          return (
            <button key={val} onClick={() => onToggle(val)}
              className="text-xs px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: active ? 'var(--primary)' : 'var(--surface)',
                color:      active ? '#fff' : 'var(--text-secondary)',
                borderColor: active ? 'var(--primary)' : 'var(--border-strong)',
              }}>
              {lbl}
            </button>
          )
        })}
      </div>
    </div>
  )
}