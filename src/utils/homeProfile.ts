/** Parse school_profile meta into homepage section props */

export function parseTextLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value.split('\n').map((s) => s.trim()).filter(Boolean)
  }
  return []
}

export function parsePipePairs(value: unknown): { title: string; description: string }[] {
  return parseTextLines(value).map((line) => {
    const [title, ...rest] = line.split('|')
    return { title: title?.trim() || '', description: rest.join('|').trim() }
  }).filter((row) => row.title)
}

export function parseTimelineItems(value: unknown): { year: string; title: string; description: string }[] {
  return parseTextLines(value).map((line) => {
    const [year, title, ...rest] = line.split('|')
    return {
      year: year?.trim() || '',
      title: title?.trim() || '',
      description: rest.join('|').trim(),
    }
  }).filter((row) => row.year && row.title)
}

export function parseLearningItems(value: unknown): { key: string; title: string; desc: string }[] {
  return parseTextLines(value).map((line) => {
    const [key, title, ...rest] = line.split('|')
    return {
      key: key?.trim() || 'activity',
      title: title?.trim() || '',
      desc: rest.join('|').trim(),
    }
  }).filter((row) => row.title)
}

export interface HomeProfileContent {
  aboutLabel: string
  aboutTitle: string
  aboutParagraphs: string[]
  whyLabel: string
  whyTitle: string
  whyPanelTitle: string
  whyPanelDesc: string
  whyChoose: { title: string; description: string }[]
  learningLabel: string
  learningTitleAccent: string
  learningTitleRest: string
  learningParagraphs: string[]
  learningItems: { key: string; title: string; desc: string }[]
  enrollSteps: { title: string; description: string }[]
  ctaTitle: string
  ctaSubtitle: string
}

export function homeContentFromProfile(
  profile: Record<string, unknown> | undefined,
  ui: {
    aboutLabel: string
    aboutTitle: string
    whyLabel: string
    whyTitle: string
    whyPanelTitle: string
    whyPanelDesc: string
    learningLabel: string
    learningTitleAccent: string
    learningTitleRest: string
    learningParagraphs?: string[]
    learningItems?: { key: string; title: string; desc: string }[]
    ctaTitle: string
    ctaSubtitle: string
  },
): HomeProfileContent {
  const p = profile ?? {}
  const str = (key: string, fallback: string) => {
    const v = p[key]
    return typeof v === 'string' && v.trim() ? v : fallback
  }

  const learningParagraphs = parseTextLines(p.home_learning_paragraphs)
  const learningItems = parseLearningItems(p.home_learning_items)

  return {
    aboutLabel: str('home_about_label', ui.aboutLabel),
    aboutTitle: str('home_about_title', ui.aboutTitle),
    aboutParagraphs: parseTextLines(p.home_about_paragraphs),
    whyLabel: str('home_why_label', ui.whyLabel),
    whyTitle: str('home_why_title', ui.whyTitle),
    whyPanelTitle: str('home_why_panel_title', ui.whyPanelTitle),
    whyPanelDesc: str('home_why_panel_desc', ui.whyPanelDesc),
    whyChoose: parsePipePairs(p.home_why_choose),
    learningLabel: str('home_learning_label', ui.learningLabel),
    learningTitleAccent: str('home_learning_title_accent', ui.learningTitleAccent),
    learningTitleRest: str('home_learning_title_rest', ui.learningTitleRest),
    learningParagraphs: learningParagraphs.length > 0 ? learningParagraphs : (ui.learningParagraphs ?? []),
    learningItems: learningItems.length > 0 ? learningItems : (ui.learningItems ?? []),
    enrollSteps: parsePipePairs(p.home_enroll_steps),
    ctaTitle: str('home_cta_title', ui.ctaTitle),
    ctaSubtitle: str('home_cta_subtitle', ui.ctaSubtitle),
  }
}
