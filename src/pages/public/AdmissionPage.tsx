import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { admissionApi, publicApi } from '@/api/services'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { CameraCapture } from '@/components/ui/CameraCapture'
import { SuccessModal } from '@/components/ui/SuccessModal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormCard, FormSection, FormGrid, FormStack } from '@/components/ui/Form'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { GraduationCap, Heart, Phone, Mail, MapPin, CheckCircle2, FileText, School, ClipboardList, Award } from 'lucide-react'
import { FadeIn } from '@/components/ui/Motion'
import { useT } from '@/i18n/LanguageContext'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { getSchoolField, getSchoolName, formatAddress } from '@/config/siteContent'

type FormData = {
  applicant_name: string
  dob?: string
  gender?: 'male' | 'female' | 'other'
  grade_level?: 'nursery' | 'lkg' | 'ukg'
  parent_name: string
  parent_phone: string
  parent_email?: string
  address?: string
}

const stepIcons = [FileText, School, ClipboardList, Award]

export default function AdmissionPage() {
  const { t, locale } = useT()
  const p = t.pages.admission
  const [successOpen, setSuccessOpen] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [profile, setProfile] = useState<Record<string, string>>({})

  const schema = z.object({
    applicant_name: z.string().min(2, t.validation.nameRequired),
    dob: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    grade_level: z.enum(['nursery', 'lkg', 'ukg']).optional(),
    parent_name: z.string().min(2, t.validation.parentRequired),
    parent_phone: z.string().min(10, t.validation.phoneRequired),
    parent_email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    fetchLocalizedPublic((loc) => publicApi.schoolProfile(loc), locale)
      .then((data) => setProfile((data as Record<string, string>) || {}))
      .catch(() => setProfile({}))
  }, [locale])

  const onSubmit = async (data: FormData) => {
    try {
      let photoPath: string | undefined
      if (photoFile) {
        const fd = new FormData()
        fd.append('file', photoFile)
        const uploadRes = await publicApi.uploadAdmissionPhoto(fd)
        photoPath = uploadRes.data.data?.path || undefined
      }

      await admissionApi.submit({
        applicant_name: data.applicant_name,
        dob: data.dob,
        gender: data.gender,
        grade_level: data.grade_level,
        parent_info: { full_name: data.parent_name, phone: data.parent_phone, email: data.parent_email },
        address_info: { address: data.address },
        photo_path: photoPath,
      })
      reset()
      setPhotoFile(null)
      setSuccessOpen(true)
    } catch {
      toast.error(p.errorMessage)
    }
  }

  const phone = getSchoolField(profile, 'phone', locale)
  const email = getSchoolField(profile, 'email', locale)
  const schoolShort = getSchoolName(profile, false, locale)
  const enrollSteps = t.enrollSteps.map((s, i) => ({ ...s, step: i + 1, icon: stepIcons[i] }))

  return (
    <>
      <PublicPageHero imageKey="page_admission_image" label={p.label} title={p.title} subtitle={p.subtitle} />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="enroll" />
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {enrollSteps.map(({ step, title, icon: Icon }) => (
              <div key={step} className="kidscholl-enroll-step">
                <div className="kidscholl-enroll-num">{step}</div>
                <Icon className="h-7 w-7 text-violet-500 mb-2 mx-auto" />
                <p className="font-display font-bold text-sm text-ink">{title}</p>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-5">
              <FadeIn>
                <div className="kidscholl-form-card">
                  <h2 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-orange-500" /> {p.whyTitle.replace(/Little Stars|लिटल स्टार्स/g, schoolShort)}
                  </h2>
                  <ul className="space-y-3 text-sm text-slate-600">
                    {p.whyPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{point}</li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="kidscholl-cta-band rounded-2xl p-6 text-white">
                  <h3 className="font-display font-bold mb-3">{p.helpTitle}</h3>
                  <div className="space-y-2 text-sm text-white/85">
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-orange-300" /> {phone}</p>
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-orange-300" /> {email}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-300" /> {formatAddress(profile, locale)}</p>
                  </div>
                </div>
              </FadeIn>
            </div>
            <FadeIn delay={0.15} className="lg:col-span-3">
              <FormCard>
                <KidschollSection align="left" label={t.nav.admission} title={p.formTitle} subtitle={p.formSubtitle} className="!mb-6" />
                <form onSubmit={handleSubmit(onSubmit)}>
                  <FormStack>
                    <FormSection title={p.studentInfo} icon={Heart}>
                      <FormGrid>
                        <div className="span-full">
                          <Input label={p.childName} requiredMark error={errors.applicant_name?.message} {...register('applicant_name')} />
                        </div>
                        <Input label={p.dob} type="date" {...register('dob')} />
                        <Select label={p.gender} {...register('gender')}>
                          <option value="">{p.select}</option>
                          <option value="male">{p.male}</option>
                          <option value="female">{p.female}</option>
                          <option value="other">{p.other}</option>
                        </Select>
                        <Select label={p.grade} {...register('grade_level')}>
                          <option value="">{p.select}</option>
                          <option value="nursery">Nursery</option>
                          <option value="lkg">LKG</option>
                          <option value="ukg">UKG</option>
                        </Select>
                      </FormGrid>
                      <CameraCapture label={p.photo} onChange={(file) => setPhotoFile(file)} />
                    </FormSection>

                    <FormSection title={p.parentInfo}>
                      <FormGrid>
                        <Input label={p.parentName} requiredMark error={errors.parent_name?.message} {...register('parent_name')} />
                        <Input label={p.parentPhone} requiredMark error={errors.parent_phone?.message} {...register('parent_phone')} />
                        <div className="span-full">
                          <Input label={p.parentEmail} type="email" {...register('parent_email')} />
                        </div>
                        <div className="span-full">
                          <Textarea label={p.address} rows={3} {...register('address')} />
                        </div>
                      </FormGrid>
                    </FormSection>

                    <button type="submit" className="btn-kidscholl w-full justify-center !py-4" disabled={isSubmitting}>
                      {isSubmitting ? p.submitting : p.submit}
                    </button>
                  </FormStack>
                </form>
              </FormCard>
            </FadeIn>
          </div>
        </div>
      </section>
      <SuccessModal open={successOpen} title={p.successTitle} message={p.successMessage} onClose={() => setSuccessOpen(false)} />
    </>
  )
}
