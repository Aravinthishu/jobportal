import Navbar from './Navbar'

export default function AppLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main>{children}</main>
    </div>
  )
}