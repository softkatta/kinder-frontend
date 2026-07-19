import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  Search, ChevronDown, ChevronRight, ArrowLeft, BookOpen, AlertTriangle, Lightbulb,
} from 'lucide-react'
import { AdminPageHeader, AdminPageShell, AdminBtn, AdminPanel } from '@/components/admin/AdminUi'
import {
  GUIDE_SECTIONS,
  EQUIPMENT_TIERS,
  STREAMING_METHODS,
  SETUP_STEPS,
  CHECKLIST_ITEMS,
  TROUBLESHOOTING,
  BEST_PRACTICES,
  GUIDE_WARNINGS,
} from '@/content/liveStreamSetupGuide'
import { cn } from '@/utils/cn'

const tierStyles = {
  sky: 'border-sky-200 bg-gradient-to-br from-sky-50 to-white',
  violet: 'border-violet-200 bg-gradient-to-br from-violet-50 to-white',
  amber: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white',
}

export default function LiveStreamSetupGuidePage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const eventTitle = searchParams.get('event') ?? undefined
  const isTeacher = location.pathname.startsWith('/teacher')
  const livePath = isTeacher ? '/teacher/live' : '/admin/live-streams'
  const portalLabel = isTeacher ? 'Teacher' : 'Admin'
  const portalHome = isTeacher ? '/teacher' : '/admin'

  const [query, setQuery] = useState('')
  const [activeSection, setActiveSection] = useState(GUIDE_SECTIONS[0].id)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [openIssues, setOpenIssues] = useState<Record<string, boolean>>({})

  const q = query.trim().toLowerCase()

  const filteredSteps = useMemo(() => {
    if (!q) return SETUP_STEPS
    return SETUP_STEPS.filter(
      (s) => s.title.toLowerCase().includes(q) || s.detail.toLowerCase().includes(q),
    )
  }, [q])

  const filteredTroubleshooting = useMemo(() => {
    if (!q) return TROUBLESHOOTING
    return TROUBLESHOOTING.filter(
      (t) => t.issue.toLowerCase().includes(q)
        || t.solutions.some((s) => s.toLowerCase().includes(q)),
    )
  }, [q])

  const showSection = useCallback((sectionId: string, haystack: string) => {
    if (!q) return true
    return haystack.toLowerCase().includes(q) || sectionId.includes(q)
  }, [q])

  useEffect(() => {
    const ids = GUIDE_SECTIONS.map((s) => s.id)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [q])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(id)
  }

  const checklistDone = CHECKLIST_ITEMS.filter((c) => checked[c.id]).length

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Live Stream Setup Guide"
        subtitle={
          eventTitle
            ? `Complete setup instructions for “${eventTitle}”`
            : 'Step-by-step equipment, streaming, and ERP configuration for school events.'
        }
        breadcrumbs={[
          { label: portalLabel, to: portalHome },
          { label: 'Live Streams', to: livePath },
          { label: 'Setup Guide' },
        ]}
        actions={
          <AdminBtn variant="secondary" to={livePath}>
            <ArrowLeft className="h-4 w-4" /> Back to Live Streams
          </AdminBtn>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search steps, equipment, issues…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <p className="text-xs font-semibold text-slate-500">
          Checklist: {checklistDone}/{CHECKLIST_ITEMS.length} complete
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="admin-guide-sidebar rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="admin-sidebar-label px-2 mb-2 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" /> Sections
            </p>
            <ul className="space-y-0.5">
              {GUIDE_SECTIONS.map((section, i) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(section.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition',
                      activeSection === section.id
                        ? 'bg-violet-100 text-violet-800'
                        : 'text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <span className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                      activeSection === section.id ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500',
                    )}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 truncate">{section.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 space-y-10">
          <div className="grid gap-3 sm:grid-cols-2">
            {GUIDE_WARNINGS.map((w) => (
              <div
                key={w.title}
                className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3"
              >
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 text-sm">{w.title}</p>
                  <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">{w.body}</p>
                </div>
              </div>
            ))}
          </div>

          {(showSection('equipment', EQUIPMENT_TIERS.map((t) => t.title + t.items.join('')).join(''))) && (
            <section id="equipment" className="scroll-mt-24">
              <SectionHeading title="Equipment Required" />
              <div className="grid gap-4 md:grid-cols-3">
                {EQUIPMENT_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    className={cn('rounded-2xl border p-5 shadow-sm', tierStyles[tier.tone])}
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{tier.subtitle}</p>
                    <h3 className="font-display text-lg font-bold text-ink mt-1">{tier.title}</h3>
                    <ul className="mt-4 space-y-2">
                      {tier.items.map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-slate-700">
                          <ChevronRight className="h-4 w-4 shrink-0 text-violet-500 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(showSection('methods', STREAMING_METHODS.map((m) => m.flow).join(''))) && (
            <section id="methods" className="scroll-mt-24">
              <SectionHeading title="Streaming Methods" />
              <div className="grid gap-4 sm:grid-cols-2">
                {STREAMING_METHODS.map((method) => (
                  <div key={method.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase text-violet-600">{method.title}</p>
                    <p className="font-display font-bold text-ink mt-2 text-base">{method.flow}</p>
                    {method.tip && (
                      <p className="mt-3 text-sm text-slate-600 flex gap-2">
                        <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
                        {method.tip}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {filteredSteps.length > 0 && (
            <section id="steps" className="scroll-mt-24">
              <SectionHeading title="Step-by-Step Setup" />
              <div className="space-y-3">
                {filteredSteps.map((step) => (
                  <div
                    key={step.step}
                    className={cn(
                      'admin-guide-step-card rounded-2xl border p-4 sm:p-5',
                      step.erp ? 'border-violet-200 bg-violet-50/40' : 'border-slate-200 bg-white',
                    )}
                  >
                    <div className="flex gap-4">
                      <div className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold',
                        step.erp ? 'bg-violet-600 text-white' : 'bg-sky-100 text-sky-700',
                      )}
                      >
                        {step.step}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-ink">{step.title}</h3>
                          {step.erp && (
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-700">
                              ERP
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">{step.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(showSection('checklist', CHECKLIST_ITEMS.map((c) => c.label).join(''))) && (
            <section id="checklist" className="scroll-mt-24">
              <SectionHeading title="Pre-Stream Checklist" subtitle="Verify everything before Start Live" />
              <AdminPanel>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CHECKLIST_ITEMS.map((item) => (
                    <label
                      key={item.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition',
                        checked[item.id]
                          ? 'border-emerald-300 bg-emerald-50/60'
                          : 'border-slate-200 hover:border-violet-200 hover:bg-violet-50/30',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={!!checked[item.id]}
                        onChange={(e) => setChecked({ ...checked, [item.id]: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className={cn('text-sm font-semibold', checked[item.id] ? 'text-emerald-800' : 'text-ink')}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </AdminPanel>
            </section>
          )}

          {filteredTroubleshooting.length > 0 && (
            <section id="troubleshooting" className="scroll-mt-24">
              <SectionHeading title="Troubleshooting" subtitle="Common issues and fixes" />
              <div className="space-y-2">
                {filteredTroubleshooting.map((item) => {
                  const open = openIssues[item.issue] ?? false
                  return (
                    <div key={item.issue} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenIssues({ ...openIssues, [item.issue]: !open })}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
                      >
                        <span className="font-semibold text-ink text-sm">{item.issue}</span>
                        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition', open && 'rotate-180')} />
                      </button>
                      {open && (
                        <ul className="border-t border-slate-100 px-4 py-3 space-y-2 bg-slate-50/50">
                          {item.solutions.map((sol) => (
                            <li key={sol} className="text-sm text-slate-600 flex gap-2">
                              <span className="text-violet-500 font-bold">→</span>
                              {sol}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {(showSection('best-practices', BEST_PRACTICES.join(''))) && (
            <section id="best-practices" className="scroll-mt-24">
              <SectionHeading title="Best Practices" />
              <div className="grid gap-2 sm:grid-cols-2">
                {BEST_PRACTICES.map((tip) => (
                  <div
                    key={tip}
                    className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3"
                  >
                    <Lightbulb className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-900">{tip}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {q && filteredSteps.length === 0 && filteredTroubleshooting.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-8">No results for “{query}”. Try another keyword.</p>
          )}

          <div className="rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-violet-900">
              Ready to configure cameras in the ERP?
            </p>
            <Link
              to={livePath}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700 transition"
            >
              Open Live Stream Management
            </Link>
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}
