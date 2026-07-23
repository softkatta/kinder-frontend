import { Link } from 'react-router-dom'
import {
  ArrowRight, BookOpen, Sparkles, MapPin,
  CheckCircle2,
  Award, FileText, School, ClipboardList,
  Palette, Music, Bus, Monitor, TreePine,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import { FadeIn } from '@/components/ui/Motion'
import { mediaUrl } from '@/utils/mediaUrl'
import { KidschollSection } from '@/components/design/KidschollSection'
import { HomeWelcomeBento } from '@/components/design/HomeWelcomeBento'
import { HomeStatsStrip } from '@/components/home/HomeStatsStrip'
import { HomeAboutSection } from '@/components/home/HomeAboutSection'
import { HomeLearningElementsSection } from '@/components/home/HomeLearningElementsSection'
import { ProgramCard } from '@/components/home/ProgramCard'
import { FacilityCard, facilityCardShapes, facilityCardTones } from '@/components/home/FacilityCard'
import { HomeWhySection } from '@/components/home/HomeWhySection'
import { HomeEnrollSection } from '@/components/home/HomeEnrollSection'
import { HomeGallerySection, galleryPreviewShapes, galleryPreviewTones } from '@/components/home/HomeGallerySection'
import { HomeEventsSection, type HomeEventItem } from '@/components/home/HomeEventsSection'
import { HomeTestimonialsSection } from '@/components/home/HomeTestimonialsSection'
import type { HomeTestimonialItem } from '@/components/home/HomeTestimonialsSection.types'
import { HomeSection } from '@/components/home/HomeSection'
import { useT } from '@/i18n/LanguageContext'
import { getSchoolField, getSchoolName, getYearsSince, getProgramCopy, getHeroContent, type SchoolProfile } from '@/config/siteContent'
import { getProfileImage } from '@/config/pageImages'
import { getProgramPrices, formatProgramPriceDisplay } from '@/utils/programPricing'
import { homeContentFromProfile } from '@/utils/homeProfile'

const programEmojis: Record<string, string> = {
  nursery: '🌱',
  lkg: '🌟',
  ukg: '🚀',
}

const facilityIcons: Record<string, typeof BookOpen> = {
  smart: Monitor,
  playground: TreePine,
  library: BookOpen,
  art: Palette,
  music: Music,
  transport: Bus,
}

const enrollIcons = [FileText, School, ClipboardList, Award]

function mapTestimonials(rows: Record<string, unknown>[]): HomeTestimonialItem[] {
  return rows.map((raw) => ({
    id: raw.id as number | string,
    author_name: String(raw.author ?? raw.title ?? ''),
    role: String(raw.role ?? ''),
    message: String(raw.body ?? raw.message ?? ''),
    rating: Number(raw.rating) || 5,
    image_path: raw.image ? String(raw.image) : undefined,
  }))
}

function mapEvents(rows: Record<string, unknown>[]): HomeEventItem[] {
  return rows.map((raw) => ({
    id: raw.id as number | string,
    title: String(raw.title ?? ''),
    description: String(raw.summary ?? raw.description ?? ''),
    event_date: String(raw.date ?? raw.event_date ?? ''),
    image_path: raw.image ? String(raw.image) : undefined,
    location: raw.location ? String(raw.location) : undefined,
  }))
}

export default function HomePage() {
  const { t, locale } = useT()
  const h = t.home
  const [data, setData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    fetchLocalizedPublic((loc) => publicApi.homepage(loc), locale)
      .then((payload) => setData(payload as Record<string, unknown>))
      .catch(() => setData(null))
  }, [locale])

  const profile = data?.profile as SchoolProfile | undefined
  const banners = (data?.banners as Record<string, string>[]) || []
  const programs = (data?.programs as Record<string, string>[]) || []
  const facilities = (data?.facilities as Record<string, string>[]) || []
  const testimonials = useMemo(
    () => mapTestimonials((data?.testimonials as Record<string, unknown>[]) || []),
    [data?.testimonials],
  )
  const events = useMemo(
    () => mapEvents((data?.events as Record<string, unknown>[]) || []),
    [data?.events],
  )
  const gallery = (data?.gallery as Record<string, unknown>[]) || []
  const teachers = (data?.teachers as Record<string, string>[]) || []
  const feePlans = (data?.fee_plans as Record<string, string | number>[]) || []

  const home = useMemo(
    () => homeContentFromProfile(profile, {
      aboutLabel: h.aboutLabel,
      aboutTitle: h.aboutTitle,
      whyLabel: h.whyLabel,
      whyTitle: h.whyTitle,
      whyPanelTitle: h.whyPanelTitle,
      whyPanelDesc: h.whyPanelDesc,
      learningLabel: h.learningElements.label,
      learningTitleAccent: h.learningElements.titleAccent,
      learningTitleRest: h.learningElements.titleRest,
      learningParagraphs: [...h.learningElements.paragraphs],
      learningItems: h.learningElements.items.map((item) => ({ ...item })),
      ctaTitle: h.ctaTitle,
      ctaSubtitle: h.ctaSubtitle,
    }),
    [profile, h],
  )

  const phone = getSchoolField(profile, 'phone', locale)
  const yearsExp = getYearsSince(profile)
  const schoolShort = getSchoolName(profile, false, locale)
  const enrollSteps = home.enrollSteps.map((s, i) => ({
    step: i + 1,
    title: s.title,
    desc: s.description,
    icon: enrollIcons[i] ?? FileText,
  }))
  const whyItems = home.whyChoose.map((w) => ({ title: w.title, desc: w.description }))
  const teacherCount = teachers.length > 0 ? `${teachers.length}` : '0'
  const priceLabels = {
    monthly: t.pages.programs.feeMonthly,
    sixMonth: t.pages.programs.fee6Month,
    yearly: t.pages.programs.feeYearly,
  }
  const heroContent = getHeroContent(banners, {
    admissionBanner: h.admissionBanner,
    heroSlides: h.heroSlides,
    heroSidebar: h.heroSidebar,
  })

  const aboutImage = getProfileImage(profile, 'home_about_image') || getProfileImage(profile, 'cover_image') || ''
  const whyImage = getProfileImage(profile, 'home_why_image') || getProfileImage(profile, 'cover_image') || ''
  const galleryItems = gallery
    .slice(0, 4)
    .map((item, i) => {
      const row = item as { id?: number; title?: string; image?: string; image_path?: string }
      const imageSrc = mediaUrl(row.image || row.image_path || '')
      return imageSrc ? {
        key: String(row.id ?? i),
        name: row.title || `Gallery ${i + 1}`,
        imageSrc,
        shape: galleryPreviewShapes[i % galleryPreviewShapes.length],
        tone: galleryPreviewTones[i % galleryPreviewTones.length],
      } : null
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return (
    <div className="home-page overflow-x-hidden">
      <div className="home-hero-viewport">
        <HomeWelcomeBento
          slides={heroContent.slides}
          sidebar={heroContent.sidebar}
          banners={banners}
          schoolShort={schoolShort}
          phone={phone}
        />
      </div>

      <HomeStatsStrip
        teacherCount={teacherCount}
        yearsExp={yearsExp}
        programCount={programs.length}
        stats={h.stats}
      />

      {home.aboutParagraphs.length > 0 && (
        <HomeAboutSection
          label={home.aboutLabel}
          title={home.aboutTitle}
          paragraphs={home.aboutParagraphs}
          mainImage={aboutImage}
          schoolShort={schoolShort}
          exploreLabel={t.common.learnMore}
        />
      )}

      <HomeLearningElementsSection content={home} />

      {programs.length > 0 && (
        <HomeSection tone="cream" decorations="programs">
          <KidschollSection label={h.programsLabel} title={h.programsTitle} subtitle={h.programsSubtitle} />
          <div className="home-programs">
            {programs.map((p, i) => {
              const prog = p as Record<string, string>
              const level = prog.grade_level?.toLowerCase() || prog.slug?.toLowerCase() || 'nursery'
              const copy = getProgramCopy(level, locale, prog.description || prog.summary, prog.title, prog.ages, prog.time, prog.price)
              const prices = getProgramPrices(prog, level, locale)
              const emoji = programEmojis[level] || programEmojis.nursery
              return (
                <FadeIn key={prog.id ?? i} delay={i * 0.08}>
                  <ProgramCard
                    title={prog.title || copy.title}
                    description={prog.description || prog.summary || copy.description}
                    ages={prog.ages || copy.ages}
                    time={prog.time || copy.time}
                    prices={prices}
                    priceLabels={priceLabels}
                    imagePath={prog.image || prog.image_path}
                    emojiFallback={emoji}
                    learnMoreLabel={t.common.learnMore}
                  />
                </FadeIn>
              )
            })}
          </div>
        </HomeSection>
      )}

      {facilities.length > 0 && (
        <HomeSection tone="cream" decorations="default" wave>
          <KidschollSection
            label={t.pages.facilities.sectionLabel}
            title={t.pages.facilities.sectionTitle}
            subtitle={t.pages.facilities.subtitle}
          />
          <div className="home-facilities">
            {facilities.map((f, i) => {
              const row = f as Record<string, string>
              const iconKey = String(row.icon || row.slug || '').toLowerCase()
              const Icon = facilityIcons[iconKey] || Sparkles
              return (
                <FadeIn key={row.id ?? i} delay={i * 0.06}>
                  <FacilityCard
                    title={row.title}
                    description={row.summary || row.description || ''}
                    imagePath={mediaUrl(row.image || row.image_path)}
                    icon={Icon}
                    tone={facilityCardTones[i % facilityCardTones.length]}
                    shape={facilityCardShapes[i % facilityCardShapes.length]}
                    learnMoreLabel={t.common.learnMore}
                    learnMoreHref={row.slug ? `/facilities/${row.slug}` : undefined}
                  />
                </FadeIn>
              )
            })}
          </div>
          <div className="text-center mt-10">
            <Link to="/facilities" className="btn-kidscholl-outline">{t.common.learnMore} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </HomeSection>
      )}

      {home.whyChoose.length > 0 && (
        <HomeWhySection
          label={home.whyLabel}
          title={home.whyTitle}
          panelTitle={home.whyPanelTitle}
          panelDesc={home.whyPanelDesc}
          items={whyItems}
          callBox={h.callBox}
          phone={phone}
          mainImage={whyImage}
        />
      )}

      {teachers.length > 0 && (
        <HomeSection tone="cream" decorations="teachers">
          <KidschollSection label={h.teachersLabel} title={h.teachersTitle} subtitle={h.teachersSubtitle} />
          <div className="home-teachers">
            {teachers.map((teacher, i) => (
              <FadeIn key={teacher.id} delay={i * 0.08}>
                <div className="home-teacher-card">
                  <div className="home-teacher-avatar">
                    {teacher.image || teacher.image_path ? (
                      <img src={mediaUrl(teacher.image || teacher.image_path)} alt={teacher.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sky-400 to-mint-400 flex items-center justify-center text-white font-display text-2xl font-bold">
                        {teacher.title?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-ink">{teacher.title}</h3>
                  <p className="text-sm text-sky-600 font-semibold mt-0.5">{teacher.role || teacher.summary}</p>
                  {teacher.qualification && (
                    <p className="text-xs text-slate-400 mt-1">{teacher.qualification}</p>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </HomeSection>
      )}

      {feePlans.length > 0 && (
        <HomeSection tone="white" decorations="pricing" wave>
          <KidschollSection label={h.pricingLabel} title={h.pricingTitle} subtitle={h.pricingSubtitle} />
          <div className="home-pricing">
            {feePlans.map((plan, i) => {
              const row = plan as Record<string, unknown>
              const level = String(row.grade_level || row.slug || '')
              const prices = getProgramPrices(row, level, locale)
              const displayPrice = formatProgramPriceDisplay(
                prices.monthly || prices.sixMonth || prices.yearly || '',
              )
              const billingLabel = prices.monthly
                ? t.common.monthly
                : prices.sixMonth
                  ? priceLabels.sixMonth
                  : prices.yearly
                    ? priceLabels.yearly
                    : t.common.oneTime

              return (
                <FadeIn key={String(row.id ?? i)} delay={i * 0.1}>
                  <div className={`kidscholl-pricing-card h-full flex flex-col ${i === 1 ? 'featured' : ''}`}>
                    <h3 className="font-display font-bold text-xl text-ink mb-2">{String(row.name || row.title || '')}</h3>
                    <div className="font-display text-4xl font-bold text-sky-500 mb-1">
                      {displayPrice}
                    </div>
                    <p className="text-xs text-slate-400 mb-6">{billingLabel}</p>
                    <ul className="text-sm text-slate-600 space-y-2 mb-8 text-left flex-1">
                      {t.feeIncludes.map((f) => (
                        <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {f}</li>
                      ))}
                    </ul>
                    <Link to="/admission" className="btn-kidscholl w-full justify-center">{t.common.apply}</Link>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </HomeSection>
      )}

      <HomeTestimonialsSection
        label={h.testimonialsLabel}
        title={h.testimonialsTitle}
        subtitle={h.testimonialsSubtitle}
        items={testimonials}
      />

      {enrollSteps.length > 0 && (
        <HomeEnrollSection
          label={h.enrollLabel}
          title={h.enrollTitle}
          subtitle={h.enrollSubtitle}
          steps={enrollSteps}
          ctaLabel={t.common.startApply}
        />
      )}

      <HomeEventsSection
        label={h.eventsLabel}
        title={h.eventsTitle}
        subtitle={h.eventsSubtitle}
        upcomingTitle={h.upcomingEvents}
        thisMonthTitle={h.thisMonthEvents}
        readMoreLabel={t.common.readMore}
        showAllLabel={t.common.showAll}
        locale={locale}
        events={events}
      />

      {galleryItems.length > 0 && (
        <HomeGallerySection
          label={h.galleryLabel}
          title={h.galleryTitle}
          items={galleryItems}
          showAllLabel={t.common.showAll}
        />
      )}

      <HomeSection tone="mint" decorations="cta" className="home-cta-section">
        <div className="home-cta">
          <KidschollSection light label={h.ctaLabel} title={home.ctaTitle} subtitle={home.ctaSubtitle} className="!mb-8" />
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/admission" className="home-cta-btn home-cta-btn--primary">
              {t.nav.applyNow} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="home-cta-btn home-cta-btn--secondary">
              <MapPin className="h-4 w-4" /> {t.common.bookVisit}
            </Link>
          </div>
        </div>
      </HomeSection>
    </div>
  )
}
