import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ErpNavItem } from '@/config/erpPortals'

interface SidebarNavProps {
  items: ErpNavItem[]
  collapsed: boolean
  onNavigate?: () => void
}

export function SidebarNav({ items, collapsed, onNavigate }: SidebarNavProps) {
  return (
    <>
      {items.map((item) => (
        <SidebarNavItem key={item.label} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
    </>
  )
}

function SidebarNavItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: ErpNavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  const location = useLocation()
  const hasChildren = Boolean(item.children?.length)
  const childActive = hasChildren
    ? item.children!.some((c) => location.pathname === c.to || location.pathname.startsWith(`${c.to}/`))
    : false
  const [open, setOpen] = useState(childActive)

  useEffect(() => {
    if (childActive) setOpen(true)
  }, [childActive])

  if (hasChildren) {
    if (collapsed) {
      const first = item.children![0]
      return (
        <NavLink
          to={first.to}
          title={item.label}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn('admin-sidebar-link admin-sidebar-link--collapsed', (isActive || childActive) && 'admin-sidebar-link--active')
          }
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" />
        </NavLink>
      )
    }

    return (
      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'admin-sidebar-link w-full',
            (childActive || open) && 'admin-sidebar-group-btn--open',
          )}
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="admin-sidebar-submenu">
            {item.children!.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn('admin-sidebar-sublink', isActive && 'admin-sidebar-sublink--active')
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!item.to) return null

  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn('admin-sidebar-link', collapsed && 'admin-sidebar-link--collapsed', isActive && 'admin-sidebar-link--active')
      }
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && <span className="admin-sidebar-badge">{item.badge}</span>}
        </>
      )}
    </NavLink>
  )
}
