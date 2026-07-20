import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import toast from 'react-hot-toast'
import { MapPin, Phone, Mail, MessageCircle, Clock } from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { ContactMap } from '@/components/contact/ContactMap'
import { SocialLinks } from '@/components/contact/SocialLinks'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormCard, FormStack } from '@/components/ui/Form'
import { FadeIn } from '@/components/ui/Motion'
import { useT } from '@/i18n/LanguageContext'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { getSchoolField, formatAddress, whatsAppUrl } from '@/config/siteContent'

interface ContactForm { name: string; email: string; phone: string; message: string }

export default function ContactPage() {
  const { t, locale } = useT()
  const [profile, setProfile] = useState<Record<string, string>>({})
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ContactForm>()
  const p = t.pages.contact

  useEffect(() => {
    fetchLocalizedPublic((loc) => publicApi.schoolProfile(loc), locale)
      .then((data) => setProfile((data as Record<string, string>) || {}))
      .catch(() => setProfile({}))
  }, [locale])

  const onSubmit = async (data: ContactForm) => {
    try {
      await publicApi.contact({ ...data })
      toast.success(p.success)
      reset()
    } catch {
      toast.error(p.error)
    }
  }

  const phone = getSchoolField(profile, 'phone', locale)
  const email = getSchoolField(profile, 'email', locale)
  const address = formatAddress(profile, locale)
  const schoolName = getSchoolField(profile, 'schoolName', locale) || profile.title || 'School'

  return (
    <div>
      <PublicPageHero imageKey="page_contact_image" label={p.label} title={p.title} subtitle={p.subtitle} />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="about" />
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="grid lg:grid-cols-5 gap-8">
            <FadeIn className="lg:col-span-2 space-y-4">
              <KidschollSection align="left" label={p.sectionLabel} title={p.sectionTitle} className="!mb-6" />
              {[
                { icon: MapPin, label: p.address, value: address },
                { icon: Phone, label: p.phoneLabel, value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
                { icon: Mail, label: p.emailLabel, value: email, href: `mailto:${email}` },
                { icon: Clock, label: p.hoursLabel, value: getSchoolField(profile, 'hours', locale) },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="kidscholl-feature-pill">
                  <div className="kidscholl-feature-icon"><Icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
                    {href ? <a href={href} className="text-sm font-semibold text-ink hover:text-orange-500 transition-colors">{value}</a> : <p className="text-sm font-semibold text-ink">{value}</p>}
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <a href={whatsAppUrl(phone)} className="btn-kidscholl flex-1 justify-center !py-3"><MessageCircle className="h-4 w-4" /> {t.footer.whatsapp}</a>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-kidscholl-outline flex-1 justify-center !py-3"><Phone className="h-4 w-4" /> {t.common.call}</a>
              </div>
              <SocialLinks
                links={{
                  facebook_url: profile.facebook_url,
                  instagram_url: profile.instagram_url,
                  youtube_url: profile.youtube_url,
                  twitter_url: profile.twitter_url,
                  linkedin_url: profile.linkedin_url,
                }}
                label={t.footer.followUs}
                className="pt-2"
              />
            </FadeIn>
            <FadeIn delay={0.1} className="lg:col-span-3">
              <FormCard title={p.formTitle} subtitle={p.formSubtitle}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <FormStack>
                    <Input label={p.name} requiredMark {...register('name', { required: true })} />
                    <Input label={p.email} type="email" requiredMark {...register('email', { required: true })} />
                    <Input label={p.phone} {...register('phone')} />
                    <Textarea label={p.message} requiredMark rows={5} {...register('message', { required: true })} />
                    <button type="submit" className="btn-kidscholl w-full justify-center" disabled={isSubmitting}>
                      {isSubmitting ? t.common.sending : t.common.send}
                    </button>
                  </FormStack>
                </form>
              </FormCard>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="section bg-white relative overflow-hidden pb-20">
        <SectionDecorations variant="about" />
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <KidschollSection label={p.mapLabel} title={p.mapTitle} subtitle={p.mapSubtitle} />
          <FadeIn>
            <ContactMap
              address={address}
              schoolName={schoolName}
              mapLabel={p.mapLabel}
              openMapsLabel={p.openInMaps}
              mapEmbedUrl={profile.map_embed_url || profile.map_url}
              latitude={profile.latitude || profile.lat}
              longitude={profile.longitude || profile.lng || profile.lon}
            />
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
