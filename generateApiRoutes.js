import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const apiDir = path.join(__dirname, 'src/app/api')

const ignorePaths = [
  path.join(apiDir, 'auth'),
]

function toCamelCase(str) {
  return str
    .replace(/[-_]([a-z])/g, (_, char) => char.toUpperCase())
    .replace(/^([A-Z])/, (_, char) => char.toLowerCase());
}

function isIgnored(fullPath) {
  return ignorePaths.some(ignored => fullPath.startsWith(ignored))
}

function extractQueryKeys(filePath) {
  if (!fs.existsSync(filePath)) return []
  const content = fs.readFileSync(filePath, 'utf8')
  const matches = [...content.matchAll(/searchParams\.get\(['"`](\w+)['"`]\)/g)]
  return [...new Set(matches.map(m => m[1]))].sort()
}

function extractMethods(filePath) {
  if (!fs.existsSync(filePath)) return []
  const content = fs.readFileSync(filePath, 'utf8')
  return [...content.matchAll(/^export async function (\w+)/gm)].map(m => m[1].toUpperCase())
}

function extractParams(routePath) {
  return [...routePath.matchAll(/\[([^\]]+)]/g)].map(m => m[1])
}

function buildPathFunction(path, queryKeys) {
  const paramKeys = extractParams(path)
  const query = queryKeys.length
    ? queryKeys.map((k, i) => `${i ? '&' : '?'}${k}=\${${k} ?? ''}`).join('')
    : ''
  const full = path.replace(/\[([^\]]+)]/g, (_, k) => `\$\{${k}\}`) + query
  const allParams = [...paramKeys, ...queryKeys].map(p => `${p}?: string`).join(', ')
  return `(${allParams}) => \`${full}\``
}

function walk(dir) {
  const routesByMethod = {}

  function visit(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (isIgnored(fullPath)) continue

      if (entry.isDirectory()) {
        visit(fullPath)
      }

      if (entry.isFile() && entry.name === 'route.ts') {
        const methods = extractMethods(fullPath)
        const queryKeys = extractQueryKeys(fullPath)

        const relPath = path.relative(apiDir, fullPath).replace(/\\/g, '/')
        const route = '/api/' + relPath.replace(/\/route\.ts$/, '')
        
        // Handle special cases for chats
        if (route.includes('/chats/')) {
          const fn = buildPathFunction('/api/users/[userId]/chats/[chatId]', queryKeys)
          for (const method of methods) {
            routesByMethod[method] ||= {}
            routesByMethod[method]['chats'] = fn
          }
          continue
        }

        const segments = route.split('/').filter(Boolean).slice(1) // Remove 'api' prefix
        const routeKey = segments.length > 1 ? segments[1] : segments[0] // Use second segment or first if only one exists

        const fn = extractParams(route).length || queryKeys.length
          ? buildPathFunction(route, queryKeys)
          : `'${route}'`

        for (const method of methods) {
          routesByMethod[method] ||= {}
          const key = toCamelCase(routeKey.replace(/\[|\]/g, ''))
          routesByMethod[method][key] = fn
        }
      }
    }
  }

  visit(dir)
  return routesByMethod
}

function formatObject(obj, indent = 2) {
  const pad = ' '.repeat(indent)
  if (typeof obj === 'string') {
    if (obj.trim().startsWith('(') || obj.includes('=>')) return obj
    if (/^['"`].*['"`]$/.test(obj)) return obj
    return `'${obj}'`
  }

  const entries = Object.entries(obj)
    .map(([key, value]) => {
      // Aspas nas chaves que não são identificadores JS válidos (ex: friend-requests)
      const formattedKey = /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `'${key}'`
      return `${pad}${formattedKey}: ${formatObject(value, indent + 2)}`
    })
    .join(',\n')

  return `{\n${entries}\n${' '.repeat(indent - 2)}}`
}



const groupedRoutes = walk(apiDir)
const result = `export const API_ROUTES = ${formatObject(groupedRoutes)} as const\n`

fs.writeFileSync(path.join(__dirname, 'src/lib/apiRoutes.ts'), result, 'utf-8')
console.log('✅ API routes generated.')
