import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sourceRoot = resolve(import.meta.dirname, '..', 'src')
const app = readFileSync(resolve(sourceRoot, 'App.tsx'), 'utf8')
const imports = [...app.matchAll(/lazy\(\(\) => import\('([^']+)'\)\)/g)].map((match) => match[1])
const missing = imports.filter((path) => !existsSync(resolve(sourceRoot, `${path.replace(/^@\//, '')}.tsx`)))
const routes = [...app.matchAll(/<Route path="([^"]+)"/g)].map((match) => match[1])
const requiredPublicRoutes = ['about', 'programs', 'gallery', 'videos', 'events', 'blog', 'admission', 'contact', 'faq']
const missingRoutes = requiredPublicRoutes.filter((route) => !routes.includes(route))

// Child route names intentionally repeat across role-specific layouts (for example,
// /admin/attendance and /teacher/attendance). A flat duplicate check treats those
// valid routes as an error, so only verify module availability and required public URLs.
if (missing.length || missingRoutes.length) {
  console.error(JSON.stringify({ missingLazyPageModules: missing, missingRequiredPublicRoutes: missingRoutes }, null, 2))
  process.exit(1)
}

console.log(`Route smoke check passed: ${imports.length} lazy page modules and ${routes.length} named routes verified.`)