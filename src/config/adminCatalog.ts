import { kindergartenPhotos } from './kindergartenPlaceholders'

/** Admin portal imagery — reuses kindergarten CMS placeholders */
export const adminImages = {
  campus: kindergartenPhotos.heroWide,
  classroom: kindergartenPhotos.about,
  playground: kindergartenPhotos.aboutPlayground,
  nursery: kindergartenPhotos.nursery,
  sidebar: kindergartenPhotos.heroSlide2,
  event: kindergartenPhotos.event,
  gallery: kindergartenPhotos.gallery,
  activities: kindergartenPhotos.activity,
  facilities: kindergartenPhotos.facility,
  about: kindergartenPhotos.about,
} as const

/** Child / people portraits for tables & cards */
export const adminPortraits = {
  aarav: kindergartenPhotos.activity[7],
  isha: kindergartenPhotos.activity[0],
  vihaan: kindergartenPhotos.activity[3],
  ananya: kindergartenPhotos.activity[6],
  kabir: kindergartenPhotos.activity[4],
  riya: kindergartenPhotos.nursery,
  saanvi: kindergartenPhotos.ukg,
  arjun: kindergartenPhotos.lkg,
  priya: kindergartenPhotos.aboutSmall,
  rajesh: kindergartenPhotos.why[1],
  superAdmin: kindergartenPhotos.aboutAccent,
} as const

export const adminActivityImages = [
  adminImages.nursery,
  adminImages.classroom,
  adminImages.playground,
] as const

export const adminSnapshotImages = [
  { label: 'Morning Circle', image: adminImages.nursery },
  { label: 'Art Class', image: adminImages.facilities[3] },
  { label: 'Playground', image: adminImages.playground },
  { label: 'Story Time', image: adminImages.classroom },
] as const
