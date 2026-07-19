import { CheckCircle2, X } from 'lucide-react'
import { Button } from './Button'

interface SuccessModalProps {
  open: boolean
  title: string
  message: string
  onClose: () => void
}

export function SuccessModal({ open, title, message, onClose }: SuccessModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-scale-in">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100">
          <X className="h-5 w-5 text-slate-400" />
        </button>
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-5">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 mb-6 leading-relaxed">{message}</p>
        <Button variant="primary" className="w-full" onClick={onClose}>OK</Button>
      </div>
    </div>
  )
}
