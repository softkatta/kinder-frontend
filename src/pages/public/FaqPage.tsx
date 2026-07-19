import { useEffect, useState } from 'react'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { FadeIn } from '@/components/ui/Motion'
import { useT } from '@/i18n/LanguageContext'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { getFaqItems } from '@/config/siteContent'

export default function FaqPage() {
  const { t, locale } = useT()
  const [apiFaqs, setApiFaqs] = useState<{ id: number; question: string; answer: string }[]>([])
  const [open, setOpen] = useState<number | null>(null)
  const p = t.pages.faq

  useEffect(() => {
    fetchLocalizedPublic((loc) => publicApi.faqs(loc), locale)
      .then((data) => setApiFaqs((data as { id: number; question: string; answer: string }[]) || []))
      .catch(() => {})
  }, [locale])

  const faqs = getFaqItems(locale, apiFaqs)

  return (
    <div>
      <PublicPageHero imageKey="page_faq_image" label={p.label} title={p.title} subtitle={p.subtitle} />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="default" />
        <div className="mx-auto max-w-3xl px-4 relative z-10">
          <KidschollSection label={p.help} title={p.answers} />
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <FadeIn key={f.id} delay={i * 0.04}>
                <div className={`kidscholl-faq-item ${open === f.id ? 'open' : ''}`}>
                  <button type="button" className="w-full p-5 text-left font-display font-bold text-ink flex justify-between items-center gap-4 hover:bg-orange-50/50 transition" onClick={() => setOpen(open === f.id ? null : f.id)}>
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0"><HelpCircle className="h-4 w-4 text-violet-600" /></span>
                      {f.question}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-orange-500 shrink-0 transition-transform ${open === f.id ? 'rotate-180' : ''}`} />
                  </button>
                  {open === f.id && <div className="px-5 pb-5 pl-16 text-slate-600 text-sm border-t border-orange-100 pt-4 leading-relaxed">{f.answer}</div>}
                </div>
              </FadeIn>
            ))}
            {faqs.length === 0 && <p className="text-center text-slate-400 py-12">{t.common.emptyFaqs}</p>}
          </div>
        </div>
      </section>
      <section className="section bg-white pb-20 text-center relative overflow-hidden">
        <SectionDecorations variant="cta" />
        <div className="relative z-10">
        <KidschollSection label={p.moreQuestions} title={p.weAreHere} subtitle={p.replyIn24} />
        <Link to="/contact" className="btn-kidscholl">{t.common.contactUs}</Link>
        </div>
      </section>
    </div>
  )
}
