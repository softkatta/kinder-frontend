import { useEffect, useState } from 'react'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { FadeIn } from '@/components/ui/Motion'
import { useT } from '@/i18n/LanguageContext'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { getSchoolName } from '@/config/siteContent'
import { useSchoolProfile } from '@/contexts/SchoolProfileContext'

const titleMap: Record<string, { en: string; mr: string }> = {
  'privacy-policy': { en: 'Privacy Policy', mr: 'गोपनीयता धोरण' },
  terms: { en: 'Terms & Conditions', mr: 'अटी व शर्ती' },
  'refund-policy': { en: 'Refund Policy', mr: 'परतावा धोरण' },
}

export default function LegalPage({ slug }: { slug: string; title?: string }) {
  const { t, locale } = useT()
  const profile = useSchoolProfile()
  const [content, setContent] = useState('')

  const pageTitle = titleMap[slug]?.[locale] || slug

  useEffect(() => {
    fetchLocalizedPublic((loc) => publicApi.page(slug, loc), locale)
      .then((page) => {
        const p = page as Record<string, string>
        setContent(p.body || p.content || '')
      })
      .catch(() => setContent(`<p>${t.common.legalSoon}</p>`))
  }, [slug, locale, t.common.legalSoon])

  const school = getSchoolName(profile, true, locale)

  return (
    <div>
      <PublicPageHero
        imageKey="page_legal_image"
        label={t.pages.legal.label}
        title={pageTitle}
        subtitle={t.pages.legal.subtitle(pageTitle, school)}
      />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="default" />
        <div className="mx-auto max-w-3xl px-4 relative z-10">
          <FadeIn>
            <div className="kidscholl-form-card prose prose-sm max-w-none prose-headings:font-display prose-headings:text-ink prose-a:text-orange-500" dangerouslySetInnerHTML={{ __html: content }} />
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
