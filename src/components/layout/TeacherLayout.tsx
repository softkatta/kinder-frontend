import ErpLayout from './ErpLayout'
import { teacherPortalConfig } from '@/config/erpPortals'

export default function TeacherLayout() {
  return <ErpLayout config={teacherPortalConfig} />
}
