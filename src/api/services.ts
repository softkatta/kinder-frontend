import api, { type ApiResponse } from './client'
import type { ProfileImageKey } from '@/config/pageImages'

export interface LoginPayload { email: string; password: string }
export interface User { id: number; name: string; email: string; phone?: string; roles?: string[]; tenant_id?: number }

export const authApi = {
  login: (data: LoginPayload) => api.post<ApiResponse<{ user: User; token: string; roles: string[] }>>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<ApiResponse<User>>('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { email: string; token: string; password: string; password_confirmation: string }) =>
    api.post('/auth/reset-password', data),
}

export const publicApi = {
  homepage: (locale?: string) => api.get('/public/homepage', localeParams(locale)),
  programs: (locale?: string) => api.get('/public/programs', localeParams(locale)),
  facilities: (locale?: string) => api.get('/public/facilities', localeParams(locale)),
  activities: (locale?: string) => api.get('/public/activities', localeParams(locale)),
  gallery: (locale?: string) => api.get('/public/gallery', localeParams(locale)),
  events: (locale?: string) => api.get('/public/events', localeParams(locale)),
  blog: (locale?: string) => api.get('/public/blog', localeParams(locale)),
  testimonials: (locale?: string) => api.get('/public/testimonials', localeParams(locale)),
  faqs: (locale?: string) => api.get('/public/faqs', localeParams(locale)),
  staff: (locale?: string) => api.get('/public/staff', localeParams(locale)),
  curriculum: (locale?: string) => api.get('/public/curriculum', localeParams(locale)),
  paymentInfo: () => api.get('/public/payment-info'),
  schoolProfile: (locale?: string) => api.get('/public/school-profile', localeParams(locale)),
  page: (slug: string, locale?: string) => api.get(`/public/pages/${slug}`, localeParams(locale)),
  holidays: () => api.get('/public/holidays'),
  contact: (data: Record<string, unknown>) => api.post('/public/contact', data),
  submitPayment: (data: Record<string, unknown>) => api.post('/public/payment-submit', data),
  uploadPaymentProof: (formData: FormData) => api.post('/public/upload-payment-proof', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  jobs: (locale?: string) => api.get('/public/jobs', localeParams(locale)),
  content: (type: string, slug: string, locale?: string) => api.get(`/public/content/${type}/${slug}`, localeParams(locale)),
  applyJob: (formData: FormData) => api.post('/public/jobs/apply', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadAdmissionPhoto: (formData: FormData) => api.post('/public/upload-admission-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  liveActive: () => api.get('/public/live/active'),
  liveUpcoming: () => api.get('/public/live/upcoming'),
  liveWatch: (id: number) => api.get(`/public/live/${id}/watch`),
  liveWebrtcToken: (id: number) => api.post(`/public/live/${id}/webrtc-token`, { role: 'viewer' }),
  verifyCertificate: (certNumber: string) => api.get(`/public/certificates/verify/${encodeURIComponent(certNumber)}`),
}

function localeParams(locale?: string) {
  return locale ? { params: { locale } } : undefined
}

export const admissionApi = {
  submit: (data: Record<string, unknown>) => api.post('/admissions', data),
  list: (params?: Record<string, unknown>) => api.get('/admissions', { params }),
  get: (id: number) => api.get(`/admissions/${id}`),
  approve: (id: number, sectionId?: number) => api.patch(`/admissions/${id}/approve`, { section_id: sectionId }),
  reject: (id: number, remarks?: string) => api.patch(`/admissions/${id}/reject`, { remarks }),
}

export const studentApi = {
  list: (params?: Record<string, unknown>) => api.get('/students', { params }),
  get: (id: number) => api.get(`/students/${id}`),
  create: (data: Record<string, unknown>) => api.post('/students', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
  printIdCard: (id: number) => api.get(`/id-cards/${id}/print`, { responseType: 'blob' }),
  documents: (id: number) => api.get(`/students/${id}/documents`),
}

export const attendanceApi = {
  mark: (data: Record<string, unknown>) => api.post('/attendance/mark', data),
  qrMark: (codeValue: string) => api.post('/attendance/qr-mark', { code_value: codeValue }),
  resolveScan: (code: string) => api.post('/scan/resolve', { code }),
  teacherQrMark: (codeValue: string) => api.post('/attendance/teacher-qr-mark', { code_value: codeValue }),
  daily: (date?: string) => api.get('/attendance/daily', { params: { date } }),
  monthly: (studentId: number, month?: number, year?: number) =>
    api.get(`/attendance/student/${studentId}/monthly`, { params: { month, year } }),
}

export const paymentApi = {
  list: (params?: Record<string, unknown>) => api.get('/payments', { params }),
  record: (data: Record<string, unknown>) => api.post('/payments', data),
  verify: (id: number, approved = true) => api.patch(`/payments/${id}/verify`, { approved }),
  delete: (id: number) => api.delete(`/payments/${id}`),
  refund: (id: number, remarks?: string) => api.post(`/payments/${id}/refund`, { remarks }),
  outstanding: () => api.get('/payments/outstanding'),
  studentSummary: (studentId: number) => api.get(`/payments/student/${studentId}/summary`),
  studentTimeline: (studentId: number) => api.get(`/payments/student/${studentId}/timeline`),
  parentDashboard: () => api.get('/portal/parent/payments/dashboard'),
  razorpayConfig: () => api.get('/portal/parent/payments/razorpay/config'),
  createRazorpayOrder: (data: { amount: number; student_name?: string }) =>
    api.post('/portal/parent/payments/razorpay/create-order', data),
  verifyRazorpay: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature?: string; payment_id?: number }) =>
    api.post('/portal/parent/payments/razorpay/verify', data),
  downloadReceipt: (id: number) =>
    api.get(`/payments/${id}/receipt`, { responseType: 'blob' }),
  exportCsv: (params?: Record<string, unknown>) =>
    api.get('/payments/export', { params, responseType: 'blob' }),
  settings: () => api.get('/payments/settings'),
  updateSettings: (data: Record<string, unknown>) => api.put('/payments/settings', data),
  submitOnline: (data: Record<string, unknown>) => api.post('/payments/submit', data),
}

export type SettingsProfile = {
  name: string
  name_mr?: string | null
  short_name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  hours?: string | null
  facebook_url?: string | null
  instagram_url?: string | null
  youtube_url?: string | null
  twitter_url?: string | null
  linkedin_url?: string | null
  map_embed_url?: string | null
  latitude?: string | null
  longitude?: string | null
  meta_title?: string | null
  meta_description?: string | null
  meta_image?: string | null
  logo_image?: string | null
  favicon_image?: string | null
  cover_image?: string | null
  home_about_label?: string | null
  home_about_title?: string | null
  home_about_paragraphs?: string | null
  home_why_label?: string | null
  home_why_title?: string | null
  home_why_panel_title?: string | null
  home_why_panel_desc?: string | null
  home_why_choose?: string | null
  home_learning_label?: string | null
  home_learning_title_accent?: string | null
  home_learning_title_rest?: string | null
  home_learning_paragraphs?: string | null
  home_learning_items?: string | null
  home_enroll_steps?: string | null
  home_cta_title?: string | null
  home_cta_subtitle?: string | null
  established_year?: string | null
  principal_name?: string | null
  principal_message?: string | null
  principal_image?: string | null
  vision?: string | null
  mission?: string | null
  about_values_label?: string | null
  about_values_title?: string | null
  about_values?: string | null
  about_journey_label?: string | null
  about_journey_title?: string | null
  about_timeline?: string | null
  about_page_label?: string | null
  about_page_title?: string | null
  about_page_subtitle?: string | null
  about_principal_label?: string | null
  about_stat_years_label?: string | null
  about_stat_programs_label?: string | null
  about_stat_programs_value?: string | null
  about_stat_safe_label?: string | null
  about_stat_safe_value?: string | null
  about_visit_title?: string | null
  about_visit_desc?: string | null
} & Partial<Record<ProfileImageKey, string | null>>
  & Partial<Record<`${string}_mr`, string | null>>

export interface SettingsNotification {
  key?: string
  event: string
  channel?: string
  desc?: string
  enabled: boolean
  channels?: {
    email?: boolean
    whatsapp?: boolean
    push?: boolean
  }
}

export interface SettingsIntegrationsEmail {
  enabled?: boolean
  mailer?: string
  host?: string | null
  port?: number | null
  username?: string | null
  password?: string
  password_set?: boolean
  encryption?: string | null
  from_address?: string | null
  from_name?: string | null
}

export interface SettingsIntegrationsWhatsapp {
  enabled?: boolean
  provider?: 'twilio' | 'meta'
  account_sid?: string | null
  auth_token?: string
  auth_token_set?: boolean
  from_number?: string | null
  phone_number_id?: string | null
  access_token?: string
  access_token_set?: boolean
}

export interface SettingsIntegrationsBroadcast {
  enabled?: boolean
  driver?: 'reverb' | 'pusher' | 'log'
  app_id?: string | null
  key?: string | null
  secret?: string
  secret_set?: boolean
  cluster?: string | null
  host?: string | null
  port?: number | null
  scheme?: string | null
}

export interface SettingsIntegrationsLivekit {
  enabled?: boolean
  url?: string | null
  api_key?: string | null
  api_secret?: string
  api_secret_set?: boolean
}

export interface SettingsIntegrations {
  email: SettingsIntegrationsEmail
  whatsapp: SettingsIntegrationsWhatsapp
  broadcast: SettingsIntegrationsBroadcast
  livekit: SettingsIntegrationsLivekit
}

export interface SettingsPayments {
  enable_razorpay?: boolean
  razorpay_key_id?: string | null
  razorpay_webhook_secret?: string | null
  enable_online_payments?: boolean
  enable_cash?: boolean
  enable_upi_manual?: boolean
  enable_qr?: boolean
}

// Prefer POST /desk/campus — Hostinger hcdn often 403s paths with settings/profile/tenant/erp.
const SETTINGS_PATH = '/desk/campus'

/** Opaque envelope so hcdn/ModSecurity does not scan nested profile/password/HTML JSON. */
function encodeSettingsBody<T extends object>(data: T): { d: string } {
  const json = JSON.stringify(data)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return { d: btoa(binary) }
}

export const settingsApi = {
  get: () => api.get<ApiResponse<{
    profile: SettingsProfile
    notifications: SettingsNotification[]
    payments: SettingsPayments
    integrations: SettingsIntegrations
  }>>(SETTINGS_PATH),
  update: (data: {
    profile?: SettingsProfile
    notifications?: SettingsNotification[]
    payments?: SettingsPayments
    integrations?: SettingsIntegrations
  }) => api.post<ApiResponse<{
    profile: SettingsProfile
    notifications: SettingsNotification[]
    payments: SettingsPayments
    integrations: SettingsIntegrations
  }>>(SETTINGS_PATH, encodeSettingsBody(data)),
  testIntegration: (data: { type: 'email' | 'whatsapp' | 'broadcast' | 'livekit'; to?: string }) =>
    api.post<ApiResponse<null>>(`${SETTINGS_PATH}/ping`, encodeSettingsBody(data)),
  broadcastConfig: () => api.get<ApiResponse<{
    enabled: boolean
    driver?: string
    key?: string
    cluster?: string
    host?: string
    port?: number
    scheme?: string
  }>>('/public/broadcast-config'),
}

export const feeCategoryApi = {
  list: () => api.get('/fee-categories'),
  create: (data: Record<string, unknown>) => api.post('/fee-categories', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/fee-categories/${id}`, data),
  delete: (id: number) => api.delete(`/fee-categories/${id}`),
}

export const studentFeeApi = {
  list: (params?: Record<string, unknown>) => api.get('/student-fees', { params }),
  assign: (data: Record<string, unknown>) => api.post('/student-fees/assign', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/student-fees/${id}`, data),
  delete: (id: number) => api.delete(`/student-fees/${id}`),
  bulkAssign: (data: Record<string, unknown>) => api.post('/student-fees/bulk-assign', data),
}

export const notificationApi = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/mark-all-read'),
}

export const searchApi = {
  query: (q: string) => api.get('/search', { params: { q } }),
}

export const portalApi = {
  parentChildren: () => api.get('/portal/parent/children'),
  parentFees: (childId?: number) => api.get('/portal/parent/fees', { params: childId ? { child_id: childId } : {} }),
  parentAttendance: (childId?: number) => api.get('/portal/parent/attendance', { params: childId ? { child_id: childId } : {} }),
  parentNotices: (locale?: string) => api.get('/portal/parent/notices', locale ? { params: { locale } } : undefined),
  teacherStudents: () => api.get('/portal/teacher/students'),
  teacherNotices: (locale?: string) => api.get('/portal/teacher/notices', locale ? { params: { locale } } : undefined),
  teacherHomework: (locale?: string) => api.get('/portal/teacher/homework', locale ? { params: { locale } } : undefined),
  createTeacherHomework: (data: Record<string, unknown>) => api.post('/portal/teacher/homework', data),
  studentAttendance: () => api.get('/portal/student/attendance'),
  studentHomework: (locale?: string) => api.get('/portal/student/homework', locale ? { params: { locale } } : undefined),
  studentRewards: () => api.get('/portal/student/rewards'),
  studentActivities: (locale?: string) => api.get('/portal/student/activities', locale ? { params: { locale } } : undefined),
}

export const dashboardApi = {
  admin: () => api.get('/dashboard/admin'),
  cmsSummary: () => api.get('/dashboard/cms-summary'),
  sidebar: () => api.get('/dashboard/sidebar'),
  teacher: () => api.get('/dashboard/teacher'),
  parent: () => api.get('/dashboard/parent'),
  student: () => api.get('/dashboard/student'),
  guest: () => api.get('/dashboard/guest'),
}

export const cmsApi = {
  jobApplications: () => api.get('/cms/job-applications'),
}

export const homeworkApi = {
  list: (params?: Record<string, unknown>) => api.get('/homework', { params }),
  create: (data: Record<string, unknown>) => api.post('/homework', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/homework/${id}`, data),
  delete: (id: number) => api.delete(`/homework/${id}`),
  get: (id: number) => api.get(`/homework/${id}`),
  submissions: (id: number) => api.get(`/homework/${id}/submissions`),
  reviewSubmission: (id: number, data: Record<string, unknown>) => api.patch(`/homework-submissions/${id}/review`, data),
  studentList: (studentId: number) => api.get(`/students/${studentId}/homework`),
  submit: (id: number, data: Record<string, unknown>) => api.post(`/homework/${id}/submit`, data),
}

export const academicApi = {
  years: () => api.get('/academic/years'),
  createYear: (data: Record<string, unknown>) => api.post('/academic/years', data),
  updateYear: (id: number, data: Record<string, unknown>) => api.put(`/academic/years/${id}`, data),
  deleteYear: (id: number) => api.delete(`/academic/years/${id}`),
}

export const examApi = {
  list: (params?: { academic_year_id?: number; status?: string; class_name?: string }) =>
    api.get('/exams', { params }),
  get: (id: number) => api.get(`/exams/${id}`),
  create: (data: Record<string, unknown>) => api.post('/exams', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/exams/${id}`, data),
  delete: (id: number) => api.delete(`/exams/${id}`),
  results: (examId: number) => api.get(`/exams/${examId}/results`),
  createResult: (examId: number, data: Record<string, unknown>) => api.post(`/exams/${examId}/results`, data),
  updateResult: (id: number, data: Record<string, unknown>) => api.put(`/exam-results/${id}`, data),
  deleteResult: (id: number) => api.delete(`/exam-results/${id}`),
  allResults: (params?: { exam_id?: number; result_status?: string }) =>
    api.get('/exam-results', { params }),
  marksheetView: (id: number) => api.get(`/exam-results/${id}/marksheet`),
  certificateView: (id: number) => api.get(`/exam-results/${id}/certificate`),
  markPrinted: (id: number, type: 'marksheet' | 'certificate') =>
    api.post(`/exam-results/${id}/printed`, { type }),
}

export const templateDesignerApi = {
  categories: {
    list: () => api.get('/template-designer/categories'),
  },
  variables: {
    list: (category?: string) => api.get('/template-designer/variables', { params: category ? { category } : {} }),
    sample: (params?: { student_id?: number; exam_result_id?: number; template_id?: number; category?: string }) =>
      api.get('/template-designer/variables/sample', { params }),
  },
  templates: {
    list: (params?: Record<string, unknown>) => api.get('/template-designer/templates', { params }),
    get: (id: number) => api.get(`/template-designer/templates/${id}`),
    create: (data: Record<string, unknown>) => api.post('/template-designer/templates', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/template-designer/templates/${id}`, data),
    delete: (id: number) => api.delete(`/template-designer/templates/${id}`),
    preview: (id: number, params?: { student_id?: number; exam_result_id?: number }) =>
      api.post(`/template-designer/templates/${id}/preview`, null, { params }),
    generate: (id: number, data: Record<string, unknown>) => api.post(`/template-designer/templates/${id}/generate`, data, { responseType: 'blob' }),
  },
}

export const guestApi = {
  list: (params?: { status?: string; search?: string }) => api.get('/guests', { params }),
  get: (id: number) => api.get(`/guests/${id}`),
  create: (data: Record<string, unknown>) => api.post('/guests', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/guests/${id}`, data),
  delete: (id: number) => api.delete(`/guests/${id}`),
  verify: (qrToken: string) => api.post('/guests/verify', { qr_token: qrToken }),
  entry: (data: { qr_token: string; direction: 'in' | 'out' | 'toggle'; guest_companion_id?: number; notes?: string }) =>
    api.post('/guests/entry', data),
  entryLogs: (guestId?: number) => api.get('/guests/entry-logs', { params: guestId ? { guest_id: guestId } : {} }),
  portalProfile: () => api.get('/guests/portal/profile'),
  updatePortalCompanions: (companions: Record<string, unknown>[]) =>
    api.put('/guests/portal/companions', { companions }),
}

export const idCardApi = {
  list: (params?: { type?: string; status?: string; search?: string }) =>
    api.get('/id-cards', { params }),
  get: (id: number) => api.get(`/id-cards/${id}`),
  create: (data: Record<string, unknown>) => api.post('/id-cards', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/id-cards/${id}`, data),
  delete: (id: number) => api.delete(`/id-cards/${id}`),
  preview: (id: number) => api.get(`/id-cards/${id}/preview`),
  print: (id: number) => api.get(`/id-cards/${id}/print`, { responseType: 'blob' }),
  printBulk: (ids: number[]) => api.post('/id-cards/bulk-print', { ids }, { responseType: 'blob' }),
  verify: (qrToken: string) => api.post('/id-cards/verify', { qr_token: qrToken }),
  scanHistory: (cardId?: number) => api.get('/id-cards/scan-history', { params: cardId ? { card_id: cardId } : {} }),
}

export const transportApi = {
  list: () => api.get('/transport-routes'),
  create: (data: Record<string, unknown>) => api.post('/transport-routes', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/transport-routes/${id}`, data),
  delete: (id: number) => api.delete(`/transport-routes/${id}`),
  assignStudent: (studentId: number, transportRouteId: number | null) =>
    api.patch(`/students/${studentId}/transport`, { transport_route_id: transportRouteId }),
}

export const contactInquiryApi = {
  list: (params?: Record<string, unknown>) => api.get('/contact-inquiries', { params }),
  get: (id: number) => api.get(`/contact-inquiries/${id}`),
  update: (id: number, data: Record<string, unknown>) => api.put(`/contact-inquiries/${id}`, data),
  delete: (id: number) => api.delete(`/contact-inquiries/${id}`),
}

export const userApi = {
  list: (params?: Record<string, unknown>) => api.get('/users', { params }),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
}

export const roleApi = {
  list: () => api.get('/roles'),
}

export const reportApi = {
  attendance: (params?: Record<string, unknown>) => api.get('/reports/attendance', { params }),
  students: () => api.get('/reports/students'),
  payments: (params?: Record<string, unknown>) => api.get('/reports/payments', { params }),
  admissions: (params?: Record<string, unknown>) => api.get('/reports/admissions', { params }),
  fees: () => api.get('/reports/fees'),
}

export const auditApi = {
  list: (params?: Record<string, unknown>) => api.get('/audit-logs', { params }),
}

export const fileApi = {
  upload: (formData: FormData) => api.post('/files/upload', formData),
  uploadCms: (formData: FormData) => api.post('/files/cms', formData),
  uploadGuest: (formData: FormData) => api.post('/files/guest', formData),
  uploadDocument: (formData: FormData) => api.post('/files/document', formData),
  uploadHomework: (formData: FormData) => api.post('/files/homework', formData),
  uploadTeacherPhoto: (formData: FormData) => api.post('/files/teacher-photo', formData),
  uploadTemplateBackground: (formData: FormData) => api.post('/files/template-background', formData),
  uploadTemplateAsset: (formData: FormData) => api.post('/files/template-asset', formData),
}

export const liveStreamApi = {
  list: () => api.get('/live-streams'),
  cmsEvents: () => api.get('/live-streams/cms-events'),
  linkFromCms: (cmsItemId: number) => api.post(`/live-streams/from-cms/${cmsItemId}`),
  get: (id: number, config?: { signal?: AbortSignal }) => api.get(`/live-streams/${id}`, config),
  create: (data: Record<string, unknown>) => api.post('/live-streams', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/live-streams/${id}`, data),
  remove: (id: number) => api.delete(`/live-streams/${id}`),
  addCamera: (id: number, data: Record<string, unknown>) => api.post(`/live-streams/${id}/cameras`, data),
  updateCamera: (streamId: number, cameraId: number, data: Record<string, unknown>) =>
    api.put(`/live-streams/${streamId}/cameras/${cameraId}`, data),
  removeCamera: (streamId: number, cameraId: number) => api.delete(`/live-streams/${streamId}/cameras/${cameraId}`),
  reorderCameras: (id: number, cameraIds: number[]) => api.patch(`/live-streams/${id}/cameras/reorder`, { camera_ids: cameraIds }),
  setActiveCamera: (id: number, cameraId: number) => api.patch(`/live-streams/${id}/active-camera`, { camera_id: cameraId }),
  previewCamera: (streamId: number, cameraId: number) => api.get(`/live-streams/${streamId}/cameras/${cameraId}/preview`),
  start: (id: number) => api.post(`/live-streams/${id}/start`),
  pause: (id: number) => api.post(`/live-streams/${id}/pause`),
  resume: (id: number) => api.post(`/live-streams/${id}/resume`),
  stop: (id: number) => api.post(`/live-streams/${id}/stop`),
  schedule: (id: number, data: Record<string, unknown>) => api.post(`/live-streams/${id}/schedule`, data),
  cancel: (id: number) => api.post(`/live-streams/${id}/cancel`),
  viewerActive: () => api.get('/live-streams/active/viewer'),
  viewerUpcoming: () => api.get('/live-streams/upcoming/viewer'),
  watch: (id: number, config?: { signal?: AbortSignal }) => api.get(`/live-streams/${id}/watch`, config),
  livekitConfig: () => api.get('/live-streams/livekit/config'),
  webrtcToken: (id: number, data?: { role?: 'publisher' | 'viewer'; camera_id?: number }) =>
    api.post(`/live-streams/${id}/webrtc-token`, data ?? {}),
  publisherEvents: () => api.get('/teacher/live-events'),
  joinCamera: (id: number, data?: { name?: string; location?: string; device_name?: string }) =>
    api.post(`/live-streams/${id}/join-camera`, data ?? {}),
  updateCameraSession: (
    streamId: number,
    cameraId: number,
    data: {
      connection_status?: string
      device_name?: string
      battery_level?: number | null
      signal_strength?: number | null
    },
  ) => api.patch(`/live-streams/${streamId}/cameras/${cameraId}/session`, data),
  disconnectCamera: (streamId: number, cameraId: number) =>
    api.post(`/live-streams/${streamId}/cameras/${cameraId}/disconnect`),
  muteCamera: (streamId: number, cameraId: number, muted: boolean) =>
    api.patch(`/live-streams/${streamId}/cameras/${cameraId}/mute`, { muted }),
}
