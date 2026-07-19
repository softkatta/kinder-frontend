import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { useT } from '@/i18n/LanguageContext'
import { LOCALES } from '@/i18n/types'

interface LanguageDropdownProps {
  light?: boolean
}

export function LanguageDropdown({ light = false }: LanguageDropdownProps) {
  const { locale, setLocale } = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LOCALES.find((l) => l.code === locale)?.label ?? 'English'

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const select = (code: typeof locale) => {
    setLocale(code)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`lang-dropdown-trigger ${light ? 'lang-dropdown-trigger--light' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span>{current}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          className={`lang-dropdown-menu ${light ? 'lang-dropdown-menu--light' : ''}`}
          role="listbox"
          aria-label="Language"
        >
          {LOCALES.map(({ code, label }) => (
            <li key={code} role="option" aria-selected={locale === code}>
              <button
                type="button"
                onClick={() => select(code)}
                className={`lang-dropdown-item ${locale === code ? 'lang-dropdown-item--active' : ''}`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
