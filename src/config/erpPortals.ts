import { LayoutDashboard, Users, UserCog, Settings, ClipboardList, CreditCard,
  Globe, IdCard, Calendar, BookOpen, Bell, Sparkles, Star, Fingerprint,
  GraduationCap, UserPlus, QrCode, Radio, BarChart3, Shield, Bus,
  type LucideIcon,
} from 'lucide-react'

export interface ErpNavChild {
  to: string
  label: string
}

export interface ErpNavItem {
  to?: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: string
  badgeKey?: string
  children?: ErpNavChild[]
}

export interface ErpPortalConfig {
  portalLabel: string
  homePath: string
  nav: ErpNavItem[]
  pageMeta: Record<string, { title: string; desc: string }>
  showYearCard?: boolean
  compactTopbar?: boolean
}

export const adminPortalConfig: ErpPortalConfig = {
  portalLabel: 'Admin',
  homePath: '/admin',
  showYearCard: true,
  compactTopbar: true,
  nav: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/students', label: 'Students', icon: Users, badgeKey: 'students' },
    { to: '/admin/admissions', label: 'Admissions', icon: ClipboardList, badgeKey: 'admissions' },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard, badgeKey: 'payments' },
    { to: '/admin/student-fees', label: 'Student Fees', icon: CreditCard },
    { to: '/admin/transport', label: 'Transport', icon: Bus },
    { to: '/admin/homework', label: 'Homework', icon: BookOpen },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
    { to: '/admin/users', label: 'Users', icon: UserCog },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
    { to: '/admin/cms', label: 'Website CMS', icon: Globe },
    { to: '/admin/job-applications', label: 'Job Applications', icon: ClipboardList },
    {
      label: 'Attendance',
      icon: Fingerprint,
      children: [
        { to: '/admin/attendance', label: 'Daily Attendance' },
        { to: '/admin/attendance/verify-student', label: 'Verify Student' },
        { to: '/admin/attendance/qr', label: 'QR Attendance' },
      ],
    },
    { to: '/admin/id-cards', label: 'ID Cards', icon: IdCard },
    {
      label: 'Academics',
      icon: GraduationCap,
      children: [
        { to: '/admin/academic-years', label: 'Academic Years' },
        { to: '/admin/exams', label: 'Exams' },
        { to: '/admin/marksheets', label: 'Marksheets & Certificates' },
      ],
    },
    {
      label: 'Guests',
      icon: UserPlus,
      children: [
        { to: '/admin/guests', label: 'Guest Passes' },
        { to: '/admin/guests/scan', label: 'QR Entry Scan' },
      ],
    },
    { to: '/admin/live-streams', label: 'Live Streams', icon: Radio },
  ],
  pageMeta: {
    '/admin': { title: 'Dashboard', desc: 'School overview & daily metrics' },
    '/admin/students': { title: 'Students', desc: 'Enrolled students across all classes' },
    '/admin/students/:id': { title: 'Student Profile', desc: 'Student ID card details' },
    '/admin/admissions': { title: 'Admissions', desc: 'Review and process applications' },
    '/admin/payments': { title: 'Payments', desc: 'Fee collection & verification' },
    '/admin/student-fees': { title: 'Student Fees', desc: 'Fee categories and per-student assignments' },
    '/admin/transport': { title: 'Transport', desc: 'Bus routes and student pickup assignments' },
    '/admin/homework': { title: 'Homework', desc: 'Assignments and student submissions' },
    '/admin/reports': { title: 'Reports', desc: 'Students, fees, admissions & attendance summaries' },
    '/admin/audit-logs': { title: 'Audit Logs', desc: 'Admin activity trail' },
    '/admin/users': { title: 'Users', desc: 'Portal accounts & roles' },
    '/admin/settings': { title: 'Settings', desc: 'School profile & integrations' },
    '/admin/cms': { title: 'Website CMS', desc: 'Manage public website content' },
    '/admin/job-applications': { title: 'Job Applications', desc: 'Career form submissions from website' },
    '/admin/attendance': { title: 'Daily Attendance', desc: 'Student & teacher attendance records by date' },
    '/admin/attendance/verify-student': { title: 'Verify Student', desc: 'Scan student ID card to verify identity & details' },
    '/admin/attendance/qr': { title: 'QR Attendance', desc: 'Scan QR codes to mark check-in / check-out' },
    '/admin/id-cards': { title: 'PVC ID Cards', desc: 'Design, preview & print identity cards' },
    '/admin/academic-years': { title: 'Academic Years', desc: 'Manage school academic sessions' },
    '/admin/exams': { title: 'Exams', desc: 'Create exams and enter student marks' },
    '/admin/marksheets': { title: 'Marksheets & Certificates', desc: 'Print marksheets and certificates' },
    '/admin/guests': { title: 'Guest Passes', desc: 'Event guests with companions and QR passes' },
    '/admin/guests/scan': { title: 'Guest QR Scan', desc: 'Scan guest ID for entry IN/OUT' },
    '/admin/live-streams': { title: 'Live Streams', desc: 'Multi-camera live event control' },
    '/admin/live-streams/setup-guide': { title: 'Live Stream Setup Guide', desc: 'Equipment, streaming methods, and ERP configuration' },
    '/admin/notifications': { title: 'Notifications', desc: 'Alerts and updates for your account' },
  },
}

export const teacherPortalConfig: ErpPortalConfig = {
  portalLabel: 'Teacher',
  homePath: '/teacher',
  showYearCard: true,
  nav: [
    { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/teacher/attendance', label: 'Attendance', icon: Calendar },
    { to: '/teacher/homework', label: 'Homework', icon: BookOpen },
    { to: '/teacher/students', label: 'My Class', icon: Users },
    { to: '/teacher/notices', label: 'Notices', icon: Bell },
    { to: '/teacher/live', label: 'Join Live', icon: Radio },
  ],
  pageMeta: {
    '/teacher': { title: 'Dashboard', desc: 'Your classroom at a glance' },
    '/teacher/attendance': { title: 'Attendance', desc: 'Scan ID cards & view today\'s records' },
    '/teacher/homework': { title: 'Homework', desc: 'Assign and track homework submissions' },
    '/teacher/students': { title: 'My Class', desc: 'Students in your class section' },
    '/teacher/notices': { title: 'Notices', desc: 'School and class announcements' },
    '/teacher/live': { title: 'Join Live', desc: 'Connect your mobile camera for a live school event' },
    '/teacher/live/setup-guide': { title: 'Live Stream Setup Guide', desc: 'Equipment, streaming methods, and ERP configuration' },
    '/teacher/notifications': { title: 'Notifications', desc: 'Alerts and updates for your account' },
  },
}

export const parentPortalConfig: ErpPortalConfig = {
  portalLabel: 'Parent',
  homePath: '/parent',
  showYearCard: true,
  nav: [
    { to: '/parent', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/parent/children', label: 'My Children', icon: Users },
    { to: '/parent/fees', label: 'Fees', icon: CreditCard },
    { to: '/parent/attendance', label: 'Attendance', icon: Calendar },
    { to: '/parent/notices', label: 'Notices', icon: Bell },
    { to: '/parent/live', label: 'School Live', icon: Radio },
  ],
  pageMeta: {
    '/parent': { title: 'Dashboard', desc: 'Stay updated on your child\'s school life' },
    '/parent/children': { title: 'My Children', desc: 'Profiles linked to your parent account' },
    '/parent/fees': { title: 'Fees', desc: 'Fee breakdown and payment status' },
    '/parent/attendance': { title: 'Attendance', desc: 'Monthly attendance records' },
    '/parent/notices': { title: 'Notices', desc: 'Announcements from school and teachers' },
    '/parent/live': { title: 'School Live', desc: 'Watch the live event feed from school' },
    '/parent/notifications': { title: 'Notifications', desc: 'Alerts and updates for your account' },
  },
}

export const studentPortalConfig: ErpPortalConfig = {
  portalLabel: 'Student',
  homePath: '/student',
  showYearCard: true,
  nav: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/homework', label: 'Homework', icon: BookOpen },
    { to: '/student/attendance', label: 'Attendance', icon: Calendar },
    { to: '/student/activities', label: 'Activities', icon: Sparkles },
    { to: '/student/rewards', label: 'Stars', icon: Star },
  ],
  pageMeta: {
    '/student': { title: 'Dashboard', desc: 'Your learning adventure starts here' },
    '/student/homework': { title: 'Homework', desc: 'Complete assignments and earn stars' },
    '/student/attendance': { title: 'Attendance', desc: 'Your weekly attendance record' },
    '/student/activities': { title: 'Activities', desc: 'Fun learning activities planned for you' },
    '/student/rewards': { title: 'Star Rewards', desc: 'Stars earned for good behavior and effort' },
    '/student/notifications': { title: 'Notifications', desc: 'Alerts and updates for your account' },
  },
}

export const guestPortalConfig: ErpPortalConfig = {
  portalLabel: 'Guest',
  homePath: '/guest',
  nav: [
    { to: '/guest', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/guest/companions', label: 'Companions', icon: UserPlus },
    { to: '/guest/pass', label: 'My Pass', icon: QrCode },
  ],
  pageMeta: {
    '/guest': { title: 'Dashboard', desc: 'Your event invitation and pass details' },
    '/guest/companions': { title: 'Companions', desc: 'Add people who will attend with you' },
    '/guest/pass': { title: 'Guest Pass', desc: 'Show this QR code at the school gate' },
    '/guest/notifications': { title: 'Notifications', desc: 'Alerts and updates for your account' },
  },
}

export function portalBreadcrumbs(portalLabel: string, homePath: string, pageTitle: string) {
  return [{ label: portalLabel, to: homePath }, { label: pageTitle }]
}
