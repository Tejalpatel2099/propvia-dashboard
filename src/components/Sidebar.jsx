import { isSupabaseConfigured } from '../supabaseClient'

const NAV = [
    { href: '#overview', label: 'Overview', icon: 'M3 12l9-8 9 8v8a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2z' },
    { href: '#analytics', label: 'Analytics', icon: 'M4 20V10m6 10V4m6 16v-7' },
    { href: '#listings', label: 'Listings', icon: 'M4 5h16M4 12h16M4 19h16' },
]

export default function Sidebar({ active, onNavigate }) {
    return (
        <aside className="sidebar">
            <a className="brand" href="#overview" onClick={() => onNavigate('#overview')}>
                <span className="brand-block" aria-hidden="true" />
                <span className="brand-name">
                    Propvia
                    <span className="brand-sub">Property Dashboard</span>
                </span>
            </a>

            <nav className="nav" aria-label="Dashboard sections">
                {NAV.map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${active === item.href ? 'nav-item-active' : ''}`}
                        onClick={() => onNavigate(item.href)}
                        aria-current={active === item.href ? 'true' : undefined}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d={item.icon} />
                        </svg>
                        {item.label}
                    </a>
                ))}
            </nav>

            <div className="sidebar-foot">
                <span className={`db-dot ${isSupabaseConfigured ? 'db-dot-on' : 'db-dot-off'}`} aria-hidden="true" />
                {isSupabaseConfigured ? 'Supabase connected' : 'Demo data mode'}
            </div>
        </aside>
    )
}
