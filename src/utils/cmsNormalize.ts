import { mediaUrl } from '@/utils/mediaUrl'
import type { BlogPost, CatalogItem, EventItem } from '@/config/publicCatalog'

export function parseHighlights(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string') {
    if (!value.trim()) return []
    if (value.includes('\n')) return value.split('\n').map((s) => s.trim()).filter(Boolean)
    return value.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return []
}

export function highlightsToText(value: unknown): string {
  return parseHighlights(value).join('\n')
}

/** API item (meta merged at top level) → catalog item */
export function toCatalogItem(raw: Record<string, unknown>): CatalogItem {
  const slug = String(raw.slug ?? '')
  return {
    slug,
    title: String(raw.title ?? ''),
    summary: String(raw.summary ?? raw.description ?? ''),
    image: mediaUrl(String(raw.image ?? '')),
    detail: String(raw.body ?? raw.detail ?? raw.summary ?? ''),
    highlights: parseHighlights(raw.highlights),
    meta: {
      ages: String(raw.ages ?? ''),
      time: String(raw.time ?? ''),
      price: String(raw.price ?? ''),
      price_6month: String(raw.price_6month ?? ''),
      price_yearly: String(raw.price_yearly ?? ''),
      icon: String(raw.icon ?? ''),
      grade_level: String(raw.grade_level ?? slug),
    },
  }
}

export function toEventItem(raw: Record<string, unknown>): EventItem {
  const item = toCatalogItem(raw)
  return {
    id: String(raw.slug ?? raw.id ?? ''),
    title: item.title,
    summary: item.summary,
    image: item.image,
    date: String(raw.date ?? ''),
    time: String(raw.time ?? ''),
    location: String(raw.location ?? ''),
    detail: item.detail,
    highlights: item.highlights,
  }
}

export function toBlogPost(raw: Record<string, unknown>): BlogPost {
  const body = String(raw.body ?? '')
  const content = body.includes('\n\n') ? body.split('\n\n') : body ? [body] : []
  return {
    slug: String(raw.slug ?? ''),
    title: String(raw.title ?? ''),
    excerpt: String(raw.summary ?? ''),
    image: mediaUrl(String(raw.image ?? '')),
    author: String(raw.author ?? 'Little Stars'),
    date: String(raw.date ?? ''),
    category: String(raw.category ?? 'School'),
    readTime: String(raw.readTime ?? '3 min'),
    content,
    featured: raw.featured === true || raw.featured === 'true' || raw.featured === 1,
  }
}

export interface JobDetail {
  id: number
  slug: string
  title: string
  summary: string
  description: string
  department?: string
  location?: string
  application_deadline?: string
  employment_type?: string
  salary_range?: string
  requirements: string[]
  image?: string
}

export function toJobDetail(raw: Record<string, unknown>): JobDetail {
  return {
    id: Number(raw.id ?? 0),
    slug: String(raw.slug ?? ''),
    title: String(raw.title ?? ''),
    summary: String(raw.summary ?? ''),
    description: String(raw.body ?? raw.summary ?? ''),
    department: String(raw.department ?? ''),
    location: String(raw.location ?? ''),
    application_deadline: String(raw.application_deadline ?? ''),
    employment_type: String(raw.employment_type ?? ''),
    salary_range: String(raw.salary_range ?? ''),
    requirements: parseHighlights(raw.requirements ?? raw.highlights),
    image: raw.image ? mediaUrl(String(raw.image)) : undefined,
  }
}
