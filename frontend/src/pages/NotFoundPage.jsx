import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui'

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center p-6"
    style={{ background: 'var(--bg)' }}>
    <div className="text-center max-w-md animate-fade-in-up">

      {/* Number */}
      <div className="relative mb-8">
        <p className="text-[120px] sm:text-[160px] font-bold leading-none select-none"
          style={{
            background: 'linear-gradient(135deg, var(--primary-light), var(--border))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'var(--primary)' }}>
            <Search size={28} color="white" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        Page not found
      </h1>
      <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/">
          <Button variant="primary" size="lg" className="gap-2 w-full sm:w-auto">
            <Home size={16} /> Go home
          </Button>
        </Link>
        <Link to="/jobs">
          <Button variant="secondary" size="lg" className="gap-2 w-full sm:w-auto">
            <Search size={16} /> Browse jobs
          </Button>
        </Link>
      </div>
    </div>
  </div>
)

export default NotFoundPage