import { kindergartenPhotos } from '@/config/kindergartenPlaceholders'

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export interface CatalogItem {
  slug: string
  title: string
  summary: string
  image: string
  detail: string
  highlights: string[]
  meta?: Record<string, string>
}

export const programCatalog: CatalogItem[] = [
  {
    slug: 'nursery',
    title: 'Nursery',
    summary: 'First steps — songs, stories, colourful play, and gentle routines.',
    image: kindergartenPhotos.nursery,
    detail: 'Our Nursery program welcomes children into a warm, playful environment where learning feels like discovery. Through songs, stories, sensory play, and gentle routines, little ones build trust, language, and social skills.',
    highlights: ['Sensory & motor play', 'Rhymes & storytelling', 'Social bonding', 'Potty-training support'],
    meta: { ages: '2 – 3 yrs', time: '10 AM – 1 PM', price: '₹3,500/mo', price_6month: '₹19,500/6 mo', price_yearly: '₹38,000/yr' },
  },
  {
    slug: 'lkg',
    title: 'LKG',
    summary: 'Letters, numbers, social skills, and crafts — joyful classroom learning.',
    image: kindergartenPhotos.lkg,
    detail: 'LKG bridges home and school with structured play, early literacy, numeracy, and creative projects. Children learn to express themselves, share, and follow classroom rhythms with confidence.',
    highlights: ['Phonics & pre-writing', 'Number sense', 'Art & craft', 'Group activities'],
    meta: { ages: '3 – 4 yrs', time: '10 AM – 3 PM', price: '₹4,200/mo', price_6month: '₹23,400/6 mo', price_yearly: '₹45,600/yr' },
  },
  {
    slug: 'ukg',
    title: 'UKG',
    summary: 'School readiness — reading preparation, independence, and creative thinking.',
    image: kindergartenPhotos.ukg,
    detail: 'UKG prepares children for primary school with stronger literacy, problem-solving, independence, and presentation skills — all through engaging, age-appropriate activities.',
    highlights: ['Reading readiness', 'Logical thinking', 'Public speaking', 'Independence'],
    meta: { ages: '4.5 – 5.5 yrs', time: '10 AM – 5 PM', price: '₹4,800/mo', price_6month: '₹26,700/6 mo', price_yearly: '₹52,200/yr' },
  },
]

export const facilityCatalog: CatalogItem[] = [
  { slug: 'smart', title: 'Smart Classrooms', summary: 'Digital boards and interactive learning.', image: kindergartenPhotos.facility[0], detail: 'Bright, air-conditioned classrooms equipped with smart boards, visual aids, and child-friendly furniture designed for comfort and focus.', highlights: ['Interactive displays', 'Child-safe furniture', 'Natural lighting', 'Age-appropriate tools'] },
  { slug: 'playground', title: 'Playground', summary: 'Safe outdoor play for physical development.', image: kindergartenPhotos.facility[1], detail: 'A secure outdoor zone with soft flooring, climbing structures, sand play, and shaded areas for active, supervised recreation.', highlights: ['Soft play surfaces', 'Supervised outdoor time', 'Motor skill zones', 'Shaded seating'] },
  { slug: 'library', title: 'Library', summary: 'Picture books and a love of reading.', image: kindergartenPhotos.facility[2], detail: 'A cosy reading corner stocked with picture books, story sets, and quiet nooks that nurture imagination and early literacy.', highlights: ['Age-graded books', 'Story sessions', 'Quiet reading corners', 'Parent borrowing'] },
  { slug: 'art', title: 'Art Room', summary: 'Colours, crafts, and creativity.', image: kindergartenPhotos.facility[3], detail: 'A dedicated creative studio for painting, craft, collage, and seasonal projects that celebrate every child\'s unique expression.', highlights: ['Non-toxic materials', 'Display gallery', 'Seasonal crafts', 'Fine motor focus'] },
  { slug: 'music', title: 'Music Room', summary: 'Songs, rhythm, and music-based learning.', image: kindergartenPhotos.facility[4], detail: 'Children explore rhythm, instruments, and movement in a joyful music space that builds listening skills and confidence.', highlights: ['Percussion & rhythm', 'Action songs', 'Festival performances', 'Movement & dance'] },
  { slug: 'transport', title: 'Safe Transport', summary: 'GPS-tracked buses with trained drivers.', image: kindergartenPhotos.facility[5], detail: 'Our fleet includes GPS-enabled buses, lady attendants, and trained drivers following strict safety protocols on every route.', highlights: ['GPS tracking', 'Lady attendant', 'Verified drivers', 'Route alerts'] },
]

export const activityCatalog: CatalogItem[] = [
  { slug: 'art', title: 'Art', summary: 'Colours, painting & creative expression', image: kindergartenPhotos.activity[0], detail: 'Children experiment with colours, textures, and free expression through guided and open-ended art sessions.', highlights: ['Water colours & finger paint', 'Texture exploration', 'Seasonal themes', 'Art exhibitions'] },
  { slug: 'craft', title: 'Craft', summary: 'Hands-on making & fine motor skills', image: kindergartenPhotos.activity[1], detail: 'Paper craft, clay modelling, and collage projects strengthen fine motor skills while sparking pride in creation.', highlights: ['Clay & paper craft', 'Scissor skills', 'Take-home projects', 'Festival crafts'] },
  { slug: 'dance', title: 'Dance', summary: 'Rhythm, movement & confidence', image: kindergartenPhotos.activity[2], detail: 'Dance sessions blend folk, freestyle, and festival choreography to build coordination, rhythm, and stage confidence.', highlights: ['Folk & freestyle', 'Annual day prep', 'Rhythm games', 'Group performances'] },
  { slug: 'music', title: 'Music', summary: 'Songs, instruments & joy', image: kindergartenPhotos.activity[3], detail: 'From nursery rhymes to percussion circles, music is woven into daily routines to support memory and joy.', highlights: ['Rhymes & action songs', 'Instrument play', 'Listening skills', 'Morning assemblies'] },
  { slug: 'sports', title: 'Sports', summary: 'Active play & teamwork', image: kindergartenPhotos.activity[4], detail: 'Outdoor games, races, and team challenges develop fitness, sportsmanship, and cooperative play.', highlights: ['Obstacle courses', 'Team games', 'Sports day', 'Motor development'] },
  { slug: 'storytelling', title: 'Storytelling', summary: 'Imagination & language growth', image: kindergartenPhotos.activity[5], detail: 'Puppet shows, picture books, and dramatic retelling build vocabulary, empathy, and a lifelong love of stories.', highlights: ['Puppet theatre', 'Library visits', 'Dramatic play', 'Vocabulary building'] },
  { slug: 'puzzle', title: 'Puzzle', summary: 'Logic & problem solving', image: kindergartenPhotos.activity[6], detail: 'Puzzles, sorting games, and pattern activities introduce early logic in a playful, low-pressure way.', highlights: ['Shape sorters', 'Board puzzles', 'Pattern games', 'STEM corners'] },
  { slug: 'yoga', title: 'Yoga', summary: 'Calm, focus & flexibility', image: kindergartenPhotos.activity[7], detail: 'Child-friendly yoga and breathing exercises promote calm, body awareness, and mindful moments.', highlights: ['Animal poses', 'Breathing games', 'Mindful minutes', 'Flexibility'] },
  { slug: 'drawing', title: 'Drawing', summary: 'Sketching & visual thinking', image: kindergartenPhotos.activity[8], detail: 'Guided drawing and doodling sessions help children observe, plan, and communicate through visuals.', highlights: ['Step-by-step drawing', 'Free sketching', 'Observation walks', 'Portfolio keepsakes'] },
  { slug: 'festivals', title: 'Festivals', summary: 'Culture, fun & togetherness', image: kindergartenPhotos.activity[9], detail: 'We celebrate diverse festivals with costumes, food, music, and stories — teaching culture through joy.', highlights: ['Cultural celebrations', 'Costume days', 'Community events', 'Parent participation'] },
]

export interface EventItem {
  id: string
  title: string
  summary: string
  image: string
  date: string
  time?: string
  location: string
  detail: string
  highlights: string[]
}

function formatEventDate(daysFromNow: number) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

export const eventCatalog: EventItem[] = [
  { id: 'parent-teacher-meet', title: 'Parent–Teacher Meet', summary: 'Meet teachers and review progress together.', image: kindergartenPhotos.event, date: formatEventDate(5), location: 'Little Stars campus', detail: 'An open session for parents to meet class teachers, discuss progress, and plan the term ahead in a friendly, collaborative setting.', highlights: ['One-on-one discussions', 'Progress reports', 'Q&A with coordinators', 'Light refreshments'] },
  { id: 'colour-craft-day', title: 'Colour & Craft Day', summary: 'Painting, craft, and creative expression for all grades.', image: kindergartenPhotos.gallery[1], date: formatEventDate(12), location: 'Activity hall', detail: 'Children enjoy a full day of colours, crafts, and collaborative art projects displayed in a mini exhibition for families.', highlights: ['Group murals', 'Take-home crafts', 'Costume corner', 'Photo booth'] },
  { id: 'annual-day-rehearsal', title: 'Annual Day Rehearsal', summary: 'Dance, music, and stage performances in preparation.', image: kindergartenPhotos.gallery[2], date: formatEventDate(18), location: 'School auditorium', detail: 'Students rehearse dances, skits, and musical performances for the upcoming annual celebration with professional guidance.', highlights: ['Stage practice', 'Costume fitting', 'Music rehearsals', 'Confidence building'] },
  { id: 'sports-fun-morning', title: 'Sports & Fun Morning', summary: 'Outdoor games, races, and team activities.', image: kindergartenPhotos.gallery[3], date: formatEventDate(22), location: 'Playground', detail: 'A morning of races, relay games, and team challenges designed to build fitness, teamwork, and school spirit.', highlights: ['Obstacle races', 'Team relays', 'Medals & cheers', 'Healthy snacks'] },
]

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  image: string
  author: string
  date: string
  category: string
  readTime: string
  content: string[]
  featured?: boolean
}

export const blogCatalog: BlogPost[] = [
  { slug: 'play-based-learning', title: 'Why Play-Based Learning Works', excerpt: 'Discover how play builds brain connections and confidence in early years.', image: kindergartenPhotos.activity[0], author: 'Dr. Priya Sharma', date: '2026-06-15', category: 'Education', readTime: '4 min', content: ['Young children learn best when they feel safe, curious, and engaged. Play is not a break from learning — it is learning.', 'Through blocks, pretend play, and outdoor games, children develop language, math, and social skills naturally.', 'At Little Stars, every corner of the classroom is designed to invite exploration and joyful discovery.'] },
  { slug: 'first-day-tips', title: 'First Day at School: Tips for Parents', excerpt: 'Gentle ways to help your child settle into kindergarten happily.', image: kindergartenPhotos.nursery, author: 'Ms. Ananya', date: '2026-06-08', category: 'Parenting', readTime: '5 min', content: ['A predictable morning routine helps children feel secure. Pack the bag together the night before.', 'Keep goodbyes short and positive — teachers are trained to comfort and engage new learners quickly.', 'Share any preferences or concerns with the class teacher so we can personalise care from day one.'] },
  { slug: 'nutrition-breakfast', title: 'Healthy Breakfast Ideas for Busy Mornings', excerpt: 'Quick, nutritious options before the school day begins.', image: kindergartenPhotos.lkg, author: 'School Wellness Team', date: '2026-05-28', category: 'Wellness', readTime: '3 min', content: ['A balanced breakfast fuels focus and energy. Try idli, paratha rolls, fruit bowls, or overnight oats.', 'Avoid heavy sugar before school — steady energy beats a mid-morning crash.', 'Pack a small healthy snack if your child has a long day in UKG.'] },
  { slug: 'festival-celebrations', title: 'Celebrating Festivals at Little Stars', excerpt: 'How we teach culture, unity, and joy through school celebrations.', image: kindergartenPhotos.activity[9], author: 'Cultural Committee', date: '2026-05-20', category: 'School Life', readTime: '4 min', content: ['Festivals are lived experiences — costumes, stories, food, and music bring traditions alive.', 'Children learn respect for diversity while building memories with friends and teachers.', 'Parents are welcome at select celebrations throughout the year.'] },
  { slug: 'reading-at-home', title: 'Building a Reading Habit at Home', excerpt: 'Simple nightly rituals that grow lifelong readers.', image: kindergartenPhotos.facility[2], author: 'Library Team', date: '2026-05-12', category: 'Literacy', readTime: '4 min', content: ['Ten minutes of shared reading each night makes a remarkable difference.', 'Let children choose books, ask questions about pictures, and retell stories in their own words.', 'Visit our library corner during parent visits to borrow age-appropriate titles.'] },
  { slug: 'outdoor-play-matters', title: 'Why Outdoor Play Matters Every Day', excerpt: 'Fresh air, movement, and nature support whole-child development.', image: kindergartenPhotos.facility[1], author: 'Sports Coordinator', date: '2026-05-05', category: 'Wellness', readTime: '3 min', content: ['Outdoor time builds gross motor skills, vitamin D, and emotional regulation.', 'Our playground is supervised, shaded, and designed for safe climbing and running.', 'Rainy days? We adapt with indoor movement games without skipping active play.'] },
]

export function findProgram(slug: string) {
  return programCatalog.find((p) => p.slug === slug)
}

export function findFacility(slug: string) {
  return facilityCatalog.find((f) => f.slug === slug)
}

export function findActivity(slug: string) {
  return activityCatalog.find((a) => a.slug === slug)
}

export function findEvent(id: string) {
  return eventCatalog.find((e) => e.id === id)
}

export function findBlog(slug: string) {
  return blogCatalog.find((b) => b.slug === slug)
}
