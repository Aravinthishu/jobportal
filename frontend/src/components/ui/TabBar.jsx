const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 p-1 rounded-xl w-full sm:w-auto overflow-x-auto"
    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
    {tabs.map(tab => (
      <button key={tab.key} onClick={() => onChange(tab.key)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          whitespace-nowrap transition-all flex-shrink-0"
        style={active === tab.key
          ? { background: 'var(--surface)', color: 'var(--primary)',
              boxShadow: 'var(--shadow-sm)' }
          : { color: 'var(--text-muted)' }}>
        {tab.icon && <tab.icon size={14} />}
        {tab.label}
        {tab.count !== undefined && (
          <span className="px-1.5 py-0.5 rounded-full text-xs"
            style={active === tab.key
              ? { background: 'var(--primary-light)', color: 'var(--primary-text)' }
              : { background: 'var(--border)', color: 'var(--text-muted)' }}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
)

export default TabBar