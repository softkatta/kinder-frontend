import { useMemo, useState } from 'react'
import {
  type LucideIcon,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  CircleDot,
  GraduationCap,
  UserCog,
  CreditCard,
  IdCard,
  Building2,
  FileText,
  Calendar,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/utils/cn'

export interface AdvancedFilterField {
  key: string
  label: string
  icon?: LucideIcon
  type?: 'select' | 'date'
  options?: { value: string; label: string }[]
}

const defaultIcons: Record<string, LucideIcon> = {
  status: CircleDot,
  class: GraduationCap,
  role: UserCog,
  method: CreditCard,
  type: IdCard,
  card_type: IdCard,
  branch: Building2,
  plan: FileText,
  date: Calendar,
  job: ClipboardList,
}

function fieldIcon(field: AdvancedFilterField): LucideIcon {
  return field.icon ?? defaultIcons[field.key] ?? CircleDot
}

function isActiveValue(value: string | undefined, field: AdvancedFilterField): boolean {
  if (field.type === 'date') return Boolean(value)
  return Boolean(value && value !== 'all')
}

export function AdminAdvancedFilters({
  fields,
  values,
  onChange,
  onReset,
  subtitle,
  defaultCollapsed = true,
  className,
}: {
  fields: AdvancedFilterField[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onReset: () => void
  subtitle?: string
  defaultCollapsed?: boolean
  className?: string
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const activeCount = useMemo(
    () => fields.filter((f) => isActiveValue(values[f.key], f)).length,
    [fields, values],
  )

  const autoSubtitle = subtitle ?? fields.map((f) => f.label.toLowerCase()).join(', ')
  const statusText = activeCount === 0
    ? 'No filters applied'
    : `${activeCount} filter${activeCount > 1 ? 's' : ''} applied`

  if (!fields.length) return null

  return (
    <div className={cn('admin-advanced-filters', className)}>
      <button
        type="button"
        className="admin-advanced-filters-header"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
      >
        <div className="admin-advanced-filters-header-icon">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="admin-advanced-filters-title">Advanced Filters</p>
          <p className="admin-advanced-filters-subtitle">{autoSubtitle}</p>
        </div>
        {activeCount > 0 && (
          <span className="admin-advanced-filters-count">{activeCount}</span>
        )}
        {collapsed ? (
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
        ) : (
          <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" />
        )}
      </button>

      {!collapsed && (
        <>
          <div className="admin-advanced-filters-body">
            {fields.map((field) => {
              const Icon = fieldIcon(field)
              const value = values[field.key] ?? (field.type === 'date' ? '' : 'all')

              if (field.type === 'date') {
                return (
                  <div key={field.key} className="admin-advanced-filters-field">
                    <label className="admin-advanced-filters-label" htmlFor={`filter-${field.key}`}>
                      {field.label}
                    </label>
                    <div className="admin-advanced-filters-select-wrap">
                      <Icon className="admin-advanced-filters-select-icon" />
                      <input
                        id={`filter-${field.key}`}
                        type="date"
                        value={value}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        className="admin-advanced-filters-date"
                      />
                    </div>
                  </div>
                )
              }

              return (
                <div key={field.key} className="admin-advanced-filters-field">
                  <label className="admin-advanced-filters-label" htmlFor={`filter-${field.key}`}>
                    {field.label}
                  </label>
                  <div className="admin-advanced-filters-select-wrap">
                    <Icon className="admin-advanced-filters-select-icon" />
                    <select
                      id={`filter-${field.key}`}
                      value={value}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      className="admin-advanced-filters-select"
                    >
                      {(field.options ?? []).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="admin-advanced-filters-footer">
            <p className="admin-advanced-filters-status">{statusText}</p>
            <button
              type="button"
              className="admin-advanced-filters-reset"
              onClick={onReset}
              disabled={activeCount === 0}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function buildFilterSubtitle(labels: string[]): string {
  return labels.map((l) => l.toLowerCase()).join(', ')
}
