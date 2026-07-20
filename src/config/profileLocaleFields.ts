/**
 * School-profile text fields that need Marathi (`*_mr`) admin inputs
 * and are shown on the public website when locale=mr.
 */
export const PROFILE_MR_TEXT_KEYS = [
  'short_name',
  'address',
  'city',
  'hours',
  'meta_title',
  'meta_description',
  'home_about_label',
  'home_about_title',
  'home_about_paragraphs',
  'home_why_label',
  'home_why_title',
  'home_why_panel_title',
  'home_why_panel_desc',
  'home_why_choose',
  'home_learning_label',
  'home_learning_title_accent',
  'home_learning_title_rest',
  'home_learning_paragraphs',
  'home_learning_items',
  'home_enroll_steps',
  'home_cta_title',
  'home_cta_subtitle',
  'principal_name',
  'principal_message',
  'vision',
  'mission',
  'about_values_label',
  'about_values_title',
  'about_values',
  'about_journey_label',
  'about_journey_title',
  'about_timeline',
] as const

export type ProfileMrTextKey = (typeof PROFILE_MR_TEXT_KEYS)[number]

/** Admin field key for school full name Marathi (maps to title_mr + school_name_mr) */
export const PROFILE_NAME_MR_KEY = 'name_mr' as const
