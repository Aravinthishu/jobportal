const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: 'var(--surface-2)' }}>
      <Icon size={24} style={{ color: 'var(--text-muted)' }} />
    </div>
    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
    {subtitle && (
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
)

export default EmptyState