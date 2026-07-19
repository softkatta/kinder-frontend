export type PaperSize = 'a4_portrait' | 'a4_landscape'
export type Orientation = 'portrait' | 'landscape'
export type TemplateObjectType = 'variable' | 'asset' | 'line' | 'grid'
export type TemplateDataType = 'text' | 'image' | 'table' | 'signature' | 'asset' | 'line' | 'grid'

export interface TemplateField {
  id: string
  objectType?: TemplateObjectType
  variableKey?: string
  dataType: TemplateDataType
  label?: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fontFamily?: string
  fontSize?: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  color?: string
  textAlign?: 'left' | 'center' | 'right'
  imagePath?: string
  imageUrl?: string
  lineThickness?: number
  lineDirection?: 'horizontal' | 'vertical'
  lineStyle?: 'solid' | 'dashed' | 'dotted'
  gridRows?: number
  gridCols?: number
  gridHeaders?: string[]
  gridShowHeader?: boolean
  borderColor?: string
  borderWidth?: number
  cellFontSize?: number
}

export interface CanvasJson {
  version: number
  settings: {
    width: number
    height: number
    unit: string
    gridSize: number
    snapToGrid: boolean
    showGrid: boolean
  }
  objects: TemplateField[]
}

export interface TemplateCategory {
  id: number
  name: string
  slug: string
  default_background_image?: string | null
  default_background_url?: string | null
}

export interface TemplateVariable {
  id: number
  key: string
  label: string
  group: string
  data_type: string
  applies_to?: string[]
  tag: string
  sample_value?: string
}

export interface TemplateRow {
  id: number
  name: string
  slug: string
  description?: string
  category_id: number
  category?: TemplateCategory
  paper_size: PaperSize
  orientation: Orientation
  background_image?: string
  background_url?: string
  is_active: boolean
  updated_at?: string
}

export interface TemplateDetail extends TemplateRow {
  canvas_json: CanvasJson
}

export interface TemplateAssetPreset {
  label: string
  path: string
  url: string
}

export const CERTIFICATE_CATEGORY_SLUGS = [
  'graduation_certificate',
  'achievement_certificate',
  'participation_certificate',
  'winner_certificate',
  'best_attendance_certificate',
  'good_behaviour_certificate',
  'creativity_award_certificate',
  'birthday_certificate',
  'bonafide',
  'leaving_certificate',
  'certificate', // legacy
] as const

export function isCertificateCategory(slug?: string | null): boolean {
  if (!slug) return false
  return (CERTIFICATE_CATEGORY_SLUGS as readonly string[]).includes(slug)
}

export const CATEGORY_FIELD_GUIDES: Record<string, { common: string[]; specific: string[] }> = {
  graduation_certificate: {
    common: ['school_logo', 'school_name', 'student_photo', 'student_name', 'admission_number', 'class', 'section', 'academic_year', 'issue_date', 'principal_signature', 'school_seal', 'qr_code', 'certificate_number'],
    specific: ['graduation_title', 'completion_message', 'event_name', 'promotion_to_class', 'session'],
  },
  achievement_certificate: {
    common: ['school_logo', 'school_name', 'student_name', 'class', 'academic_year', 'issue_date', 'principal_signature', 'qr_code', 'certificate_number'],
    specific: ['achievement_title', 'achievement_description', 'award_name', 'event_name', 'rank'],
  },
  participation_certificate: {
    common: ['school_logo', 'student_name', 'class', 'issue_date', 'principal_signature', 'qr_code'],
    specific: ['event_name', 'participation_message', 'activity_name', 'academic_year'],
  },
  winner_certificate: {
    common: ['school_logo', 'student_name', 'class', 'issue_date', 'qr_code'],
    specific: ['competition_name', 'position', 'prize', 'event_date', 'event_name'],
  },
  best_attendance_certificate: {
    common: ['student_name', 'class', 'academic_year', 'principal_signature'],
    specific: ['attendance_percentage', 'total_working_days', 'days_present', 'award_message'],
  },
  good_behaviour_certificate: {
    common: ['student_name', 'class', 'academic_year', 'issue_date'],
    specific: ['behaviour_rating', 'teacher_remarks', 'appreciation_message'],
  },
  creativity_award_certificate: {
    common: ['student_name', 'class', 'issue_date'],
    specific: ['activity', 'competition', 'award_title', 'teacher_name', 'remarks'],
  },
  birthday_certificate: {
    common: ['student_name', 'student_photo', 'issue_date', 'principal_signature'],
    specific: ['birth_date', 'birthday_wishes', 'age'],
  },
  bonafide: {
    common: ['school_logo', 'school_name', 'school_address', 'school_contact'],
    specific: ['student_name', 'admission_number', 'class', 'section', 'dob', 'father_name', 'mother_name', 'academic_year', 'certificate_number', 'purpose', 'issue_date', 'principal_signature', 'school_seal', 'qr_code'],
  },
  leaving_certificate: {
    common: ['school_logo', 'school_name'],
    specific: ['student_name', 'admission_number', 'gr_number', 'dob', 'gender', 'father_name', 'mother_name', 'address', 'class', 'academic_year', 'leaving_date', 'reason_for_leaving', 'last_attendance_date', 'conduct', 'result', 'principal_signature', 'school_seal', 'qr_code'],
  },
}

export const ERP_COMMON_VARIABLES = [
  'school_logo', 'school_name', 'school_address', 'student_photo', 'student_name',
  'admission_number', 'gr_number', 'roll_number', 'class', 'section', 'academic_year',
  'dob', 'age', 'gender', 'father_name', 'mother_name', 'address', 'issue_date',
  'certificate_number', 'category_name', 'principal_name', 'principal_signature', 'school_seal', 'qr_code',
  'teacher_name', 'remarks',
] as const

export const CERTIFICATE_LAYOUT_FIELDS = [
  { key: 'certificate_number', label: 'Certificate ID (top-left)' },
  { key: 'school_logo', label: 'School Logo (top-center)' },
  { key: 'school_tagline', label: 'School Tagline' },
  { key: 'category_name', label: 'Category name only (e.g. Achievement)' },
  { key: 'certificate_title', label: 'CERTIFICATE heading' },
  { key: 'certificate_subtitle', label: 'of Achievement / Completion' },
  { key: 'certify_intro', label: 'This is to Certify that' },
  { key: 'student_name', label: 'Student Name (large, center)' },
  { key: 'roll_number_labeled', label: 'Roll No. with label (e.g. Roll No. 12)' },
  { key: 'label_roll_number', label: 'Roll number label only' },
  { key: 'roll_number', label: 'Roll number value only' },
  { key: 'achievement_description', label: 'Course / Achievement text' },
  { key: 'class', label: 'Class' },
  { key: 'academic_year', label: 'Academic Year' },
  { key: 'grade', label: 'Grade' },
  { key: 'issue_date', label: 'Issue Date' },
  { key: 'label_issue_date', label: 'Issue Date label' },
  { key: 'instructor_name', label: 'Teacher / Instructor name' },
  { key: 'label_instructor', label: 'Instructor label' },
  { key: 'principal_signature', label: 'Principal Signature' },
  { key: 'principal_name', label: 'Principal Name' },
  { key: 'verification_url', label: 'Verification URL (bottom)' },
] as const

export const TEMPLATE_ASSET_PRESETS: TemplateAssetPreset[] = [
  {
    label: 'Certified Seal',
    path: 'templates/assets/certified-seal.png',
    url: '/storage/templates/assets/certified-seal.png',
  },
]

export function emptyCanvas(w = 210, h = 297): CanvasJson {
  return {
    version: 2,
    settings: { width: w, height: h, unit: 'mm', gridSize: 5, snapToGrid: true, showGrid: false },
    objects: [],
  }
}

function newId() {
  return `fld_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`
}

export function newField(variable: TemplateVariable): TemplateField {
  const isImage = ['image', 'signature'].includes(variable.data_type)
  const isTable = variable.data_type === 'table'

  return {
    id: newId(),
    objectType: 'variable',
    variableKey: variable.key,
    dataType: isTable ? 'table' : isImage ? (variable.data_type === 'signature' ? 'signature' : 'image') : 'text',
    label: variable.label,
    x: 20,
    y: 20,
    width: isTable ? 170 : isImage ? 35 : 80,
    height: isTable ? 60 : isImage ? 35 : 12,
    rotation: 0,
    fontFamily: 'DejaVu Sans',
    fontSize: 14,
    bold: false,
    italic: false,
    underline: false,
    color: '#111111',
    textAlign: 'left',
  }
}

export function newAssetField(path: string, url: string, label = 'Icon'): TemplateField {
  return {
    id: newId(),
    objectType: 'asset',
    dataType: 'asset',
    label,
    imagePath: path,
    imageUrl: url,
    x: 20,
    y: 20,
    width: 35,
    height: 35,
    rotation: 0,
  }
}

export function newLineField(direction: 'horizontal' | 'vertical' = 'horizontal'): TemplateField {
  const horizontal = direction === 'horizontal'

  return {
    id: newId(),
    objectType: 'line',
    dataType: 'line',
    label: horizontal ? 'Horizontal Line' : 'Vertical Line',
    lineDirection: direction,
    lineThickness: 0.4,
    lineStyle: 'solid',
    color: '#111111',
    x: 20,
    y: 100,
    width: horizontal ? 80 : 1,
    height: horizontal ? 2 : 60,
    rotation: 0,
  }
}

export function newGridField(rows = 5, cols = 4, headers = ['Subject', 'Max', 'Obtained', 'Grade']): TemplateField {
  return {
    id: newId(),
    objectType: 'grid',
    dataType: 'grid',
    label: 'Table',
    gridRows: rows,
    gridCols: cols,
    gridHeaders: headers.slice(0, cols),
    gridShowHeader: true,
    borderColor: '#94a3b8',
    borderWidth: 0.3,
    cellFontSize: 9,
    x: 20,
    y: 80,
    width: 170,
    height: 70,
    rotation: 0,
  }
}

export function fieldDisplayName(field: TemplateField): string {
  if (field.objectType === 'asset' || field.dataType === 'asset') return field.label ?? 'Icon'
  if (field.objectType === 'line' || field.dataType === 'line') return field.label ?? 'Line'
  if (field.objectType === 'grid' || field.dataType === 'grid') return field.label ?? 'Table'
  return field.variableKey ? `{{${field.variableKey}}}` : 'Field'
}
