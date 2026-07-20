import { Link } from 'react-router-dom'
import { GraduationCap, Phone, Mail, MapPin, MessageCircle, ArrowRight } from 'lucide-react'
import { WaveFooterTop } from '@/components/design/WaveFooter'
import { whatsAppUrl } from '@/config/siteContent'

interface FooterLink {
  to: string
  label: string
}

interface PublicFooterProps {
  schoolName: string
  schoolFullName?: string
  logoSrc?: string
  mission: string
  phone: string
  email: string
  address: string
  exploreLinks: FooterLink[]
  visitLinks: FooterLink[]
  labels: {
    explore: string
    visit: string
    contact: string
    apply: string
    whatsapp: string
    rights: string
    privacy: string
    terms: string
    erp: string
  }
}

export function PublicFooter({
  schoolName,
  schoolFullName,
  logoSrc,
  mission,
  phone,
  email,
  address,
  exploreLinks,
  visitLinks,
  labels,
}: PublicFooterProps) {
  const phoneHref = `tel:${phone.replace(/\s/g, '')}`

  return (
    <>
      <WaveFooterTop />
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-top">
            <div className="site-footer-brand">
              <div className="site-footer-brand-row">
                {logoSrc ? (
                  <img src={logoSrc} alt={schoolName} className="site-footer-logo" />
                ) : (
                  <div className="site-footer-logo-fallback" aria-hidden>
                    <GraduationCap className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <p className="site-footer-school-name">{schoolName}</p>
                  <p className="site-footer-school-tag">Kindergarten</p>
                </div>
              </div>
              {mission ? <p className="site-footer-mission">{mission}</p> : null}
            </div>

            <div className="site-footer-cta">
              <Link to="/admission" className="site-footer-cta-btn site-footer-cta-btn--primary">
                {labels.apply} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsAppUrl(phone)}
                target="_blank"
                rel="noreferrer"
                className="site-footer-cta-btn site-footer-cta-btn--whatsapp"
              >
                <MessageCircle className="h-4 w-4" /> {labels.whatsapp}
              </a>
            </div>
          </div>

          <div className="site-footer-grid">
            <div>
              <h3 className="site-footer-heading">{labels.explore}</h3>
              <ul className="site-footer-links">
                {exploreLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="site-footer-heading">{labels.visit}</h3>
              <ul className="site-footer-links">
                {visitLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="site-footer-contact">
              <h3 className="site-footer-heading">{labels.contact}</h3>
              <ul className="site-footer-contact-list">
                <li>
                  <Phone className="site-footer-contact-icon" />
                  <a href={phoneHref}>{phone}</a>
                </li>
                <li>
                  <Mail className="site-footer-contact-icon" />
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
                <li>
                  <MapPin className="site-footer-contact-icon" />
                  <span>{address}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="site-footer-bottom">
            <p>© {new Date().getFullYear()} {schoolFullName || schoolName}. {labels.rights}</p>
            <div className="site-footer-legal">
              <Link to="/privacy">{labels.privacy}</Link>
              <Link to="/terms">{labels.terms}</Link>
              <span>{labels.erp}</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
