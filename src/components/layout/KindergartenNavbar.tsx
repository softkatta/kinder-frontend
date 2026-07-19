import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, GraduationCap, Menu, X } from 'lucide-react'
import { mediaUrl } from '@/utils/mediaUrl'

export interface NavChildLink {
  to: string
  label: string
}

export interface NavLinkItem {
  label: string
  to?: string
  end?: boolean
  children?: NavChildLink[]
}

interface KindergartenNavbarProps {
  schoolName: string
  navLinks: NavLinkItem[]
  applyLabel: string
  portalLabel: string
  portalHref?: string
  bookTourLabel: string
  open: boolean
  onToggle: () => void
  onNavigate: () => void
  brandGradient: string
  logoUrl?: string | null
}

function isChildActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(`${to}/`)
}

function isNavItemActive(pathname: string, item: NavLinkItem) {
  if (item.to) return isChildActive(pathname, item.to)
  return item.children?.some((child) => isChildActive(pathname, child.to)) ?? false
}

function NavDropdown({ item, onNavigate }: { item: NavLinkItem; onNavigate: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { pathname } = useLocation()
  const active = isNavItemActive(pathname, item)

  const openMenu = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setDropdownOpen(true)
  }

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 150)
  }

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  return (
    <div
      className="kg-navbar-dropdown"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={`kg-navbar-link kg-navbar-dropdown-trigger ${active ? 'kg-navbar-link--active' : ''}`}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        onClick={() => setDropdownOpen((v) => !v)}
      >
        {item.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {dropdownOpen && (
        <div className="kg-navbar-dropdown-menu" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
          <div className="kg-navbar-dropdown-panel" role="menu">
            {item.children!.map((child) => (
              <Link
                key={child.to}
                to={child.to}
                role="menuitem"
                className={`kg-navbar-dropdown-item ${isChildActive(pathname, child.to) ? 'kg-navbar-dropdown-item--active' : ''}`}
                onClick={onNavigate}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NavItems({ navLinks, onNavigate }: { navLinks: NavLinkItem[]; onNavigate: () => void }) {
  return (
    <>
      {navLinks.map((item) =>
        item.children ? (
          <NavDropdown key={item.label} item={item} onNavigate={onNavigate} />
        ) : (
          <NavLink
            key={item.to}
            to={item.to!}
            end={item.end ?? item.to === '/'}
            className={({ isActive }) => `kg-navbar-link ${isActive ? 'kg-navbar-link--active' : ''}`}
          >
            {item.label}
          </NavLink>
        ),
      )}
    </>
  )
}

export function KindergartenNavbar({
  schoolName,
  navLinks,
  applyLabel,
  portalLabel,
  portalHref = '/login',
  bookTourLabel,
  open,
  onToggle,
  onNavigate,
  brandGradient,
  logoUrl,
}: KindergartenNavbarProps) {
  const logoSrc = logoUrl ? mediaUrl(logoUrl) : ''
  return (
    <header className="kg-navbar">
      <div className="kg-navbar-shell mx-auto max-w-7xl px-3 sm:px-4">
        <div className="kg-navbar-track">
          <Link
            to="/"
            className={`kg-navbar-brand group${logoSrc ? ' kg-navbar-brand--logo-only' : ''}`}
            onClick={onNavigate}
          >
            {logoSrc ? (
              <img src={logoSrc} alt={schoolName} className="kg-navbar-logo-img-only" />
            ) : (
              <>
                <div className="kg-navbar-logo overflow-hidden" style={{ background: brandGradient }}>
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <div className="min-w-0 overflow-hidden">
                  <span className="font-display text-base sm:text-lg md:text-xl font-bold text-ink leading-tight block truncate">
                    {schoolName}
                  </span>
                  <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Kindergarten</span>
                </div>
              </>
            )}
          </Link>

          <nav className="kg-navbar-pill" aria-label="Main">
            <NavItems navLinks={navLinks} onNavigate={onNavigate} />
          </nav>

          <div className="kg-navbar-actions">
            <Link to="/book-tour" className="kg-navbar-portal">{bookTourLabel}</Link>
            <Link to={portalHref} className="kg-navbar-portal">{portalLabel}</Link>
            <Link to="/admission" className="btn-kidscholl !py-2.5 !px-5 !text-sm">{applyLabel}</Link>
          </div>

          <button
            type="button"
            className="kg-navbar-menu-btn"
            onClick={onToggle}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="kg-navbar-mobile animate-fade-in-up">
            <nav className="space-y-3" aria-label="Mobile">
              {navLinks.map((item) =>
                item.children ? (
                  <div key={item.label}>
                    <p className="kg-navbar-mobile-group">{item.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className="kg-navbar-mobile-link"
                          onClick={onNavigate}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.to}
                    to={item.to!}
                    className="kg-navbar-mobile-link block text-center"
                    onClick={onNavigate}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Link to={portalHref} onClick={onNavigate} className="kg-navbar-mobile-link text-center">
                {portalLabel}
              </Link>
              <Link to="/book-tour" onClick={onNavigate} className="kg-navbar-mobile-link text-center">
                {bookTourLabel}
              </Link>
            </div>
            <Link to="/admission" onClick={onNavigate} className="btn-kidscholl w-full justify-center mt-4">
              {applyLabel}
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
