const StatCard = ({ label, value, icon: Icon, color = 'primary', sub }) => {
  const colors = {
    primary: { bg: 'var(--primary-light)',  text: 'var(--primary-text)',  icon: 'var(--primary)' },
    success: { bg: 'var(--success-light)',  text: 'var(--success)',       icon: 'var(--success)' },
    warning: { bg: 'var(--warning-light)',  text: 'var(--warning)',       icon: 'var(--warning)' },
    danger:  { bg: 'var(--danger-light)',   text: 'var(--danger)',        icon: 'var(--danger)'  },
    neutral: { bg: 'var(--surface-2)',      text: 'var(--text-secondary)',icon: 'var(--text-muted)'},
  }
  const c = colors[color]

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: c.bg }}>
        <Icon size={18} style={{ color: c.icon }} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {value ?? '—'}
        </p>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
    </div>
  )
}

export default StatCard