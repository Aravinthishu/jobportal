const Avatar = ({ name = '', src = null, size = 'md', className = '' }) => {
  const sizes = {
    sm:  'w-8 h-8 text-xs',
    md:  'w-10 h-10 text-sm',
    lg:  'w-14 h-14 text-lg',
    xl:  'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-3xl',
  }
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={`${sizes[size]} rounded-full flex-shrink-0 flex items-center
      justify-center font-semibold overflow-hidden ${className}`}
      style={{ background: 'var(--primary-light)', color: 'var(--primary-text)' }}>
      {src
        ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : initials}
    </div>
  )
}

export default Avatar