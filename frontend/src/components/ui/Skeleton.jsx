// ── Base skeleton block ──────────────────────────────────────────────────────
const Skeleton = ({ className = '', height, width, rounded = 'md' }) => (
  <div
    className={`skeleton ${className}`}
    style={{
      height:       height  || '16px',
      width:        width   || '100%',
      borderRadius: `var(--radius-${rounded})`,
    }}
  />
)

// ── Job card skeleton ────────────────────────────────────────────────────────
export const JobCardSkeleton = () => (
  <div className="card p-5 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 flex-1">
        <Skeleton width="44px" height="44px" rounded="xl" />
        <div className="flex-1 space-y-2">
          <Skeleton height="12px" width="55%" />
          <Skeleton height="17px" width="80%" />
        </div>
      </div>
      <Skeleton width="32px" height="32px" rounded="lg" />
    </div>
    <div className="flex gap-2">
      <Skeleton height="22px" width="68px" rounded="2xl" />
      <Skeleton height="22px" width="60px" rounded="2xl" />
      <Skeleton height="22px" width="76px" rounded="2xl" />
    </div>
    <div className="space-y-1.5">
      <Skeleton height="12px" width="48%" />
      <Skeleton height="12px" width="38%" />
    </div>
    <div className="flex gap-1.5">
      <Skeleton height="22px" width="52px" rounded="md" />
      <Skeleton height="22px" width="44px" rounded="md" />
      <Skeleton height="22px" width="60px" rounded="md" />
    </div>
    <div className="flex justify-between items-center pt-2"
      style={{ borderTop: '1px solid var(--border)' }}>
      <Skeleton height="11px" width="60px" />
      <Skeleton height="11px" width="70px" />
    </div>
  </div>
)

// ── Application row skeleton ─────────────────────────────────────────────────
export const ApplicationRowSkeleton = () => (
  <div className="card p-4 flex items-center gap-4">
    <Skeleton width="44px" height="44px" rounded="xl" />
    <div className="flex-1 space-y-2">
      <Skeleton height="14px" width="60%" />
      <Skeleton height="12px" width="40%" />
    </div>
    <Skeleton height="22px" width="80px" rounded="2xl" />
    <Skeleton height="30px" width="80px" rounded="lg" />
  </div>
)

// ── Company card skeleton ────────────────────────────────────────────────────
export const CompanyCardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <div className="flex items-start gap-3">
      <Skeleton width="48px" height="48px" rounded="xl" />
      <div className="flex-1 space-y-2">
        <Skeleton height="15px" width="70%" />
        <Skeleton height="12px" width="50%" />
      </div>
    </div>
    <div className="space-y-1.5">
      <Skeleton height="12px" width="60%" />
      <Skeleton height="12px" width="45%" />
    </div>
    <div className="flex justify-between items-center pt-2"
      style={{ borderTop: '1px solid var(--border)' }}>
      <Skeleton height="12px" width="60px" />
      <Skeleton height="28px" width="56px" rounded="md" />
    </div>
  </div>
)

// ── Notification skeleton ────────────────────────────────────────────────────
export const NotificationSkeleton = () => (
  <div className="card p-4 flex items-start gap-3">
    <Skeleton width="36px" height="36px" rounded="xl" />
    <div className="flex-1 space-y-2">
      <Skeleton height="13px" width="65%" />
      <Skeleton height="12px" width="90%" />
      <Skeleton height="12px" width="40%" />
    </div>
    <Skeleton width="24px" height="24px" rounded="lg" />
  </div>
)

// ── Profile skeleton ─────────────────────────────────────────────────────────
export const ProfileSkeleton = () => (
  <div className="space-y-5">
    <div className="card p-6">
      <div className="flex gap-4">
        <Skeleton width="80px" height="80px" rounded="2xl" />
        <div className="flex-1 space-y-2 pt-2">
          <Skeleton height="20px" width="200px" />
          <Skeleton height="14px" width="150px" />
          <div className="flex gap-2 pt-1">
            <Skeleton height="22px" width="80px" rounded="2xl" />
            <Skeleton height="22px" width="80px" rounded="2xl" />
          </div>
        </div>
      </div>
    </div>
    {[1, 2, 3].map(i => (
      <div key={i} className="card p-5 space-y-3">
        <Skeleton height="15px" width="30%" />
        <Skeleton height="12px" />
        <Skeleton height="12px" width="80%" />
        <Skeleton height="12px" width="60%" />
      </div>
    ))}
  </div>
)

// ── Job detail skeleton ──────────────────────────────────────────────────────
export const JobDetailSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-6">
    <div className="flex-1 space-y-5">
      <div className="card p-6 sm:p-7 space-y-4">
        <div className="flex gap-4">
          <Skeleton width="56px" height="56px" rounded="xl" />
          <div className="flex-1 space-y-2">
            <Skeleton height="22px" width="70%" />
            <Skeleton height="14px" width="40%" />
            <div className="flex gap-3 pt-1">
              <Skeleton height="12px" width="80px" />
              <Skeleton height="12px" width="80px" />
              <Skeleton height="12px" width="80px" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton height="22px" width="70px" rounded="2xl" />
          <Skeleton height="22px" width="80px" rounded="2xl" />
        </div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="card p-6 space-y-3">
          <Skeleton height="16px" width="30%" />
          <Skeleton height="12px" />
          <Skeleton height="12px" width="90%" />
          <Skeleton height="12px" width="75%" />
          <Skeleton height="12px" width="85%" />
        </div>
      ))}
    </div>
    <div className="w-full lg:w-72 space-y-4">
      <div className="card p-5 space-y-4">
        <Skeleton height="44px" rounded="xl" />
        <Skeleton height="44px" rounded="xl" />
        <div className="space-y-3 pt-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex justify-between">
              <Skeleton height="12px" width="40%" />
              <Skeleton height="12px" width="35%" />
            </div>
          ))}
        </div>
      </div>
      <div className="card p-5 space-y-3">
        <Skeleton height="14px" width="40%" />
        <Skeleton height="16px" width="60%" />
        <Skeleton height="12px" width="50%" />
      </div>
    </div>
  </div>
)

// ── Recruiter application card skeleton ─────────────────────────────────────
export const RecruiterAppSkeleton = () => (
  <div className="card p-5 flex flex-col sm:flex-row gap-4">
    <Skeleton width="56px" height="56px" rounded="full" />
    <div className="flex-1 space-y-2">
      <Skeleton height="16px" width="45%" />
      <Skeleton height="12px" width="55%" />
      <div className="flex gap-3 pt-1">
        <Skeleton height="12px" width="100px" />
        <Skeleton height="12px" width="80px" />
      </div>
      <div className="flex gap-1.5 pt-1">
        <Skeleton height="20px" width="52px" rounded="md" />
        <Skeleton height="20px" width="44px" rounded="md" />
        <Skeleton height="20px" width="60px" rounded="md" />
      </div>
      <div className="flex justify-between items-center pt-3"
        style={{ borderTop: '1px solid var(--border)' }}>
        <Skeleton height="12px" width="80px" />
        <Skeleton height="32px" width="120px" rounded="lg" />
      </div>
    </div>
  </div>
)

// ── Stat card skeleton ───────────────────────────────────────────────────────
export const StatCardSkeleton = () => (
  <div className="card p-5 flex items-start gap-4">
    <Skeleton width="44px" height="44px" rounded="xl" />
    <div className="space-y-2 flex-1">
      <Skeleton height="28px" width="60px" />
      <Skeleton height="13px" width="80%" />
    </div>
  </div>
)

// ── Alert row skeleton ───────────────────────────────────────────────────────
export const AlertSkeleton = () => (
  <div className="card p-5 flex items-start justify-between gap-4">
    <div className="flex items-start gap-3 flex-1">
      <Skeleton width="36px" height="36px" rounded="lg" />
      <div className="flex-1 space-y-2">
        <Skeleton height="14px" width="50%" />
        <div className="flex gap-2">
          <Skeleton height="20px" width="64px" rounded="2xl" />
          <Skeleton height="20px" width="56px" rounded="2xl" />
          <Skeleton height="20px" width="48px" rounded="2xl" />
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton width="64px" height="28px" rounded="lg" />
      <Skeleton width="32px" height="28px" rounded="lg" />
    </div>
  </div>
)

// ── Candidate card skeleton ──────────────────────────────────────────────────
export const CandidateCardSkeleton = () => (
  <div className="card p-5 space-y-4">
    <div className="flex items-start gap-3">
      <Skeleton width="48px" height="48px" rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton height="15px" width="60%" />
        <Skeleton height="12px" width="80%" />
        <Skeleton height="12px" width="45%" />
      </div>
    </div>
    <div className="flex gap-1.5">
      <Skeleton height="20px" width="48px" rounded="md" />
      <Skeleton height="20px" width="56px" rounded="md" />
      <Skeleton height="20px" width="44px" rounded="md" />
    </div>
    <div className="flex justify-between items-center pt-2"
      style={{ borderTop: '1px solid var(--border)' }}>
      <Skeleton height="12px" width="70px" />
      <div className="flex gap-2">
        <Skeleton height="28px" width="52px" rounded="lg" />
        <Skeleton height="28px" width="60px" rounded="lg" />
      </div>
    </div>
  </div>
)

// ── Education/Experience item skeleton ───────────────────────────────────────
export const TimelineSkeleton = () => (
  <div className="flex gap-3">
    <Skeleton width="36px" height="36px" rounded="lg" />
    <div className="flex-1 space-y-2 pb-4">
      <Skeleton height="14px" width="55%" />
      <Skeleton height="12px" width="40%" />
      <Skeleton height="12px" width="30%" />
    </div>
  </div>
)

// ── Dashboard skeleton ───────────────────────────────────────────────────────
export const DashboardSkeleton = () => (
  <div className="page-container py-6 sm:py-8 space-y-6">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton height="28px" width="280px" />
        <Skeleton height="16px" width="200px" />
      </div>
      <div className="flex gap-2">
        <Skeleton height="40px" width="120px" rounded="xl" />
        <Skeleton height="40px" width="120px" rounded="xl" />
      </div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}
    </div>
    <div className="card p-6">
      <Skeleton height="16px" width="200px" className="mb-5" />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="space-y-2 text-center">
            <Skeleton height="6px" rounded="2xl" />
            <Skeleton height="24px" width="32px" className="mx-auto" />
            <Skeleton height="12px" width="60px" className="mx-auto" />
          </div>
        ))}
      </div>
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center gap-3 py-3"
          style={{ borderTop: '1px solid var(--border)' }}>
          <Skeleton width="36px" height="36px" rounded="xl" />
          <div className="flex-1 space-y-1.5">
            <Skeleton height="13px" width="55%" />
            <Skeleton height="11px" width="40%" />
          </div>
          <Skeleton height="22px" width="80px" rounded="2xl" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="card p-4 flex items-start gap-3">
            <Skeleton width="40px" height="40px" rounded="xl" />
            <div className="flex-1 space-y-2">
              <Skeleton height="14px" width="70%" />
              <Skeleton height="12px" width="50%" />
              <div className="flex gap-2">
                <Skeleton height="20px" width="60px" rounded="2xl" />
                <Skeleton height="20px" width="50px" rounded="2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="card p-5 space-y-4">
          <Skeleton height="15px" width="50%" />
          <div className="flex gap-3">
            <Skeleton width="64px" height="64px" rounded="full" />
            <div className="flex-1 space-y-2">
              <Skeleton height="14px" width="70%" />
              <Skeleton height="12px" width="55%" />
            </div>
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="flex justify-between">
              <Skeleton height="12px" width="50%" />
              <Skeleton height="12px" width="25%" />
            </div>
          ))}
          <Skeleton height="36px" rounded="xl" />
        </div>
        <div className="card p-5 space-y-3">
          <Skeleton height="15px" width="40%" />
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton width="28px" height="28px" rounded="lg" />
              <div className="flex-1 space-y-1">
                <Skeleton height="12px" width="70%" />
                <Skeleton height="10px" width="50%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default Skeleton