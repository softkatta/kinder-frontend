/** CMS meta field definitions â€” manage from Admin â†’ Website CMS */

export type CmsFieldType = 'text' | 'textarea' | 'date' | 'time' | 'select' | 'checkbox'

export interface CmsFieldDef {
  key: string
  label: string
  type: CmsFieldType
  placeholder?: string
  options?: { value: string; label: string }[]
  hint?: string
}

const highlightsField: CmsFieldDef = {
  key: 'highlights',
  label: 'Highlights',
  type: 'textarea',
  placeholder: 'One highlight per line',
  hint: 'Each line = one bullet point on the website',
}

export const CMS_META_FIELDS: Record<string, CmsFieldDef[]> = {
  program: [
    { key: 'grade_level', label: 'Grade Level', type: 'select', options: [
      { value: 'nursery', label: 'Nursery' },
      { value: 'lkg', label: 'LKG' },
      { value: 'ukg', label: 'UKG' },
    ]},
    { key: 'ages', label: 'Age Group', type: 'text', placeholder: 'e.g. 2 â€“ 3 yrs' },
    { key: 'time', label: 'Timings', type: 'text', placeholder: 'e.g. 10 AM â€“ 1 PM' },
    { key: 'price', label: 'Monthly Fee', type: 'text', placeholder: 'e.g. â‚¹3,500/mo' },
    { key: 'price_6month', label: '6-Month Fee', type: 'text', placeholder: 'e.g. â‚¹19,500/6 mo' },
    { key: 'price_yearly', label: 'Yearly Fee', type: 'text', placeholder: 'e.g. â‚¹38,000/yr' },
    highlightsField,
  ],
  facility: [
    { key: 'icon', label: 'Icon', type: 'select', options: [
      { value: 'library', label: 'Library' },
      { value: 'music', label: 'Music' },
      { value: 'art', label: 'Art' },
      { value: 'playground', label: 'Playground' },
      { value: 'transport', label: 'Transport' },
      { value: 'smart', label: 'Smart Class' },
      { value: 'medical', label: 'Medical' },
      { value: 'cctv', label: 'CCTV / Security' },
      { value: 'activity', label: 'Activities' },
    ], hint: 'Shown on facility cards' },
    highlightsField,
  ],
  activity: [highlightsField],
  event: [
    { key: 'date', label: 'Event Date', type: 'date' },
    { key: 'time', label: 'Event Time', type: 'time', placeholder: 'e.g. 10:00 AM' },
    { key: 'location', label: 'Location', type: 'text', placeholder: 'e.g. School auditorium' },
    highlightsField,
  ],
  blog: [
    { key: 'author', label: 'Added By / Author', type: 'text', placeholder: 'e.g. Dr. Priya Sharma' },
    { key: 'date', label: 'Publish Date', type: 'date' },
    { key: 'readTime', label: 'Read Time', type: 'text', placeholder: 'e.g. 4 min' },
    { key: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Education' },
    { key: 'featured', label: 'Featured on blog homepage', type: 'checkbox' },
  ],
  job: [
    { key: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Early Years' },
    { key: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Pune' },
    { key: 'application_deadline', label: 'Application Deadline', type: 'date' },
    { key: 'employment_type', label: 'Job Type', type: 'text', placeholder: 'e.g. Full-time' },
    { key: 'salary_range', label: 'Salary Range', type: 'text', placeholder: 'e.g. â‚¹15,000 â€“ â‚¹25,000' },
    { key: 'requirements', label: 'Requirements', type: 'textarea', placeholder: 'One requirement per line', hint: 'Shown on job details page' },
  ],
  gallery: [
    { key: 'album', label: 'Album Name', type: 'text', placeholder: 'e.g. Daily Life' },
  ],
  video: [
    { key: 'album', label: 'Category', type: 'text', placeholder: 'e.g. Annual Day' },
  ],
  faq: [],
  banner: [
    { key: 'title_rest', label: 'Heading rest (second line)', type: 'text', placeholder: 'e.g. Your Children', hint: 'Appears after the coloured heading accent' },
  ],
  notice: [
    { key: 'link_url', label: 'Link (optional)', type: 'text', placeholder: 'e.g. /events or https://...', hint: 'Internal path or full URL â€” notice text becomes clickable' },
    { key: 'expires_at', label: 'Hide after date (optional)', type: 'date', hint: 'Notice stops showing on the homepage after this date' },
  ],
  testimonial: [
    { key: 'author', label: 'Parent Name', type: 'text' },
    { key: 'role', label: 'Relation', type: 'text', placeholder: 'e.g. Parent of Nursery A' },
  ],
  staff: [
    { key: 'role', label: 'Role / Designation', type: 'text', placeholder: 'e.g. Nursery Teacher' },
    { key: 'qualification', label: 'Qualification', type: 'text', placeholder: 'e.g. B.Ed' },
  ],
  curriculum: [
    { key: 'grade_level', label: 'Grade Level', type: 'select', options: [
      { value: 'nursery', label: 'Nursery' },
      { value: 'lkg', label: 'LKG' },
      { value: 'ukg', label: 'UKG' },
    ]},
    highlightsField,
  ],
  page: [],
}

