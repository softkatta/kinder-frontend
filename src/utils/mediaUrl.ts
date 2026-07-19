const DEFAULT_TESTIMONIAL_AVATAR = 'https://ui-avatars.com/api/?name=Parent&background=4F9DFF&color=fff&size=128'

/** Normalize CMS/storage paths to a browser-loadable URL */
export function mediaUrl(path?: string | null): string {
  if (!path) return ''
  if (path.startsWith('data:') || path.startsWith('blob:')) return path

  // Absolute URLs pointing at local /storage should use the dev proxy path
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const u = new URL(path)
      if (u.pathname.startsWith('/storage/')) {
        path = u.pathname
      } else {
        return path
      }
    } catch {
      return path
    }
  }

  let url = path.replace(/\\/g, '/')
  if (!url.startsWith('/')) {
    url = url.startsWith('storage/') ? `/${url}` : `/storage/${url}`
  }

  const apiOrigin = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
  if (import.meta.env.DEV) {
    return url
  }
  if (apiOrigin && url.startsWith('/storage')) {
    return `${apiOrigin}${url}`
  }

  return url
}

/** Default image — testimonials only */
export const defaultTestimonialAvatar = DEFAULT_TESTIMONIAL_AVATAR
