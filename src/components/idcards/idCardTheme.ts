export type IdCardType = 'student' | 'teacher' | 'staff' | 'parent' | 'guest'

export interface IdCardTheme {
  gradient_start: string
  gradient_mid: string
  gradient_end: string
  accent: string
  badge_bg: string
  badge_text: string
}

export const ID_CARD_THEMES: Record<IdCardType, IdCardTheme> = {
  student: {
    gradient_start: '#312E81',
    gradient_mid: '#4F46E5',
    gradient_end: '#7C3AED',
    accent: '#818CF8',
    badge_bg: 'rgba(255,255,255,0.22)',
    badge_text: '#FFFFFF',
  },
  teacher: {
    gradient_start: '#064E3B',
    gradient_mid: '#059669',
    gradient_end: '#0D9488',
    accent: '#34D399',
    badge_bg: 'rgba(255,255,255,0.22)',
    badge_text: '#FFFFFF',
  },
  staff: {
    gradient_start: '#78350F',
    gradient_mid: '#D97706',
    gradient_end: '#B45309',
    accent: '#FBBF24',
    badge_bg: 'rgba(255,255,255,0.22)',
    badge_text: '#FFFFFF',
  },
  parent: {
    gradient_start: '#581C87',
    gradient_mid: '#7C3AED',
    gradient_end: '#DB2777',
    accent: '#E879F9',
    badge_bg: 'rgba(255,255,255,0.22)',
    badge_text: '#FFFFFF',
  },
  guest: {
    gradient_start: '#134E4A',
    gradient_mid: '#0F766E',
    gradient_end: '#059669',
    accent: '#2DD4BF',
    badge_bg: 'rgba(255,255,255,0.22)',
    badge_text: '#FFFFFF',
  },
}

export const ID_CARD_TYPE_LABELS: Record<IdCardType, string> = {
  student: 'Student',
  teacher: 'Teacher',
  staff: 'Staff',
  parent: 'Parent',
  guest: 'Guest Pass',
}

/** CR80 aspect ratio */
export const CR80_ASPECT = 85.6 / 53.98

/** Premium multi-layer gradient background for preview & print */
export function cardBackgroundGradient(theme: IdCardTheme, side: 'front' | 'back'): string {
  const angle = side === 'front' ? '135deg' : '160deg'
  const mid = theme.gradient_mid ?? theme.accent ?? theme.gradient_end
  return [
    `radial-gradient(ellipse 85% 65% at 12% 8%, rgba(255,255,255,0.2) 0%, transparent 55%)`,
    `radial-gradient(ellipse 75% 55% at 92% 92%, rgba(0,0,0,0.22) 0%, transparent 50%)`,
    `linear-gradient(${angle}, ${theme.gradient_start} 0%, ${mid} 48%, ${theme.gradient_end} 100%)`,
  ].join(', ')
}

export interface IdCardViewData {
  id?: number
  card_type: IdCardType
  card_number: string
  qr_token: string
  status: string
  full_name: string
  photo_url?: string | null
  blood_group?: string | null
  academic_year?: string
  issue_date: string
  expiry_date: string
  issue_date_raw?: string
  expiry_date_raw?: string
  emergency_contact?: string | null
  role_label: string
  role_badge: string
  meta?: Record<string, string>
  school: {
    name: string
    short_name?: string
    address: string
    phone: string
    email: string
    website: string
  }
  theme: IdCardTheme
  qr_data_uri?: string
  initials: string
  validity_label: string
  subtitle_lines: string[]
  back_note: string
}

export const META_FIELDS: Record<IdCardType, { key: string; label: string }[]> = {
  student: [
    { key: 'admission_number', label: 'Admission Number' },
    { key: 'roll_number', label: 'Roll Number' },
    { key: 'class_name', label: 'Class' },
    { key: 'section_name', label: 'Section' },
    { key: 'parent_name', label: 'Parent Name' },
    { key: 'parent_phone', label: 'Parent Phone' },
  ],
  teacher: [
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'designation', label: 'Designation' },
    { key: 'department', label: 'Department' },
  ],
  staff: [
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
  ],
  parent: [
    { key: 'parent_id', label: 'Parent ID' },
    { key: 'relationship', label: 'Relationship' },
    { key: 'student_names', label: 'Student Name(s)' },
  ],
  guest: [
    { key: 'visitor_id', label: 'Visitor ID' },
    { key: 'company', label: 'Company / Organization' },
    { key: 'purpose', label: 'Purpose of Visit' },
    { key: 'valid_from', label: 'Valid From' },
    { key: 'valid_until', label: 'Valid Until' },
  ],
}
