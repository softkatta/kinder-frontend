import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, Heart, Shield, Sparkles, Users, type LucideIcon } from 'lucide-react'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { AboutPhotoCollage } from '@/components/design/AboutPhotoCollage'
import { FadeIn } from '@/components/ui/Motion'
import { useT } from '@/i18n/LanguageContext'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { getSchoolName, getYearsSince, getProfileText } from '@/config/siteContent'
import { parsePipePairs, parseTextLines, parseTimelineItems } from '@/utils/homeProfile'
import { mediaUrl } from '@/utils/mediaUrl'
import { ShapedImage } from '@/components/design/ShapedImage'
import { looksLikeHtml, sanitizeBasicHtml } from '@/components/ui/RichTextEditor'

const valueIcons: LucideIcon[] = [Heart, Shield, Sparkles, Users]
const valueColors = [
  'from-rose-400 to-orange-400',
  'from-sky-400 to-teal-400',
  'from-violet-400 to-fuchsia-400',
  'from-amber-400 to-yellow-400',
]

export default function AboutPage() {
  const { t, locale } = useT()
  const [profile, setProfile] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchLocalizedPublic((loc) => publicApi.schoolProfile(loc), locale)
      .then((data) => setProfile((data as Record<string, string>) || {}))
      .catch(() => setProfile({}))
  }, [locale])

  const yearsExp = getYearsSince(profile)
  const principalName = profile.principal_name || ''
  const principalImage = mediaUrl(profile.principal_image)
  const schoolShort = getSchoolName(profile, false, locale)
  const aboutParagraphs = parseTextLines(profile.home_about_paragraphs)
  const coverImage = profile.about_page_image || profile.cover_image || profile.logo_image
  const accentImage = profile.about_page_image_accent || ''
  const p = t.pages.about

  const heroLabel = profile.about_page_label || p.label
  const heroTitle = (profile.about_page_title || p.title).replace(/Little Stars|लिटल स्टार्स/g, schoolShort)
  const heroSubtitle = profile.about_page_subtitle || p.subtitle
  const principalLabel = profile.about_principal_label || p.principalMsg
  const vision = getProfileText(profile, 'vision', locale)
  const mission = getProfileText(profile, 'mission', locale)

  const cmsValues = parsePipePairs(profile.about_values).map((row, i) => ({
    icon: valueIcons[i] || Heart,
    title: row.title,
    desc: row.description,
    color: valueColors[i % valueColors.length]!,
  }))

  const timeline = parseTimelineItems(profile.about_timeline).map((row) => ({
    year: row.year,
    title: row.title,
    desc: row.description,
  }))

  const principalMessage = getProfileText(profile, 'principal_message', locale)

  const stats = [
    {
      icon: Award,
      value: `${yearsExp}+`,
      label: profile.about_stat_years_label || p.yearsService,
    },
    {
      icon: Heart,
      value: profile.about_stat_programs_value || t.grades,
      label: profile.about_stat_programs_label || p.programsStat,
    },
    {
      icon: Shield,
      value: profile.about_stat_safe_value || '100%',
      label: profile.about_stat_safe_label || p.safeCampus,
    },
  ]

  return (
    <div>
      <PublicPageHero
        imageKey="page_about_image"
        label={heroLabel}
        title={heroTitle}
        subtitle={heroSubtitle}
        breadcrumbs={[{ label: heroLabel }]}
      />

      <section className="section bg-white relative overflow-hidden">
        <SectionDecorations variant="about" />
        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <KidschollSection
                align="left"
                label={profile.home_about_label || p.storyTitle}
                title={profile.home_about_title || p.storySubtitle}
              />
              {aboutParagraphs.length > 0 ? (
                aboutParagraphs.map((para) => (
                  <p key={para.slice(0, 32)} className="text-slate-600 leading-relaxed mb-4">{para}</p>
                ))
              ) : (
                <p className="text-slate-400 leading-relaxed mb-4">{t.common.emptyAbout}</p>
              )}
              <Link to="/book-tour" className="btn-kidscholl inline-flex">{t.common.bookVisit} <ArrowRight className="h-4 w-4" /></Link>
            </FadeIn>
            <FadeIn delay={0.1}>
              <AboutPhotoCollage
                mainImage={coverImage ? mediaUrl(coverImage) : null}
                accentImage={accentImage ? mediaUrl(accentImage) : null}
                yearsExp={yearsExp}
                established={profile.established_year || ''}
                sinceBadge={t.home.sinceBadge}
                yearsLabel={t.common.yearsExp}
                schoolShort={schoolShort}
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {(vision || mission) && (
        <section className="section bg-[#FFF8F0] relative overflow-hidden">
          <SectionDecorations variant="why" />
          <div className="mx-auto max-w-6xl px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              {vision ? (
                <FadeIn>
                  <div className="kidscholl-form-card !mb-0 h-full">
                    <h3 className="font-display text-xl font-bold text-ink mb-3">{p.vision}</h3>
                    <p className="text-slate-600 leading-relaxed">{vision}</p>
                  </div>
                </FadeIn>
              ) : null}
              {mission ? (
                <FadeIn delay={0.06}>
                  <div className="kidscholl-form-card !mb-0 h-full">
                    <h3 className="font-display text-xl font-bold text-ink mb-3">{p.mission}</h3>
                    <p className="text-slate-600 leading-relaxed">{mission}</p>
                  </div>
                </FadeIn>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {cmsValues.length > 0 && (
        <section className="section bg-white relative overflow-hidden">
          <SectionDecorations variant="programs" />
          <div className="mx-auto max-w-7xl px-4 relative z-10">
            <KidschollSection label={profile.about_values_label || p.valuesLabel} title={profile.about_values_title || p.valuesTitle} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {cmsValues.map(({ icon: Icon, title, desc, color }, i) => (
                <FadeIn key={title} delay={i * 0.06}>
                  <div className="kidscholl-program-card p-6 h-full">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display font-bold text-ink">{title}</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {principalMessage && (
        <section className="section bg-[#FFF8F0] relative overflow-hidden">
          <SectionDecorations variant="teachers" />
          <div className="mx-auto max-w-6xl px-4 relative z-10">
            <FadeIn>
              <div className="about-principal-card kidscholl-form-card !mb-0">
                <div className="about-principal-body">
                  <div className="about-principal-badge">{principalLabel}</div>
                  {looksLikeHtml(principalMessage) ? (
                    <div
                      className="about-principal-quote about-principal-quote--html"
                      dangerouslySetInnerHTML={{ __html: sanitizeBasicHtml(principalMessage) }}
                    />
                  ) : (
                    <p className="about-principal-quote">
                      &ldquo;{principalMessage}&rdquo;
                    </p>
                  )}
                  {principalName ? (
                    <p className="about-principal-name">— {principalName}</p>
                  ) : null}
                </div>
                <div className="about-principal-photo-wrap">
                  {principalImage ? (
                    <ShapedImage
                      src={principalImage}
                      alt={principalName || principalLabel}
                      shape="arch"
                      border="white"
                      className="about-principal-photo"
                      fallback={<span className="text-5xl">👩‍🏫</span>}
                    />
                  ) : (
                    <div className="about-principal-photo about-principal-photo--fallback" aria-hidden>
                      <Award className="h-14 w-14 text-violet-500" />
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {timeline.length > 0 && (
        <section className="section bg-white relative overflow-hidden">
          <SectionDecorations variant="events" />
          <div className="mx-auto max-w-4xl px-4 relative z-10">
            <KidschollSection label={profile.about_journey_label || p.journeyLabel} title={profile.about_journey_title || p.journeyTitle} />
            <ol className="relative border-l-2 border-orange-200 ml-4 space-y-8">
              {timeline.map((item, i) => (
                <FadeIn key={`${item.year}-${item.title}`} delay={i * 0.08}>
                  <li className="ml-8">
                    <span className="absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 ring-4 ring-white" />
                    <span className="text-sm font-bold text-orange-500">{item.year}</span>
                    <h3 className="font-display font-bold text-ink mt-1">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                  </li>
                </FadeIn>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="programs" />
        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <FadeIn key={label} delay={i * 0.08}>
                <div className="kidscholl-stat-card">
                  <div className="kidscholl-stat-icon"><Icon className="h-5 w-5" /></div>
                  <div className="font-display text-2xl md:text-3xl font-bold text-ink">{value}</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1">{label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white pb-20 relative overflow-hidden">
        <SectionDecorations variant="cta" />
        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <div className="kidscholl-cta-band rounded-[2rem] p-10 md:p-14 text-center md:text-left">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">
                  {profile.about_visit_title || p.visitUs}
                </h3>
                <p className="text-white/80">{profile.about_visit_desc || p.visitDesc}</p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link to="/book-tour" className="home-cta-btn home-cta-btn--primary !text-violet-700 hover:!text-violet-900">
                  {t.common.bookVisit}
                </Link>
                <Link to="/admission" className="home-cta-btn home-cta-btn--secondary">
                  {t.nav.applyNow} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
