/** Admin CMS form labels — vary by content type */

export interface CmsFormLabels {
  title: string
  summary: string
  body: string
  image: string
  slug: string
}

const defaultLabels: CmsFormLabels = {
  title: 'Title',
  summary: 'Summary',
  body: 'Body / Detail',
  image: 'Photo / Image',
  slug: 'Slug',
}

export const CMS_FORM_LABELS: Record<string, CmsFormLabels> = {
  default: defaultLabels,
  banner: {
    title: 'Heading accent (coloured line)',
    summary: 'Subline (small text above heading)',
    body: 'Notes (not shown on website)',
    image: 'Slide background photo',
    slug: 'Slug (optional)',
  },
  notice: {
    title: 'Notice text',
    summary: 'Summary',
    body: 'Body',
    image: 'Image',
    slug: 'Slug (optional)',
  },
}

export function getCmsFormLabels(type: string): CmsFormLabels {
  return CMS_FORM_LABELS[type] ?? defaultLabels
}
