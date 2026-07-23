import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { store } from '@/store'
import AuthBootstrap from '@/components/AuthBootstrap'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { InstallGate } from '@/components/install/InstallGate'
import { InstallWizard } from '@/components/install/InstallWizard'
import { LicenseErrorPage } from '@/components/license/LicenseErrorPage'
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import TeacherLayout from '@/components/layout/TeacherLayout'
import ParentLayout from '@/components/layout/ParentLayout'
import StudentLayout from '@/components/layout/StudentLayout'
import GuestLayout from '@/components/layout/GuestLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'

const HomePage = lazy(() => import('@/pages/public/HomePage'))
const AboutPage = lazy(() => import('@/pages/public/AboutPage'))
const ProgramsPage = lazy(() => import('@/pages/public/ProgramsPage'))
const StaffPage = lazy(() => import('@/pages/public/StaffPage'))
const CurriculumPage = lazy(() => import('@/pages/public/CurriculumPage'))
const ProgramDetailPage = lazy(() => import('@/pages/public/ProgramDetailPage'))
const FacilitiesPage = lazy(() => import('@/pages/public/FacilitiesPage'))
const FacilityDetailPage = lazy(() => import('@/pages/public/FacilityDetailPage'))
const ActivitiesPage = lazy(() => import('@/pages/public/ActivitiesPage'))
const ActivityDetailPage = lazy(() => import('@/pages/public/ActivityDetailPage'))
const GalleryPage = lazy(() => import('@/pages/public/GalleryPage'))
const EventsPage = lazy(() => import('@/pages/public/EventsPage'))
const EventDetailPage = lazy(() => import('@/pages/public/EventDetailPage'))
const ScanGatePage = lazy(() => import('@/pages/public/ScanGatePage'))
const BlogPage = lazy(() => import('@/pages/public/BlogPage'))
const BlogDetailPage = lazy(() => import('@/pages/public/BlogDetailPage'))
const BookTourPage = lazy(() => import('@/pages/public/BookTourPage'))
const FaqPage = lazy(() => import('@/pages/public/FaqPage'))
const ContactPage = lazy(() => import('@/pages/public/ContactPage'))
const LegalPage = lazy(() => import('@/pages/public/LegalPage'))
const AdmissionPage = lazy(() => import('@/pages/public/AdmissionPage'))
const PaymentInfoPage = lazy(() => import('@/pages/public/PaymentInfoPage'))
const CareersPage = lazy(() => import('@/pages/public/CareersPage'))
const JobDetailPage = lazy(() => import('@/pages/public/JobDetailPage'))
const VerifyCertificatePage = lazy(() => import('@/pages/public/VerifyCertificatePage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const NotFoundPage = lazy(() => import('@/pages/auth/NotFoundPage'))
const UnauthorizedPage = lazy(() => import('@/pages/auth/UnauthorizedPage'))

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminStudentsPage = lazy(() => import('@/pages/admin/AdminStudentsPage'))
const AdminStudentDetailPage = lazy(() => import('@/pages/admin/AdminStudentDetailPage'))
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage'))
const AdminStudentFeesPage = lazy(() => import('@/pages/admin/AdminStudentFeesPage'))
const AdminTransportPage = lazy(() => import('@/pages/admin/AdminTransportPage'))
const AdminHomeworkPage = lazy(() => import('@/pages/admin/AdminHomeworkPage'))
const AdminAuditPage = lazy(() => import('@/pages/admin/AdminAuditPage'))
const AdminAdmissionsPage = lazy(() => import('@/pages/admin/AdminAdmissionsPage'))
const AdminPaymentsPage = lazy(() => import('@/pages/admin/AdminPaymentsPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))
const AdminCmsPage = lazy(() => import('@/pages/admin/AdminCmsPage'))
const AdminJobApplicationsPage = lazy(() => import('@/pages/admin/AdminJobApplicationsPage'))
const AdminIdCardsPage = lazy(() => import('@/pages/admin/AdminIdCardsPage'))
const AdminQrScannerPage = lazy(() => import('@/pages/admin/AdminQrScannerPage'))
const AdminVerifyStudentPage = lazy(() => import('@/pages/admin/AdminVerifyStudentPage'))
const AdminAttendancePage = lazy(() => import('@/pages/admin/AdminAttendancePage'))
const AdminAcademicYearsPage = lazy(() => import('@/pages/admin/AdminAcademicYearsPage'))
const AdminExamsPage = lazy(() => import('@/pages/admin/AdminExamsPage'))
const AdminMarksheetsPage = lazy(() => import('@/pages/admin/AdminMarksheetsPage'))
const AdminGuestsPage = lazy(() => import('@/pages/admin/AdminGuestsPage'))
const AdminGuestScanPage = lazy(() => import('@/pages/admin/AdminGuestScanPage'))
const AdminLiveStreamsPage = lazy(() => import('@/pages/admin/AdminLiveStreamsPage'))
const LiveStreamSetupGuidePage = lazy(() => import('@/pages/admin/LiveStreamSetupGuidePage'))

const TeacherDashboard = lazy(() => import('@/pages/teacher/TeacherDashboard'))
const TeacherAttendancePage = lazy(() => import('@/pages/teacher/TeacherAttendancePage'))
const TeacherHomeworkPage = lazy(() => import('@/pages/teacher/TeacherHomeworkPage'))
const TeacherStudentsPage = lazy(() => import('@/pages/teacher/TeacherStudentsPage'))
const TeacherNoticesPage = lazy(() => import('@/pages/teacher/TeacherNoticesPage'))
const TeacherMobileLivePage = lazy(() => import('@/pages/teacher/TeacherMobileLivePage'))

const ParentDashboard = lazy(() => import('@/pages/parent/ParentDashboard'))
const ParentChildrenPage = lazy(() => import('@/pages/parent/ParentChildrenPage'))
const ParentFeesPage = lazy(() => import('@/pages/parent/ParentFeesPage'))
const ParentAttendancePage = lazy(() => import('@/pages/parent/ParentAttendancePage'))
const ParentNoticesPage = lazy(() => import('@/pages/parent/ParentNoticesPage'))

const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'))
const StudentHomeworkPage = lazy(() => import('@/pages/student/StudentHomeworkPage'))
const StudentAttendancePage = lazy(() => import('@/pages/student/StudentAttendancePage'))
const StudentActivitiesPage = lazy(() => import('@/pages/student/StudentActivitiesPage'))
const StudentRewardsPage = lazy(() => import('@/pages/student/StudentRewardsPage'))

const GuestDashboard = lazy(() => import('@/pages/guest/GuestDashboard'))
const GuestCompanionsPage = lazy(() => import('@/pages/guest/GuestCompanionsPage'))
const GuestPassPage = lazy(() => import('@/pages/guest/GuestPassPage'))
const NotificationsPage = lazy(() => import('@/pages/shared/NotificationsPage'))

const Shell = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-slate-400">Loading...</div>}>{children}</Suspense>
)

const queryClient = new QueryClient()

export default function App() {
  return (
    <Provider store={store}>
      <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <InstallGate>
            <AuthBootstrap>
            <Toaster position="top-right" />
            <Routes>
              <Route path="install" element={<InstallWizard />} />
              <Route path="license/invalid" element={<LicenseErrorPage code="invalid" />} />
              <Route path="license/expired" element={<LicenseErrorPage code="expired" />} />
              <Route path="license/suspended" element={<LicenseErrorPage code="suspended" />} />
              <Route path="license/domain-not-authorized" element={<LicenseErrorPage code="domain-not-authorized" />} />
              <Route path="license/product-disabled" element={<LicenseErrorPage code="product-disabled" />} />
              <Route path="license/unsupported-version" element={<LicenseErrorPage code="unsupported-version" />} />
              <Route path="license/server-verification-failed" element={<LicenseErrorPage code="server-verification-failed" />} />
              <Route path="license/grace-expired" element={<LicenseErrorPage code="grace-expired" />} />
              <Route path="license/company-api-unavailable" element={<LicenseErrorPage code="company-api-unavailable" />} />
              <Route path="license/invalid-install-token" element={<LicenseErrorPage code="invalid-install-token" />} />
              <Route path="license/database-unavailable" element={<LicenseErrorPage code="database-unavailable" />} />

              <Route element={<PublicLayout />}>
                <Route index element={<Shell><HomePage /></Shell>} />
                <Route path="about" element={<Shell><AboutPage /></Shell>} />
                <Route path="programs" element={<Shell><ProgramsPage /></Shell>} />
                <Route path="programs/:slug" element={<Shell><ProgramDetailPage /></Shell>} />
                <Route path="staff" element={<Shell><StaffPage /></Shell>} />
                <Route path="curriculum" element={<Shell><CurriculumPage /></Shell>} />
                <Route path="facilities" element={<Shell><FacilitiesPage /></Shell>} />
                <Route path="facilities/:slug" element={<Shell><FacilityDetailPage /></Shell>} />
                <Route path="activities" element={<Shell><ActivitiesPage /></Shell>} />
                <Route path="activities/:slug" element={<Shell><ActivityDetailPage /></Shell>} />
                <Route path="gallery" element={<Shell><GalleryPage /></Shell>} />
                <Route path="events" element={<Shell><EventsPage /></Shell>} />
                <Route path="events/:id" element={<Shell><EventDetailPage /></Shell>} />
                {/* Mounted by PublicLayout LiveRouteKeepAlive so the player survives navigation */}
                <Route path="live" element={null} />
                <Route path="s/:scanCode" element={<Shell><ScanGatePage /></Shell>} />
                <Route path="verify/:certNumber" element={<Shell><VerifyCertificatePage /></Shell>} />
                <Route path="blog" element={<Shell><BlogPage /></Shell>} />
                <Route path="blog/:slug" element={<Shell><BlogDetailPage /></Shell>} />
                <Route path="book-tour" element={<Shell><BookTourPage /></Shell>} />
                <Route path="careers" element={<Shell><CareersPage /></Shell>} />
                <Route path="careers/:slug" element={<Shell><JobDetailPage /></Shell>} />
                <Route path="admission" element={<Shell><AdmissionPage /></Shell>} />
                <Route path="payment" element={<Shell><PaymentInfoPage /></Shell>} />
                <Route path="contact" element={<Shell><ContactPage /></Shell>} />
                <Route path="faq" element={<Shell><FaqPage /></Shell>} />
                <Route path="privacy" element={<Shell><LegalPage slug="privacy-policy" /></Shell>} />
                <Route path="terms" element={<Shell><LegalPage slug="terms" /></Shell>} />
                <Route path="refund" element={<Shell><LegalPage slug="refund-policy" /></Shell>} />
              </Route>

              <Route path="login" element={<Shell><LoginPage /></Shell>} />
              <Route path="forgot-password" element={<Shell><ForgotPasswordPage /></Shell>} />
              <Route path="reset-password" element={<Shell><ResetPasswordPage /></Shell>} />
              <Route path="unauthorized" element={<Shell><UnauthorizedPage /></Shell>} />

              <Route element={<ProtectedRoute roles={['super_admin']} />}>
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<Shell><AdminDashboard /></Shell>} />
                  <Route path="students" element={<Shell><AdminStudentsPage /></Shell>} />
                  <Route path="students/:id" element={<Shell><AdminStudentDetailPage /></Shell>} />
                  <Route path="admissions" element={<Shell><AdminAdmissionsPage /></Shell>} />
                  <Route path="payments" element={<Shell><AdminPaymentsPage /></Shell>} />
                  <Route path="student-fees" element={<Shell><AdminStudentFeesPage /></Shell>} />
                  <Route path="transport" element={<Shell><AdminTransportPage /></Shell>} />
                  <Route path="homework" element={<Shell><AdminHomeworkPage /></Shell>} />
                  <Route path="reports" element={<Shell><AdminReportsPage /></Shell>} />
                  <Route path="audit-logs" element={<Shell><AdminAuditPage /></Shell>} />
                  <Route path="users" element={<Shell><AdminUsersPage /></Shell>} />
                  <Route path="settings" element={<Shell><AdminSettingsPage /></Shell>} />
                  <Route path="cms" element={<Shell><AdminCmsPage /></Shell>} />
                  <Route path="job-applications" element={<Shell><AdminJobApplicationsPage /></Shell>} />
                  <Route path="id-cards" element={<Shell><AdminIdCardsPage /></Shell>} />
                  <Route path="attendance" element={<Shell><AdminAttendancePage /></Shell>} />
                  <Route path="attendance/verify-student" element={<Shell><AdminVerifyStudentPage /></Shell>} />
                  <Route path="attendance/qr" element={<Shell><AdminQrScannerPage /></Shell>} />
                  <Route path="academic-years" element={<Shell><AdminAcademicYearsPage /></Shell>} />
                  <Route path="exams" element={<Shell><AdminExamsPage /></Shell>} />
                  <Route path="marksheets" element={<Shell><AdminMarksheetsPage /></Shell>} />
                  <Route path="guests" element={<Shell><AdminGuestsPage /></Shell>} />
                  <Route path="guests/scan" element={<Shell><AdminGuestScanPage /></Shell>} />
                  <Route path="live-streams" element={<Shell><AdminLiveStreamsPage /></Shell>} />
                  <Route path="live-streams/setup-guide" element={<Shell><LiveStreamSetupGuidePage /></Shell>} />
                  <Route path="notifications" element={<Shell><NotificationsPage /></Shell>} />
                  <Route path="qr-scanner" element={<Navigate to="/admin/attendance/qr" replace />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['teacher', 'staff']} />}>
                <Route path="teacher" element={<TeacherLayout />}>
                  <Route index element={<Shell><TeacherDashboard /></Shell>} />
                  <Route path="attendance" element={<Shell><TeacherAttendancePage /></Shell>} />
                  <Route path="homework" element={<Shell><TeacherHomeworkPage /></Shell>} />
                  <Route path="students" element={<Shell><TeacherStudentsPage /></Shell>} />
                  <Route path="notices" element={<Shell><TeacherNoticesPage /></Shell>} />
                  <Route path="live" element={<Shell><TeacherMobileLivePage /></Shell>} />
                  <Route path="live/setup-guide" element={<Shell><LiveStreamSetupGuidePage /></Shell>} />
                  <Route path="notifications" element={<Shell><NotificationsPage /></Shell>} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['parent']} />}>
                <Route path="parent" element={<ParentLayout />}>
                  <Route index element={<Shell><ParentDashboard /></Shell>} />
                  <Route path="children" element={<Shell><ParentChildrenPage /></Shell>} />
                  <Route path="fees" element={<Shell><ParentFeesPage /></Shell>} />
                  <Route path="attendance" element={<Shell><ParentAttendancePage /></Shell>} />
                  <Route path="notices" element={<Shell><ParentNoticesPage /></Shell>} />
                  {/* Mounted by ParentLayout LiveRouteKeepAlive so the player survives navigation */}
                  <Route path="live" element={null} />
                  <Route path="notifications" element={<Shell><NotificationsPage /></Shell>} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['student']} />}>
                <Route path="student" element={<StudentLayout />}>
                  <Route index element={<Shell><StudentDashboard /></Shell>} />
                  <Route path="homework" element={<Shell><StudentHomeworkPage /></Shell>} />
                  <Route path="attendance" element={<Shell><StudentAttendancePage /></Shell>} />
                  <Route path="activities" element={<Shell><StudentActivitiesPage /></Shell>} />
                  <Route path="rewards" element={<Shell><StudentRewardsPage /></Shell>} />
                  <Route path="notifications" element={<Shell><NotificationsPage /></Shell>} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['guest']} />}>
                <Route path="guest" element={<GuestLayout />}>
                  <Route index element={<Shell><GuestDashboard /></Shell>} />
                  <Route path="companions" element={<Shell><GuestCompanionsPage /></Shell>} />
                  <Route path="pass" element={<Shell><GuestPassPage /></Shell>} />
                  <Route path="notifications" element={<Shell><NotificationsPage /></Shell>} />
                </Route>
              </Route>

              <Route path="*" element={<Shell><NotFoundPage /></Shell>} />
            </Routes>
            </AuthBootstrap>
          </InstallGate>
        </BrowserRouter>
      </QueryClientProvider>
      </LanguageProvider>
    </Provider>
  )
}
