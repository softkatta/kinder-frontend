import { mediaUrl } from '@/utils/mediaUrl'

export interface ProfileImageField {
  key: string
  label: string
}

/** Image uploads grouped by Settings tab (same tab as related text content) */
export const SETTINGS_TAB_IMAGES: Record<string, readonly ProfileImageField[]> = {
  homepage: [
    { key: 'home_about_image', label: 'About Us section photo' },
    { key: 'home_why_image', label: 'Why Choose Us section photo (optional)' },
  ],
  about: [
    { key: 'page_about_image', label: 'Hero banner (/about)' },
    { key: 'about_page_image', label: 'Story — main photo' },
    { key: 'about_page_image_accent', label: 'Story — accent photo (optional)' },
  ],
  contact: [
    { key: 'page_contact_image', label: 'Hero banner (/contact)' },
  ],
  programs: [{ key: 'page_programs_image', label: 'Hero banner (/programs)' }],
  facilities: [{ key: 'page_facilities_image', label: 'Hero banner (/facilities)' }],
  activities: [{ key: 'page_activities_image', label: 'Hero banner (/activities)' }],
  curriculum: [{ key: 'page_curriculum_image', label: 'Hero banner (/curriculum)' }],
  staff: [{ key: 'page_staff_image', label: 'Hero banner (/staff)' }],
  events: [{ key: 'page_events_image', label: 'Hero banner (/events)' }],
  blog: [{ key: 'page_blog_image', label: 'Hero banner (/blog)' }],
  gallery: [{ key: 'page_gallery_image', label: 'Hero banner (/gallery)' }],
  careers: [{ key: 'page_careers_image', label: 'Hero banner (/careers)' }],
  faq: [{ key: 'page_faq_image', label: 'Hero banner (/faq)' }],
  admission: [{ key: 'page_admission_image', label: 'Hero banner (/admission)' }],
  book_tour: [{ key: 'page_book_tour_image', label: 'Hero banner (/book-tour)' }],
  payment: [{ key: 'page_payment_image', label: 'Hero banner (/payment)' }],
  live: [{ key: 'page_live_image', label: 'Hero banner (/live)' }],
  legal: [{ key: 'page_legal_image', label: 'Hero banner (privacy, terms, refund)' }],
}

/** Public pages managed in Settings (hero image only — body text in CMS) */
export const WEBSITE_PAGE_TABS = [
  { id: 'programs', label: 'Programs', desc: 'Hero banner — list content in CMS' },
  { id: 'facilities', label: 'Facilities', desc: 'Hero banner — list content in CMS' },
  { id: 'activities', label: 'Activities', desc: 'Hero banner — list content in CMS' },
  { id: 'curriculum', label: 'Curriculum', desc: 'Hero banner — page content in CMS' },
  { id: 'staff', label: 'Staff', desc: 'Hero banner — team in CMS' },
  { id: 'events', label: 'Events', desc: 'Hero banner — events in CMS' },
  { id: 'blog', label: 'Blog', desc: 'Hero banner — posts in CMS' },
  { id: 'gallery', label: 'Gallery', desc: 'Hero banner — albums in CMS' },
  { id: 'careers', label: 'Careers', desc: 'Hero banner — jobs in CMS' },
  { id: 'faq', label: 'FAQ', desc: 'Hero banner — questions in CMS' },
  { id: 'admission', label: 'Admission', desc: 'Hero banner — form labels in CMS' },
  { id: 'book_tour', label: 'Book a Tour', desc: 'Hero banner — form on public page' },
  { id: 'payment', label: 'Payment Info', desc: 'Hero banner — UPI details in Payments' },
  { id: 'live', label: 'Watch Live', desc: 'Hero banner — streams in Admin' },
  { id: 'legal', label: 'Legal Pages', desc: 'Hero banner — text in CMS Pages' },
] as const

export type WebsitePageTabId = (typeof WEBSITE_PAGE_TABS)[number]['id']

export const PROFILE_IMAGE_KEYS = Object.values(SETTINGS_TAB_IMAGES).flatMap((fields) =>
  fields.map((f) => f.key),
)

export type ProfileImageKey = (typeof PROFILE_IMAGE_KEYS)[number]

export function getProfileImage(
  profile: Record<string, string | undefined> | null | undefined,
  key: ProfileImageKey | string,
): string | undefined {
  const raw = profile?.[key]
  if (!raw) return undefined
  const url = mediaUrl(raw)
  return url || undefined
}
