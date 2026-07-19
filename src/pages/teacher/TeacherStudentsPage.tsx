import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminPanel } from '@/components/admin/AdminUi'
import { portalBreadcrumbs, teacherPortalConfig } from '@/config/erpPortals'
import { portalApi } from '@/api/services'

interface StudentRow {
  id: number
  name: string
  class: string
  admission_number?: string
  status: string
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await portalApi.teacherStudents()
      setStudents((res.data.data as StudentRow[]) ?? [])
    } catch {
      toast.error('Could not load students')
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="My Class"
        subtitle="Active students with ID cards on file"
        breadcrumbs={portalBreadcrumbs(teacherPortalConfig.portalLabel, teacherPortalConfig.homePath, 'Students')}
      />

      <AdminPanel title="Students" noPadding>
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Loading...</p>
        ) : students.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No student records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Class</th>
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-ink">{s.name}</td>
                    <td className="px-5 py-3">{s.class}</td>
                    <td className="px-5 py-3">{s.admission_number ?? '—'}</td>
                    <td className="px-5 py-3">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </AdminPageShell>
  )
}
