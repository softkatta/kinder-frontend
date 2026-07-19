import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminPanel, AdminBtn } from '@/components/admin/AdminUi'
import { ParentChildSelector } from '@/components/parent/ParentChildSelector'
import { portalBreadcrumbs, parentPortalConfig } from '@/config/erpPortals'
import { paymentApi, portalApi } from '@/api/services'

interface FeeItem {
  term: string
  amount: string
  paid: string
  balance: string
  balance_num?: number
  due: string
  can_pay?: boolean
  student_name?: string | null
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Razorpay failed to load'))
    document.body.appendChild(script)
  })
}

export default function ParentFeesPage() {
  const navigate = useNavigate()
  const [childId, setChildId] = useState<number | null>(null)
  const [items, setItems] = useState<FeeItem[]>([])
  const [childName, setChildName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await portalApi.parentFees(childId ?? undefined)
      const data = res.data.data as { items?: FeeItem[]; child_name?: string; child_id?: number }
      setItems(data.items ?? [])
      setChildName(data.child_name ?? null)
      if (!childId && data.child_id) setChildId(data.child_id)
    } catch {
      setItems([])
      toast.error('Could not load fee details')
    } finally {
      setLoading(false)
    }
  }, [childId])

  useEffect(() => {
    void load()
  }, [load])

  const handlePay = async (item: FeeItem) => {
    if (!item.can_pay || !item.balance_num || item.balance_num <= 0) return
    setPaying(true)
    try {
      const configRes = await paymentApi.razorpayConfig()
      const cfg = configRes.data.data as { enabled?: boolean; key_id?: string }
      if (cfg.enabled && cfg.key_id) {
        await loadRazorpayScript()
        const orderRes = await paymentApi.createRazorpayOrder({
          amount: item.balance_num,
          student_name: item.student_name || childName || undefined,
        })
        const order = orderRes.data.data as {
          order_id: string
          amount: number
          currency: string
          key_id: string
          payment_id: number
        }
        await new Promise<void>((resolve, reject) => {
          const rzp = new window.Razorpay!({
            key: order.key_id,
            amount: order.amount,
            currency: order.currency,
            name: 'School Fees',
            description: item.term,
            order_id: order.order_id,
            handler: async (response: Record<string, string>) => {
              try {
                await paymentApi.verifyRazorpay({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  payment_id: order.payment_id,
                })
                toast.success('Payment successful')
                resolve()
              } catch {
                reject(new Error('Verification failed'))
              }
            },
            modal: { ondismiss: () => reject(new Error('cancelled')) },
          })
          rzp.open()
        })
        void load()
      } else {
        navigate('/payment')
      }
    } catch (err) {
      if ((err as Error).message !== 'cancelled') {
        toast.error('Online pay unavailable — use payment page')
        navigate('/payment')
      }
    } finally {
      setPaying(false)
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Fees"
        subtitle={childName ? `Fee breakdown for ${childName}` : 'View fee breakdown and payment status'}
        breadcrumbs={portalBreadcrumbs(parentPortalConfig.portalLabel, parentPortalConfig.homePath, 'Fees')}
        actions={<ParentChildSelector value={childId} onChange={setChildId} className="min-w-[200px]" />}
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading fees...</p>
      ) : items.length === 0 ? (
        <AdminPanel>
          <p className="p-5 text-sm text-slate-500">No fee records yet. Pay via the <Link to="/payment" className="text-primary-600 font-semibold">payment page</Link>.</p>
        </AdminPanel>
      ) : (
        <div className="grid gap-4">
          {items.map((f) => (
            <AdminPanel key={`${f.term}-${f.due}`} noPadding>
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-bold text-ink">{f.term}</p>
                    <p className="text-sm text-slate-500">Total: {f.amount} · Paid: {f.paid}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-violet-600">{f.balance === '₹0' ? 'Fully Paid' : `Balance: ${f.balance}`}</p>
                    <p className="text-xs text-slate-500">Due: {f.due}</p>
                  </div>
                </div>
                {f.can_pay && f.balance_num && f.balance_num > 0 && (
                  <AdminBtn variant="primary" className="mt-4" disabled={paying} onClick={() => void handlePay(f)}>
                    Pay Now
                  </AdminBtn>
                )}
              </div>
            </AdminPanel>
          ))}
        </div>
      )}
    </AdminPageShell>
  )
}
