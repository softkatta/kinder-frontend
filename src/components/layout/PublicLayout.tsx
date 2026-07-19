import { Link, Outlet } from 'react-router-dom'
import { GraduationCap, Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react'
import { useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated, selectRoles } from '@/store/slices/authSlice'
import { getPortalHome } from '@/utils/auth'
import { WaveFooterTop } from '@/components/design/WaveFooter'
import { useT } from '@/i18n/LanguageContext'
import { getSchoolField, formatAddress, whatsAppUrl, getProfileText } from '@/config/siteContent'
import { PublicMobileNav } from '@/components/layout/PublicMobileNav'
import { KindergartenNavbar } from '@/components/layout/KindergartenNavbar'
import { LanguageDropdown } from '@/components/layout/LanguageDropdown'
import { PublicLiveBanner } from '@/components/live/PublicLiveBanner'
import { SchoolProfileProvider } from '@/contexts/SchoolProfileContext'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { mediaUrl } from '@/utils/mediaUrl'

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
        { to: '/blog', label: t.nav.blog },
        { to: '/careers', label: t.nav.careers },
      ],
    },
    { to: '/admission', label: t.nav.admission },
    { to: '/contact', label: t.nav.contact },
  ]

  const footerQuick = [
    { to: '/about', label: t.nav.about },
    { to: '/programs', label: t.nav.programs },
    { to: '/curriculum', label: t.nav.curriculum },
    { to: '/staff', label: t.nav.staff },
    { to: '/activities', label: t.nav.activities },
    { to: '/book-tour', label: t.nav.bookTour },
    { to: '/events', label: t.nav.events },
    { to: '/live', label: t.nav.watchLive },
    { to: '/blog', label: t.nav.blog },
    { to: '/admission', label: t.nav.admission },
    { to: '/contact', label: t.nav.contact },
  ]

  const erpLabel = locale === 'mr' ? t.brand.erpLabelMr : t.brand.erpLabelEn
  const brandGradient = 'linear-gradient(135deg, #38BDF8, #6EE7B7)'

  return (
    <div className="min-h-screen flex flex-col bg-cream overflow-x-hidden">
      <PublicLiveBanner />
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

      <main className="flex-1 pb-20 xl:pb-0 overflow-x-hidden">
        <SchoolProfileProvider profile={profile as Record<string, string> | null}>
          <Outlet />
        </SchoolProfileProvider>
      </main>

      <PublicMobileNav />

      <WaveFooterTop />
      <footer className="relative text-white" style={{ background: 'linear-gradient(160deg, #0284C7 0%, #0369A1 50%, #0F766E 100%)' }}>
        <div className="h-1 gradient-rainbow" />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                {logoSrc ? (
                  <img src={logoSrc} alt={schoolName} className="h-14 w-auto max-w-[200px] object-contain bg-white/95 rounded-xl px-2 py-1" />
                ) : (
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white" style={{ background: brandGradient }}>
                    <GraduationCap className="h-7 w-7" />
                  </div>
                )}
                {!logoSrc && (
                  <div>
                    <p className="font-display text-lg font-bold">{schoolName}</p>
                    <p className="text-xs text-white/70 uppercase tracking-widest">Kindergarten</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{mission}</p>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-4">{t.footer.quickLinks}</h3>
              <ul className="space-y-2 text-sm text-white/85">
                {footerQuick.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="hover:text-sunny transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-4">{t.nav.contact}</h3>
              <ul className="space-y-3 text-sm text-white/85">
                <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0" /><a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-sunny">{phone}</a></li>
                <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0" /><a href={`mailto:${email}`} className="hover:text-sunny">{email}</a></li>
                <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /><span>{address}</span></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-4">{t.footer.whatsapp}</h3>
              <a href={whatsAppUrl(phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-bold hover:bg-white/25 transition-colors">
                <MessageCircle className="h-5 w-5" /> {t.footer.whatsapp}
              </a>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
            <p>© {new Date().getFullYear()} {schoolFullName || schoolName}. {t.footer.rights}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/privacy" className="hover:text-white">{t.footer.privacy}</Link>
              <Link to="/terms" className="hover:text-white">{t.footer.terms}</Link>
              <span className="text-white/50">{erpLabel}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function PublicLayout() {
  return <PublicLayoutInner />
}
