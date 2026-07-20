import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { mediaUrl, defaultTestimonialAvatar } from '@/utils/mediaUrl'

interface Testimonial {
  id: number | string
  author_name?: string
  role?: string
  message?: string
  rating?: number | string
  image_path?: string
}

interface TestimonialCarouselProps {
  items: Testimonial[]
  variant?: 'default' | 'home'
}

function HomeTestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className="home-testimonial-card home-testimonial-card--active">
      <div className="flex gap-0.5 mb-3 justify-center">
        {Array.from({ length: Number(item.rating) || 5 }).map((_, j) => (
          <Star key={j} className="h-4 w-4 fill-[#F97316] text-[#F97316]" />
        ))}
      </div>
      <p className="home-testimonial-card-message">&ldquo;{item.message}&rdquo;</p>
      <div className="home-testimonial-card-author">
        <img
          src={mediaUrl(item.image_path) || defaultTestimonialAvatar}
          alt={item.author_name}
          className="home-testimonial-card-avatar"
        />
        <div>
          <p className="home-testimonial-card-name">{item.author_name}</p>
          <p className="home-testimonial-card-role">{item.role}</p>
        </div>
      </div>
    </div>
  )
}

export function TestimonialCarousel({ items, variant = 'default' }: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000)
    return () => clearInterval(t)
  }, [items.length])

  if (!items.length) return null

  const item = items[index]
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length)
  const next = () => setIndex((i) => (i + 1) % items.length)

  if (variant === 'home') {
    return (
      <div className="home-testimonial-carousel">
        <div className="home-testimonial-slide-row">
          {items.length > 1 && (
            <button
              type="button"
              onClick={prev}
              className="home-testimonial-nav home-testimonial-nav--teal"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div className="home-testimonial-single" key={item.id ?? index}>
            <HomeTestimonialCard item={item} />
          </div>

          {items.length > 1 && (
            <button
              type="button"
              onClick={next}
              className="home-testimonial-nav home-testimonial-nav--teal"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {items.length > 1 && (
          <div className="flex justify-center gap-2 home-testimonial-dots">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 home-testimonial-dot--active' : 'w-2 bg-slate-300/80'}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="speech-bubble text-center min-h-[280px] flex flex-col items-center justify-center px-6 md:px-10 py-8">
        <Quote className="h-8 w-8 text-sky-300 mb-3 opacity-60" />
        <div className="flex gap-1 justify-center text-sunny mb-4">
          {Array.from({ length: Number(item.rating) || 5 }).map((_, j) => (
            <Star key={j} className="h-4 w-4 fill-sunny text-sunny" />
          ))}
        </div>
        <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6 max-w-lg">&ldquo;{item.message}&rdquo;</p>
        <img
          src={mediaUrl(item.image_path) || defaultTestimonialAvatar}
          alt={item.author_name}
          className="w-14 h-14 rounded-full object-cover border-3 border-sky-200 shadow-md mb-2"
        />
        <p className="font-display font-bold text-ink">{item.author_name}</p>
        <p className="text-xs text-slate-400 font-semibold">{item.role}</p>
      </div>

      {items.length > 1 && (
        <>
          <button type="button" onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 p-2.5 rounded-full bg-white shadow-lg border border-sky-100 hover:bg-sky-50 transition">
            <ChevronLeft className="h-5 w-5 text-sky-600" />
          </button>
          <button type="button" onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 p-2.5 rounded-full bg-white shadow-lg border border-sky-100 hover:bg-sky-50 transition">
            <ChevronRight className="h-5 w-5 text-sky-600" />
          </button>
          <div className="flex justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-sky-500' : 'w-2 bg-slate-300'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
