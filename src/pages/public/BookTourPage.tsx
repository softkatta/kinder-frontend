import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { CalendarDays, MapPin, Users, ArrowRight, Sparkles } from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormCard, FormGrid, FormStack } from '@/components/ui/Form'
import { FadeIn } from '@/components/ui/Motion'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { publicApi } from '@/api/services'
import { useT } from '@/i18n/LanguageContext'

interface TourForm {
  parent_name: string
  email: string
  phone: string
  child_name: string
  child_age: string
  preferred_date: string
  preferred_time: string
  notes?: string
}

export default function BookTourPage() {
  const { t } = useT()
  const p = t.pages.bookTour
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<TourForm>()

  const onSubmit = async (data: TourForm) => {
    const message = [
      'Book a Campus Tour Request',
      `Parent: ${data.parent_name}`,
      `Child: ${data.child_name} (${data.child_age})`,
      `Preferred date: ${data.preferred_date}`,
      `Preferred time: ${data.preferred_time}`,
      data.notes ? `Notes: ${data.notes}` : '',
    ].filter(Boolean).join('\n')

    try {
      await publicApi.contact({ name: data.parent_name, email: data.email, phone: data.phone, message })
      toast.success(p.success)
      reset()
    } catch {
      toast.error(p.errorMessage)
    }
  }

  const perks = [
    { icon: MapPin, title: p.perk1Title, desc: p.perk1Desc },
    { icon: Users, title: p.perk2Title, desc: p.perk2Desc },
    { icon: Sparkles, title: p.perk3Title, desc: p.perk3Desc },
  ]

  return (
    <div>
      <PublicPageHero imageKey="page_book_tour_image" label={p.label} title={p.title} subtitle={p.subtitle} breadcrumbs={[{ label: p.title }]} />

      <section className="section bg-white relative overflow-hidden">
        <SectionDecorations variant="programs" />
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="grid lg:grid-cols-5 gap-10">
            <FadeIn className="lg:col-span-2 space-y-4">
              <KidschollSection align="left" label={p.whyLabel} title={p.whyTitle} className="!mb-4" />
              {perks.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="kidscholl-feature-pill">
                  <div className="kidscholl-feature-icon"><Icon className="h-5 w-5" /></div>
                  <div>
                    <p className="font-display font-bold text-ink">{title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
              <div className="kidscholl-cta-band rounded-2xl p-6 text-white mt-6">
                <p className="font-display font-bold text-lg mb-2">{p.readyTitle}</p>
                <p className="text-white/80 text-sm mb-4">{p.readyDesc}</p>
                <Link to="/admission" className="btn-kidscholl !bg-white !text-violet-700">
                  {t.nav.applyNow} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} className="lg:col-span-3">
              <FormCard title={p.formTitle} subtitle={p.formSubtitle}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <FormStack>
                    <FormGrid>
                      <Input label={p.parentName} requiredMark {...register('parent_name', { required: true })} />
                      <Input label={p.email} type="email" requiredMark {...register('email', { required: true })} />
                      <Input label={p.phone} requiredMark {...register('phone', { required: true })} />
                      <Input label={p.childName} requiredMark {...register('child_name', { required: true })} />
                      <Input label={p.childAge} requiredMark {...register('child_age', { required: true })} />
                      <Input label="Visit Date" type="date" requiredMark {...register('preferred_date', { required: true })} />
                    </FormGrid>
                    <Select label={p.preferredTime} requiredMark {...register('preferred_time', { required: true })}>
                      <option value="">{p.preferredTime}</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                    </Select>
                    <Textarea label={p.notes} rows={4} {...register('notes')} />
                    <button type="submit" className="btn-kidscholl w-full justify-center" disabled={isSubmitting}>
                      <CalendarDays className="h-4 w-4" />
                      {isSubmitting ? p.submitting : p.submit}
                    </button>
                  </FormStack>
                </form>
              </FormCard>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  )
}
