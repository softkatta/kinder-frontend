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

export type StudentStatus = 'Active' | 'Inactive'
export type AdmissionStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected'
export type PaymentStatus = 'Verified' | 'Pending'

export interface AdminStudent {
  id: number
  name: string
  class: string
  parent: string
  status: StudentStatus
  roll: string
  photo: string
}

export interface AdminAdmission {
  id: number
  name: string
  program: string
  date: string
  status: AdmissionStatus
  parent: string
  photo: string
}

export interface AdminUser {
  name: string
  email: string
  role: string
  status: 'Active' | 'Inactive'
  photo: string
}

export interface AdminPayment {
  id: number
  student: string
  amount: string
  method: string
  status: PaymentStatus
  date: string
  ref: string
  photo: string
}

const studentNames = [
  'Aarav Sharma', 'Isha Patel', 'Vihaan Desai', 'Ananya Kulkarni', 'Kabir Singh',
  'Riya Mehta', 'Saanvi Joshi', 'Arjun Nair', 'Diya Reddy', 'Rohan Gupta',
  'Mira Shah', 'Advait Rao', 'Kiara Verma', 'Vivaan Iyer', 'Nisha Pillai',
  'Karan Malhotra', 'Pari Bansal', 'Yash Khanna', 'Zara Chopra', 'Dev Agarwal',
  'Aanya Dutta', 'Reyansh Joshi', 'Myra Kapoor', 'Atharv Saxena',
]

const parentNames = [
  'Rajesh Parent', 'Meera Patel', 'Suresh Desai', 'Priya Kulkarni', 'Amit Singh',
  'Sunil Mehta', 'Neha Joshi', 'Deepa Nair', 'Ravi Reddy', 'Anjali Gupta',
  'Vikram Shah', 'Lata Rao', 'Manish Verma', 'Sunita Iyer', 'George Pillai',
]

const classes = ['Nursery A', 'Nursery B', 'LKG A', 'LKG B', 'UKG A', 'UKG B']
const programs = ['Nursery', 'LKG', 'UKG']
const portraits = Object.values(adminPortraits)
const methods = ['UPI', 'Cash', 'Razorpay'] as const

function padId(n: number, width = 3) {
  return String(n).padStart(width, '0')
}

export const adminStudents: AdminStudent[] = studentNames.map((name, i) => {
  const cls = classes[i % classes.length]!
  const prefix = cls.startsWith('Nursery') ? 'NS' : cls.startsWith('LKG') ? 'LK' : 'UK'
  return {
    id: i + 1,
    name,
    class: cls,
    parent: parentNames[i % parentNames.length]!,
    status: i % 9 === 0 ? 'Inactive' : 'Active',
    roll: `${prefix}-${padId(i + 1)}`,
    photo: portraits[i % portraits.length]!,
  }
})

const admissionStatuses: AdmissionStatus[] = ['Pending', 'Under Review', 'Approved', 'Rejected']

export const adminAdmissions: AdminAdmission[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: studentNames[(i + 5) % studentNames.length]!,
  program: programs[i % programs.length]!,
  date: `2026-06-${padId(28 - (i % 20), 2)}`,
  status: admissionStatuses[i % admissionStatuses.length]!,
  parent: parentNames[i % parentNames.length]!,
  photo: portraits[(i + 2) % portraits.length]!,
}))

export const adminUsers: AdminUser[] = [
  { name: 'Priya Teacher', email: 'teacher@littlestars.com', role: 'Teacher', status: 'Active', photo: adminPortraits.priya },
  { name: 'Rajesh Parent', email: 'parent@littlestars.com', role: 'Parent', status: 'Active', photo: adminPortraits.rajesh },
  { name: 'Aarav Student', email: 'student@littlestars.com', role: 'Student', status: 'Active', photo: adminPortraits.aarav },
  ...Array.from({ length: 12 }, (_, i) => ({
    name: `${['Anita', 'Rohit', 'Sneha', 'Kunal', 'Pooja', 'Nitin'][i % 6]} ${['Sharma', 'Patel', 'Desai', 'Kulkarni'][i % 4]}`,
    email: `user${i + 1}@littlestars.com`,
    role: (['Teacher', 'Parent', 'Teacher', 'Parent'] as const)[i % 4]!,
    status: (i % 7 === 0 ? 'Inactive' : 'Active') as AdminUser['status'],
    photo: portraits[i % portraits.length]!,
  })),
]

export const adminPayments: AdminPayment[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  student: studentNames[i % studentNames.length]!,
  amount: `₹${['5,000', '3,500', '2,000', '4,500', '6,000'][i % 5]}`,
  method: methods[i % methods.length]!,
  status: (i % 4 === 1 ? 'Pending' : 'Verified') as PaymentStatus,
  date: `2026-06-${padId(28 - (i % 24), 2)}`,
  ref: `${methods[i % methods.length] === 'Cash' ? 'CSH' : methods[i % methods.length] === 'Razorpay' ? 'RZP' : 'TXN'}-${88000 + i}`,
  photo: portraits[i % portraits.length]!,
}))

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
