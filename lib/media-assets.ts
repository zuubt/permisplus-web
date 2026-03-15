import assetPathMapJson from '@/assets/quiz-asset-paths.json'
import missingAssetsReport from '@/assets/missing-assets-report.json'

type QuizAssetMap = Record<string, string>

interface MissingAssetEntry {
  assetPath: string
}

export interface ResolvedQuizAsset {
  assetPath: string
  alt: string
  isMissing: boolean
  src: string | null
  debugPath: string | null
}

const assetPathMap = assetPathMapJson as QuizAssetMap
const missingAssetPaths = new Set(
  (missingAssetsReport as MissingAssetEntry[]).map(entry => normalizeAssetPath(entry.assetPath))
)
const loggedMissingAssets = new Set<string>()

export function resolveQuizAsset(key?: string, label?: string): ResolvedQuizAsset | null {
  if (!key) return null

  const assetPath = normalizeAssetPath(assetPathMap[key] ?? getDefaultAssetPath(key))
  const isMissing = missingAssetPaths.has(assetPath)

  if (isMissing && process.env.NODE_ENV !== 'production' && !loggedMissingAssets.has(assetPath)) {
    loggedMissingAssets.add(assetPath)
    console.warn(`[PermisPlus] Missing quiz asset: ${assetPath}`)
  }

  return {
    assetPath,
    alt: label ?? humanizeAssetKey(key),
    isMissing,
    src: isMissing ? null : assetPath,
    debugPath: process.env.NODE_ENV === 'production' ? null : assetPath.replace(/^\//, ''),
  }
}

function normalizeAssetPath(assetPath: string): string {
  if (assetPath.startsWith('/assets/')) return assetPath
  if (assetPath.startsWith('assets/')) return `/${assetPath}`
  if (assetPath.startsWith('./assets/')) return assetPath.slice(1)
  return assetPath.startsWith('/') ? assetPath : `/assets/${assetPath}`
}

function getDefaultAssetPath(key: string): string {
  return `/assets/${key}.jpg`
}

function humanizeAssetKey(key: string): string {
  return key
    .split('/')
    .pop()
    ?.replace(/\.[a-z]+$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
    ?? 'Image'
}
