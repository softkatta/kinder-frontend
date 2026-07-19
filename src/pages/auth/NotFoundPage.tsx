import { Link } from 'react-router-dom'
import { Home, SearchX } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-6">
      <div className="text-center max-w-md">
        <SearchX className="h-16 w-16 text-violet-400 mx-auto mb-4" />
        <h1 className="font-display text-4xl font-bold text-ink">404</h1>
        <p className="text-slate-600 mt-2 mb-6">This page could not be found.</p>
        <Link to="/" className="btn-kidscholl inline-flex">
          <Home className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </div>
  )
}
