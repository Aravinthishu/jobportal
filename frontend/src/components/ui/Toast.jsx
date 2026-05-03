import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
}

const COLORS = {
  success: { bg: 'var(--success-light)', border: 'var(--success)',  text: 'var(--success)'  },
  error:   { bg: 'var(--danger-light)',  border: 'var(--danger)',   text: 'var(--danger)'   },
  warning: { bg: 'var(--warning-light)', border: 'var(--warning)',  text: 'var(--warning)'  },
  info:    { bg: 'var(--primary-light)', border: 'var(--primary)',  text: 'var(--primary)'  },
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 sm:w-96">
        {toasts.map(t => {
          const Icon   = ICONS[t.type]   || ICONS.info
          const colors = COLORS[t.type]  || COLORS.info
          return (
            <div key={t.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg
                         animate-in slide-in-from-right-full duration-300"
              style={{
                background:   colors.bg,
                border:       `1px solid ${colors.border}`,
                boxShadow:    'var(--shadow-lg)',
              }}>
              <Icon size={18} style={{ color: colors.text, flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                {t.message}
              </p>
              <button onClick={() => remove(t.id)} className="flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}