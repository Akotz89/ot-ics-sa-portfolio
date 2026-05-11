import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const root = resolve(process.cwd())

require.extensions['.ts'] = (module, filename) => {
  const source = readFileSync(filename, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  module._compile(output, filename)
}

const { evidenceCatalog } = require(join(root, 'whiteboard/app/model/evidence.ts'))
const { zones, entities, links } = require(join(root, 'whiteboard/app/model/topology.ts'))
const { steps } = require(join(root, 'whiteboard/app/model/steps.ts'))

const errors = []
const approvedPublicPrefixes = [
  'https://csrc.nist.gov/pubs/sp/800/82/r3/final',
  'https://www.dragos.com/resources/datasheet/dragos-centralstore-simplify-large-scale-sensor-deployments/',
  'https://www.dragos.com/resources/datasheet/dragos-appliance-datasheet/',
]

for (const evidence of Object.values(evidenceCatalog)) {
  if (!evidence.claim?.trim()) errors.push(`${evidence.id} has no claim`)
  if (!evidence.source?.trim()) errors.push(`${evidence.id} has no source`)
  if (evidence.kind === 'portfolio') {
    const filePath = join(root, evidence.url.split('#')[0])
    if (!existsSync(filePath)) errors.push(`${evidence.id} local source missing: ${evidence.url}`)
  } else if (!approvedPublicPrefixes.some((prefix) => evidence.url.startsWith(prefix))) {
    errors.push(`${evidence.id} public URL is not on the approved whiteboard evidence list`)
  }
}

for (const zone of zones) checkRefs(`zone ${zone.id}`, zone.evidenceRefs)
for (const entity of entities) checkRefs(`entity ${entity.id}`, entity.evidenceRefs)
for (const link of links) checkRefs(`link ${link.id}`, link.evidenceRefs)
for (const step of steps) checkRefs(`step ${step.id}`, step.evidenceRefs)

if (steps.length !== 24) errors.push(`expected 24 whiteboard steps, found ${steps.length}`)

const readme = readFileSync(join(root, 'README.md'), 'utf8')
const index = readFileSync(join(root, 'index.html'), 'utf8')
const publicCopy = `${readme}\n${index}`
if (/8[- ]step/i.test(readme)) errors.push('README still references an 8-step whiteboard')
if (/Purdue Model architecture walkthrough/i.test(publicCopy)) errors.push('public copy still positions the whiteboard as a Purdue walkthrough')
if (/diagrams\.html/i.test(publicCopy)) errors.push('public copy still links to deleted diagrams.html')
if (!/24-step/i.test(readme)) errors.push('README does not position the whiteboard as 24-step')
if (!/flagship interactive/i.test(index)) errors.push('homepage does not position the whiteboard as the flagship interactive demo')
if (containsActiveRuntimeText(['tldraw', '<svg', 'foreignObject', '<marker'])) {
  errors.push('active whiteboard runtime still contains banned SVG/tldraw markers')
}

console.log('| Whiteboard claim | Evidence | Source | Status |')
console.log('|---|---|---|---|')
for (const evidence of Object.values(evidenceCatalog)) {
  console.log(`| ${escapeCell(evidence.claim)} | ${evidence.id} | ${escapeCell(evidence.source)} | PASS |`)
}

if (errors.length) {
  console.error(`\nWhiteboard scenario alignment failed:\n- ${errors.join('\n- ')}`)
  process.exitCode = 1
} else {
  console.log(`\nWhiteboard scenario alignment passed: ${zones.length} zones, ${entities.length} entities, ${links.length} links, ${steps.length} steps, ${Object.keys(evidenceCatalog).length} evidence anchors.`)
}

function checkRefs(owner, refs) {
  if (!refs?.length) {
    errors.push(`${owner} has no evidenceRefs`)
    return
  }
  for (const ref of refs) {
    if (!evidenceCatalog[ref]) errors.push(`${owner} references unknown evidence ${ref}`)
  }
}

function containsActiveRuntimeText(needles) {
  const roots = [join(root, 'whiteboard/app'), join(root, 'whiteboard/index.html'), join(root, 'package.json'), join(root, 'package-lock.json')]
  for (const item of roots) {
    if (scanPath(item, needles)) return true
  }
  return false
}

function scanPath(pathname, needles) {
  const stats = statSync(pathname)
  if (stats.isDirectory()) {
    return readdirSync(pathname).some((child) => scanPath(join(pathname, child), needles))
  }
  const text = readFileSync(pathname, 'utf8')
  return needles.some((needle) => text.includes(needle))
}

function escapeCell(value) {
  return String(value).replaceAll('|', '/')
}
