import { lazy, Suspense } from 'react'
import ErpLayout from './ErpLayout'
import { parentPortalConfig } from '@/config/erpPortals'

const ParentLivePage = lazy(() => import('@/pages/parent/ParentLivePage'))

export default function ParentLayout() {
  return (
    <ErpLayout
      config={parentPortalConfig}
      keepAlivePath="/parent/live"
      keepAlivePage={(
        <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-slate-400">Loading...</div>}>
          <ParentLivePage />
        </Suspense>
      )}
    />
  )
}
