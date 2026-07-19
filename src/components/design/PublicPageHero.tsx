import { PageHero } from '@/components/design/PageHero'
import type { Crumb } from '@/components/public/PageBreadcrumbs'
import { getProfileImage, type ProfileImageKey } from '@/config/pageImages'
import { useSchoolProfile } from '@/contexts/SchoolProfileContext'

interface PublicPageHeroProps {
  imageKey: ProfileImageKey
  label?: string
  title: string
  subtitle?: string
  className?: string
  breadcrumbs?: Crumb[]
  /** CMS or detail image overrides settings hero when set */
  backgroundImage?: string | null
}

export function PublicPageHero({
  imageKey,
  backgroundImage,
  ...props
}: PublicPageHeroProps) {
  const profile = useSchoolProfile()
  const fromSettings = getProfileImage(profile, imageKey)
  const bg = backgroundImage || fromSettings

  return <PageHero {...props} backgroundImage={bg} />
}
