import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight, Clock, User, Tag } from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { FadeIn } from '@/components/ui/Motion'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { useBlogPost, fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import { toBlogPost } from '@/utils/cmsNormalize'
import { useEffect, useState } from 'react'
import type { BlogPost } from '@/config/publicCatalog'
import { useT } from '@/i18n/LanguageContext'

export default function BlogDetailPage() {
  const { slug } = useParams()
  const { t, locale } = useT()
  const p = t.pages.blog
  const { item, loading } = useBlogPost(slug)
  const [related, setRelated] = useState<BlogPost[]>([])

  useEffect(() => {
    fetchLocalizedPublic((loc) => publicApi.blog(loc), locale)
      .then((data) => {
        const rows = (data as Record<string, unknown>[]).map((b) => toBlogPost(b))
        setRelated(rows.filter((b: BlogPost) => b.slug !== slug).slice(0, 3))
      })
      .catch(() => setRelated([]))
  }, [slug, locale])

  if (!loading && !item) return <Navigate to="/blog" replace />
  if (!item) return <div className="section text-center text-slate-400 py-20">Loading...</div>
  const post = item

  return (
    <div>
      <PublicPageHero
        imageKey="page_blog_image"
        backgroundImage={post.image}
        label={post.category}
        title={post.title}
        subtitle={post.excerpt}
        breadcrumbs={[{ label: p.label, to: '/blog' }, { label: post.title }]}
      />

      <section className="section bg-white relative overflow-hidden">
        <SectionDecorations variant="about" />
        <div className="mx-auto max-w-3xl px-4 relative z-10">
          <FadeIn>
            <div className="rounded-[2rem] overflow-hidden shadow-lg border-4 border-white mb-8">
              {post.image ? (
                <img src={post.image} alt={post.title} className="w-full aspect-[21/9] object-cover" />
              ) : (
                <div className="w-full aspect-[21/9] bg-gradient-to-br from-sky-100 via-amber-50 to-violet-100" />
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-8">
              <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-violet-500" />{post.author}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-orange-500" />{post.readTime}</span>
              {post.date && (
                <span className="flex items-center gap-1.5"><Tag className="h-4 w-4 text-teal-500" />{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              )}
            </div>
            <article className="prose prose-slate max-w-none">
              {post.content.map((para: string) => (
                <p key={para.slice(0, 24)} className="text-slate-600 leading-relaxed text-lg mb-5">{para}</p>
              ))}
            </article>
            <div className="flex flex-wrap gap-3 mt-10 pt-8 border-t border-slate-100">
              <Link to="/blog" className="btn-kidscholl-outline">{p.backToList}</Link>
              <Link to="/admission" className="btn-kidscholl">{t.nav.applyNow} <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section bg-[#FFF8F0] pb-20 relative overflow-hidden">
          <SectionDecorations variant="programs" />
          <div className="mx-auto max-w-6xl px-4 relative z-10">
            <h2 className="font-display text-2xl font-bold text-ink mb-6">{p.related}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.slug} to={`/blog/${r.slug}`} className="kidscholl-program-card overflow-hidden hover:shadow-lg transition-shadow">
                  <img src={r.image} alt={r.title} className="w-full aspect-video object-cover" />
                  <div className="p-4">
                    <h3 className="font-display font-bold text-ink line-clamp-2">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
