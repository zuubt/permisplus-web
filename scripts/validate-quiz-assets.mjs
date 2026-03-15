import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const publicRoot = path.join(projectRoot, 'public')
const quizDataPath = path.join(projectRoot, 'lib', 'quiz-data.ts')
const assetPathsPath = path.join(projectRoot, 'assets', 'quiz-asset-paths.json')
const jsonReportPath = path.join(projectRoot, 'assets', 'missing-assets-report.json')
const mdReportPath = path.join(projectRoot, 'assets', 'missing-assets-report.md')

const quizDataSource = fs.readFileSync(quizDataPath, 'utf8')
const assetPathMap = JSON.parse(fs.readFileSync(assetPathsPath, 'utf8'))

const chapterTitles = Object.fromEntries(
  [...quizDataSource.matchAll(/\{\s*id:\s*(\d+),\s*title:\s*'([^']+)'/g)].map(([, id, title]) => [Number(id), title])
)

const quizBlocks = [...quizDataSource.matchAll(/\n  \{\n    id: '(ch[^']+)',([\s\S]*?)\n  \},/g)]

const references = []

for (const [, quizId, blockBody] of quizBlocks) {
  const chapterId = Number(blockBody.match(/chapter_id:\s*(\d+)/)?.[1] ?? '0')
  const prompt = unescapeQuoted(blockBody.match(/question:\s*'((?:\\'|[^'])*)'/)?.[1] ?? '')
  const questionImage = blockBody.match(/\n    image_key:\s*'([^']+)'/)

  if (questionImage) {
    references.push(createReference({
      imageKey: questionImage[1],
      quizId,
      chapterId,
      chapterTitle: chapterTitles[chapterId] ?? `Chapitre ${chapterId}`,
      prompt,
      role: 'question_image',
      label: prompt
    }))
  }

  for (const optionMatch of blockBody.matchAll(/text:\s*'((?:\\'|[^'])*)',\s*image_key:\s*'([^']+)'/g)) {
    references.push(createReference({
      imageKey: optionMatch[2],
      quizId,
      chapterId,
      chapterTitle: chapterTitles[chapterId] ?? `Chapitre ${chapterId}`,
      prompt,
      role: 'option_image',
      label: unescapeQuoted(optionMatch[1])
    }))
  }
}

const missingReferences = references.filter(reference => !reference.exists)
const existingReferences = references.filter(reference => reference.exists)

const groupedMissing = missingReferences.reduce((map, reference) => {
  if (!map.has(reference.assetPath)) map.set(reference.assetPath, [])
  map.get(reference.assetPath).push(reference)
  return map
}, new Map())

const reportJson = missingReferences.map(reference => ({
  assetPath: reference.assetPath,
  imageKey: reference.imageKey,
  quizId: reference.quizId,
  chapterId: reference.chapterId,
  chapterTitle: reference.chapterTitle,
  prompt: reference.prompt,
  role: reference.role,
  label: reference.label
}))

const reportMd = [
  '# Missing Quiz Assets',
  '',
  `- Total referenced assets: ${references.length}`,
  `- Existing asset references: ${existingReferences.length}`,
  `- Missing asset references: ${missingReferences.length}`,
  `- Unique missing asset paths: ${groupedMissing.size}`,
  '',
  '## Missing Files',
  ''
]

for (const [assetPath, refs] of [...groupedMissing.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  reportMd.push(`### ${assetPath}`)
  for (const reference of refs) {
    reportMd.push(`- ${reference.quizId} · chapitre ${reference.chapterId} (${reference.chapterTitle}) · ${reference.role} · ${reference.label}`)
  }
  reportMd.push('')
}

fs.writeFileSync(jsonReportPath, JSON.stringify(reportJson, null, 2) + '\n')
fs.writeFileSync(mdReportPath, reportMd.join('\n'))

console.log(`Total referenced assets: ${references.length}`)
console.log(`Existing asset references: ${existingReferences.length}`)
console.log(`Missing asset references: ${missingReferences.length}`)
console.log(`Unique missing asset paths: ${groupedMissing.size}`)
console.log(`Wrote ${path.relative(projectRoot, jsonReportPath)}`)
console.log(`Wrote ${path.relative(projectRoot, mdReportPath)}`)

function createReference({ imageKey, quizId, chapterId, chapterTitle, prompt, role, label }) {
  const assetPath = normalizeAssetPath(assetPathMap[imageKey] ?? `/assets/${imageKey}.jpg`)
  const filePath = path.join(publicRoot, assetPath.replace(/^\//, ''))

  return {
    imageKey,
    quizId,
    chapterId,
    chapterTitle,
    prompt,
    role,
    label,
    assetPath,
    exists: fs.existsSync(filePath)
  }
}

function normalizeAssetPath(assetPath) {
  if (assetPath.startsWith('/assets/')) return assetPath
  if (assetPath.startsWith('assets/')) return `/${assetPath}`
  if (assetPath.startsWith('./assets/')) return assetPath.slice(1)
  return assetPath.startsWith('/') ? assetPath : `/assets/${assetPath}`
}

function unescapeQuoted(value) {
  return value.replace(/\\'/g, "'")
}
