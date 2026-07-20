import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  GraduationCap, LogOut, Menu, X, Bell, Search, ExternalLink, Sparkles,
  ChevronRight, PanelLeftClose, PanelLeft, HelpCircle,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout, selectAuth } from '@/store/slices/authSlice'
import { authApi, notificationApi, searchApi } from '@/api/services'
import { getRoleLabel } from '@/utils/auth'
import { cn } from '@/utils/cn'
import { adminImages } from '@/config/adminCatalog'
import { AdminAvatar, AdminBgCard } from '@/components/admin/AdminStats'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { mediaUrl } from '@/utils/mediaUrl'
import { clearEntitlementsCache } from '@/lib/entitlements'
import type { ErpPortalConfig } from '@/config/erpPortals'

interface YearCardData {
  label: string
  students: number
  staff: number
}

export default function ErpLayout({
  config,
  yearCard,
}: {
  config: ErpPortalConfig
  yearCard?: YearCardData | null
}) {
  const { portalLabel, homePath, nav, pageMeta, showYearCard = true, compactTopbar = false } = config
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, roles } = useAppSelector(selectAuth)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const primaryRole = roles[0]
  const meta = pageMeta[location.pathname] ?? { title: portalLabel, desc: '' }
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<{ id: number; title: string; body: string; time: string; read: boolean }[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ type: string; label: string; subtitle: string; url: string }[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { logoUrl, schoolName } = useSchoolBranding()
  const logoSrc = logoUrl ? mediaUrl(logoUrl) : ''

  const loadNotifications = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.list(),
        notificationApi.unreadCount(),
      ])
      setNotifications((listRes.data.data as typeof notifications) ?? [])
      setUnreadCount((countRes.data.data as { count?: number })?.count ?? 0)
    } catch {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [])

  useEffect(() => {
    void loadNotifications()
    const timer = setInterval(() => void loadNotifications(), 60000)
    return () => clearInterval(timer)
  }, [loadNotifications])

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      void loadNotifications()
    } catch { /* ignore */ }
  }

  const runSearch = useCallback(async (q: string) => {
    const term = q.trim()
    if (term.length < 2) {
      setSearchResults([])
      return
    }
    try {
      const res = await searchApi.query(term)
      setSearchResults((res.data.data as typeof searchResults) ?? [])
      setSearchOpen(true)
    } catch {
      setSearchResults([])
    }
  }, [])

  const onSearchChange = (value: string) => {
    setSearchQuery(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => void runSearch(value), 300)
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    clearEntitlementsCache()
    dispatch(logout())
    navigate('/login')
  }

  const sidebarContent = (
    <>
      <div className={cn('admin-sidebar-brand', collapsed && 'admin-sidebar-brand--collapsed')}>
        <Link to={homePath} className="flex items-center gap-3 min-w-0">
          {logoSrc ? (
            <img src={logoSrc} alt={schoolName} className={cn('object-contain', collapsed ? 'h-9 w-9' : 'h-10 w-auto max-w-[140px]')} />
          ) : (
            <div className="admin-sidebar-logo">
              <GraduationCap className="h-5 w-5" />
            </div>
          )}
          {!collapsed && !logoSrc && (
            <div className="min-w-0">
              <p className="font-display text-base font-bold text-ink truncate">{schoolName || 'Little Stars'}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500">{portalLabel}</p>
            </div>
          )}
          {!collapsed && logoSrc && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500 truncate">{portalLabel}</p>
          )}
        </Link>
        <button
          type="button"
          className="admin-sidebar-toggle hidden lg:flex"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
        <button
          type="button"
          className="lg:hidden ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {!collapsed && showYearCard && (
        <AdminBgCard
          image={adminImages.sidebar}
          overlay="sky"
          className="admin-sidebar-year-card"
          contentClassName="p-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-200" />
            <span className="text-xs font-bold uppercase tracking-wide text-sky-100">Academic Year</span>
          </div>
          <p className="mt-1 font-display text-lg font-bold text-white">
            {yearCard?.label ?? '—'}
          </p>
          <p className="text-xs text-sky-100 mt-0.5">
            {yearCard
              ? `${yearCard.students} students · ${yearCard.staff} staff`
              : 'Loading...'}
          </p>
        </AdminBgCard>
      )}

      <nav className="admin-sidebar-nav">
        {!collapsed && (
          <p className="admin-sidebar-label">Main Menu</p>
        )}
        <SidebarNav items={nav} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
      </nav>

      {!collapsed && (
        <div className="admin-sidebar-help">
          <HelpCircle className="h-4 w-4 text-primary-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">Need help?</p>
            <p className="text-[11px] text-slate-500 truncate">support@littlestars.com</p>
          </div>
        </div>
      )}

      <div className="admin-sidebar-footer">
        {!collapsed ? (
          <div className="admin-sidebar-user">
            <div className="flex items-center gap-3">
              <AdminAvatar name={user?.name ?? portalLabel} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{user?.name}</p>
                <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
              </div>
            </div>
            {primaryRole && (
              <span className="admin-sidebar-role">{getRoleLabel(primaryRole)}</span>
            )}
            <button type="button" onClick={handleLogout} className="admin-sidebar-logout">
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-xl p-2.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  )

  return (
    <div className="admin-shell flex min-h-screen">
      <aside
        className={cn(
          'admin-sidebar fixed inset-y-0 left-0 z-50 hidden flex-col transition-all duration-300 lg:flex',
          collapsed ? 'w-[76px]' : 'w-[272px]',
        )}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Close" />
          <aside className="admin-sidebar absolute inset-y-0 left-0 flex w-[288px] max-w-[88vw] flex-col shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className={cn('admin-content flex min-h-screen flex-1 flex-col transition-all duration-300', collapsed ? 'lg:pl-[76px]' : 'lg:pl-[272px]')}>
        <header className="admin-topbar sticky top-0 z-40">
          <div className="admin-topbar-inner">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="admin-topbar-menu lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              {!compactTopbar && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <Link to={homePath} className="hover:text-primary-600">{portalLabel}</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-primary-600">{meta.title}</span>
                  </div>
                  <h1 className="font-display text-lg font-bold text-ink truncate sm:text-xl">{meta.title}</h1>
                  {meta.desc && <p className="text-xs text-slate-500 truncate hidden sm:block">{meta.desc}</p>}
                </div>
              )}
              {compactTopbar && (
                <p className="text-sm font-semibold text-slate-500 hidden sm:block">{portalLabel} Portal</p>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="admin-topbar-search hidden md:flex relative">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Quick search..."
                  className="admin-topbar-search-input"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                />
                {searchOpen && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
                    {searchResults.map((item) => (
                      <button
                        key={`${item.type}-${item.url}-${item.label}`}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-violet-50 border-b border-slate-50 last:border-0"
                        onMouseDown={() => {
                          navigate(item.url)
                          setSearchOpen(false)
                          setSearchQuery('')
                          setSearchResults([])
                        }}
                      >
                        <p className="text-sm font-semibold text-ink">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.subtitle}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  className="admin-icon-btn relative"
                  aria-label="Notifications"
                  onClick={() => {
                    setNotifOpen((v) => !v)
                    if (!notifOpen) void loadNotifications()
                  }}
                >
                  <Bell className="h-[18px] w-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-bold text-ink">Notifications</p>
                      <div className="flex items-center gap-3">
                        <Link
                          to={`${homePath}/notifications`}
                          className="text-xs font-semibold text-slate-500 hover:text-primary-600"
                          onClick={() => setNotifOpen(false)}
                        >
                          View all
                        </Link>
                        {unreadCount > 0 && (
                          <button type="button" className="text-xs font-semibold text-primary-600" onClick={() => void markAllRead()}>
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-slate-500 text-center">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`border-b border-slate-50 px-4 py-3 ${n.read ? 'opacity-70' : ''}`}>
                          <p className="text-sm font-semibold text-ink">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <Link to="/" className="admin-icon-btn hidden sm:flex" title="Public website">
                <ExternalLink className="h-[18px] w-[18px]" />
              </Link>
              <div className="hidden sm:block pl-1 border-l border-slate-200">
                <AdminAvatar name={user?.name ?? portalLabel} size="sm" />
              </div>
            </div>
          </div>
        </header>

        <main className="admin-main flex-1">
          <div className="admin-page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
