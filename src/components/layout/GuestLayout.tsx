import ErpLayout from './ErpLayout'
import { guestPortalConfig } from '@/config/erpPortals'

export default function GuestLayout() {
  return <ErpLayout config={guestPortalConfig} />
}
