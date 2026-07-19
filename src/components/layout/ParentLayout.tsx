import ErpLayout from './ErpLayout'
import { parentPortalConfig } from '@/config/erpPortals'

export default function ParentLayout() {
  return <ErpLayout config={parentPortalConfig} />
}
