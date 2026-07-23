import { lazy, Suspense, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated, selectRoles } from '@/store/slices/authSlice'
import { getPortalHome } from '@/utils/auth'
import { useT } from '@/i18n/LanguageContext'
import { getSchoolField, formatAddress, getProfileText } from '@/config/siteContent'
import { PublicMobileNav } from '@/components/layout/PublicMobileNav'
import { KindergartenNavbar } from '@/components/layout/KindergartenNavbar'
import { LanguageDropdown } from '@/components/layout/LanguageDropdown'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { LiveRouteKeepAlive } from '@/components/live/LiveRouteKeepAlive'
import { SchoolProfileProvider } from '@/contexts/SchoolProfileContext'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { mediaUrl } from '@/utils/mediaUrl'

const PublicLivePage = lazy(() => import('@/pages/public/PublicLivePage'))

function PublicLayoutInner() {
  const { t, locale } = useT()
  const [open, setOpen] = useState(false)
  const { profile, logoUrl, schoolName, schoolFullName } = useSchoolBranding()
  const isAuth = useAppSelector(selectIsAuthenticated)
  const roles = useAppSelector(selectRoles)
  const portalHref = isAuth && roles.length ? getPortalHome(roles) : '/login'
  const portalLinkLabel = isAuth && roles.length ? t.nav.portal : t.nav.portalLogin

  const phone = getSchoolField(profile, 'phone', locale)
  const email = getSchoolField(profile, 'email', locale)
  const address = formatAddress(profile, locale)
  const mission = getProfileText(profile, 'mission', locale)
  const logoSrc = logoUrl ? mediaUrl(logoUrl) : ''

  const navLinks = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/about', label: t.nav.about },
    {
      label: t.nav.schoolLife,
      children: [
        { to: '/programs', label: t.nav.programs },
        { to: '/curriculum', label: t.nav.curriculum },
        { to: '/activities', label: t.nav.activities },
        { to: '/facilities', label: t.nav.facilities },
        { to: '/events', label: t.nav.events },
        { to: '/live', label: t.nav.watchLive },
      ],
    },
    {
      label: t.nav.discover,
      children: [
        { to: '/staff', label: t.nav.staff },
        { to: '/gallery', label: t.nav.gallery },
        { to: '/videos', label: t.nav.videos },
        { to: '/blog', label: t.nav.blog },
        { to: '/careers', label: t.nav.careers },
      ],
    },
    { to: '/admission', label: t.nav.admission },
    { to: '/contact', label: t.nav.contact },
  ]

  const exploreLinks = [
    { to: '/about', label: t.nav.about },
    { to: '/programs', label: t.nav.programs },
    { to: '/curriculum', label: t.nav.curriculum },
    { to: '/staff', label: t.nav.staff },
    { to: '/activities', label: t.nav.activities },
    { to: '/facilities', label: t.nav.facilities },
  ]

  const visitLinks = [
    { to: '/book-tour', label: t.nav.bookTour },
    { to: '/events', label: t.nav.events },
    { to: '/live', label: t.nav.watchLive },
    { to: '/gallery', label: t.nav.gallery },
    { to: '/videos', label: t.nav.videos },
    { to: '/blog', label: t.nav.blog },
    { to: '/admission', label: t.nav.admission },
    { to: '/contact', label: t.nav.contact },
  ]

  const erpLabel = locale === 'mr' ? t.brand.erpLabelMr : t.brand.erpLabelEn
  const brandGradient = 'linear-gradient(135deg, #38BDF8, #6EE7B7)'
  const banner = t.publicBanner

  return (
    <div className="min-h-screen flex flex-col bg-cream overflow-x-hidden">
      <div className="kidscholl-topbar">
        <div className="mx-auto max-w-7xl px-4 py-2 md:py-2.5 flex flex-wrap items-center justify-between gap-2 md:gap-3 text-xs">
          <div className="hidden md:flex flex-wrap items-center gap-5">
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-sunny transition-colors">
              <Phone className="h-3.5 w-3.5" /> {phone}
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-sunny transition-colors">
              <Mail className="h-3.5 w-3.5" /> {email}
            </a>
            <span className="flex items-center gap-1.5 text-white/80">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {address}
            </span>
          </div>
          <div className="flex items-center gap-3 md:gap-4 ml-auto">
            <span className="hidden md:flex items-center gap-1.5 text-white/80">
              <Clock className="h-3.5 w-3.5" /> {getSchoolField(profile, 'hours', locale)}
            </span>
            <LanguageDropdown />
            <Link to="/faq" className="hover:text-sunny transition-colors font-semibold hidden sm:inline">{t.nav.faq}</Link>
            <Link to={portalHref} className="hover:text-sunny transition-colors font-semibold">{portalLinkLabel}</Link>
          </div>
        </div>
      </div>

      <KindergartenNavbar
        schoolName={schoolName}
        navLinks={navLinks}
        applyLabel={t.nav.applyNow}
        portalLabel={portalLinkLabel}
        portalHref={portalHref}
        bookTourLabel={t.nav.bookTour}
        open={open}
        onToggle={() => setOpen(!open)}
        onNavigate={() => setOpen(false)}
        brandGradient={brandGradient}
        logoUrl={logoUrl}
      />

      <section className="bg-gradient-to-r from-slate-900 via-violet-700 to-fuchsia-600 text-white shadow-[0_16px_70px_rgba(79,70,229,0.18)]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                {banner.pill}
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {banner.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                {banner.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
              <Link to="/book-tour" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-white/10 transition hover:bg-slate-100">
                {banner.ctaPrimary}
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">
                {banner.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 pb-20 xl:pb-0 overflow-x-hidden">
        <SchoolProfileProvider profile={profile as Record<string, string> | null}>
          <LiveRouteKeepAlive
            path="/live"
            page={(
              <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-slate-400">Loading...</div>}>
                <PublicLivePage />
              </Suspense>
            )}
          >
            <Outlet />
          </LiveRouteKeepAlive>
        </SchoolProfileProvider>
      </main>

      <PublicMobileNav />

      <PublicFooter
        schoolName={schoolName}
        schoolFullName={schoolFullName}
        logoSrc={logoSrc}
        mission={mission}
        phone={phone}
        email={email}
        address={address}
        socialLinks={{
          facebook_url: profile?.facebook_url,
          instagram_url: profile?.instagram_url,
          youtube_url: profile?.youtube_url,
          twitter_url: profile?.twitter_url,
          linkedin_url: profile?.linkedin_url,
        }}
        mapEmbedUrl={profile?.map_embed_url || profile?.map_url}
        latitude={profile?.latitude || profile?.lat}
        longitude={profile?.longitude || profile?.lng || profile?.lon}
        exploreLinks={exploreLinks}
        visitLinks={visitLinks}
        labels={{
          explore: t.footer.explore,
          visit: t.footer.visit,
          contact: t.nav.contact,
          followUs: t.footer.followUs,
          findUs: t.footer.findUs,
          openInMaps: t.footer.openInMaps,
          apply: t.nav.applyNow,
          whatsapp: t.footer.whatsapp,
          rights: t.footer.rights,
          privacy: t.footer.privacy,
          terms: t.footer.terms,
          erp: erpLabel,
        }}
      />
    </div>
  )
}

export default function PublicLayout() {
  return <PublicLayoutInner />
}
