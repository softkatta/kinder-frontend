import ErpLayout from './ErpLayout'
import { studentPortalConfig } from '@/config/erpPortals'

export default function StudentLayout() {
  return <ErpLayout config={studentPortalConfig} />
}
