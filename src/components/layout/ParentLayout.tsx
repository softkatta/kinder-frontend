import ErpLayout from './ErpLayout'
import { ParentLiveKeepAliveProvider } from '@/components/live/LivePlayerKeepAlive'
import { parentPortalConfig } from '@/config/erpPortals'

export default function ParentLayout() {
  return (
    <ParentLiveKeepAliveProvider>
      <ErpLayout config={parentPortalConfig} />
    </ParentLiveKeepAliveProvider>
  )
}
