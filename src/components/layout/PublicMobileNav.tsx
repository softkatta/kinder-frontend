import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Image, Phone, GraduationCap } from 'lucide-react'
import { useT } from '@/i18n/LanguageContext'

export function PublicMobileNav() {
  const { t } = useT()

  const links = [
    { to: '/', label: t.nav.home, icon: Home, end: true },
    { to: '/programs', label: t.nav.programs, icon: BookOpen },
    { to: '/gallery', label: t.nav.gallery, icon: Image },
    { to: '/admission', label: t.nav.admission, icon: GraduationCap },
    { to: '/contact', label: t.nav.contact, icon: Phone },
  ]

  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-sky-100 safe-bottom shadow-[0_-4px_24px_rgba(56,189,248,0.08)]">
      <div className="flex justify-around py-1.5 max-w-lg mx-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] text-[10px] font-bold transition ${
                isActive ? 'text-sky-600' : 'text-slate-400'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="truncate max-w-[56px]">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
