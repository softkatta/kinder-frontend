import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, User } from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { FadeIn } from '@/components/ui/Motion'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { useT } from '@/i18n/LanguageContext'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import { toBlogPost } from '@/utils/cmsNormalize'
import type { BlogPost } from '@/config/publicCatalog'

export default function BlogPage() {
  const { t, locale } = useT()
  const p = t.pages.blog
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchLocalizedPublic((loc) => publicApi.blog(loc), locale)
      .then((data) => {
        const rows = (data as Record<string, unknown>[]) || []
        setPosts(rows.map((b) => toBlogPost(b)))
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [locale])

  const featuredPost = posts.find((post) => post.featured) || posts[0]
  const rest = posts.filter((post) => post !== featuredPost)

  return (
    <div>
      <PublicPageHero imageKey="page_blog_image" label={p.label} title={p.title} subtitle={p.subtitle} breadcrumbs={[{ label: p.label }]} />

      <section className="section bg-white relative overflow-hidden">
        <SectionDecorations variant="about" />
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          {loading ? (
            <p className="text-center text-slate-400 py-12">{t.common.loading}</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-slate-400 py-12">{t.common.emptyBlog}</p>
          ) : (
            <>
              {featuredPost && (
                <FadeIn>
                  <Link to={`/blog/${featuredPost.slug}`} className="group grid md:grid-cols-2 gap-8 items-center kidscholl-program-card overflow-hidden mb-12 hover:shadow-xl transition-shadow">
                    <div className="aspect-[16/10] md:aspect-auto md:h-full overflow-hidden">
                      {featuredPost.image ? (
                        <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full min-h-[12rem] bg-gradient-to-br from-orange-100 via-sky-50 to-violet-100" />
                      )}
                    </div>
                    <div className="p-6 md:p-8">
                      <span className="text-xs font-bold text-orange-500 uppercase">{p.featured}</span>
                      <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mt-2 group-hover:text-orange-500 transition-colors">{featuredPost.title}</h2>
                      <p className="text-slate-500 mt-3 leading-relaxed">{featuredPost.excerpt}</p>
                      <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{featuredPost.author}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featuredPost.readTime}</span>
                        {featuredPost.date && (
                          <span>{new Date(featuredPost.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-orange-500 font-bold mt-5">
                        {t.common.readMore} <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </FadeIn>
              )}

              {rest.length > 0 && (
                <>
                  <KidschollSection label={p.latestLabel} title={p.latestTitle} />
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map((post, i) => (
                      <FadeIn key={post.slug} delay={i * 0.05}>
                        <Link to={`/blog/${post.slug}`} className="group block kidscholl-program-card overflow-hidden h-full hover:shadow-lg transition-all hover:-translate-y-1">
                          <div className="aspect-[16/10] overflow-hidden">
                            {post.image ? (
                              <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-sky-100 to-amber-50" />
                            )}
                          </div>
                          <div className="p-5">
                            <span className="text-xs font-bold text-violet-500">{post.category}</span>
                            <h3 className="font-display font-bold text-ink mt-2 group-hover:text-orange-500 transition-colors line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{post.excerpt}</p>
                            {post.date && (
                              <p className="text-xs text-slate-400 mt-3">{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            )}
                          </div>
                        </Link>
                      </FadeIn>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
