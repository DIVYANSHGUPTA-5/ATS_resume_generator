// Client-side resume file parsing: extract raw text from a user-selected
// PDF/DOCX file, then heuristically map it onto the app's candidate shape.
//
// Guiding rule throughout: never invent data. Every field below either comes
// directly from a matched substring of the uploaded file, or is left blank
// for the user to fill in. Nothing here estimates, guesses, or fabricates
// experience, dates, or metrics.

import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import mammoth from 'mammoth'
import { nextId, createEmptyCandidate } from '../data/demoData.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/**
 * Extract raw text plus any real hyperlink URLs (LinkedIn/GitHub/portfolio
 * profile links, per-project repo links) the file actually contains. Many
 * resume templates render these as a bare clickable label ("GitHub") with no
 * visible URL text, so the plain text alone can't recover them — but the
 * link is genuinely present in the file, so surfacing it isn't a guess.
 * Returns { text, links }.
 */
export async function extractTextFromFile(file) {
  const name = (file.name || '').toLowerCase()
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return extractPdfText(file)
  }
  if (name.endsWith('.docx') || file.type === DOCX_MIME) {
    return extractDocxText(file)
  }
  if (name.endsWith('.doc')) {
    throw new Error('Legacy .doc files are not supported yet — please save it as .docx or PDF and try again.')
  }
  throw new Error('Unsupported file type. Please upload a PDF or DOCX resume.')
}

async function extractPdfText(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const lines = []
  const links = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    let currentY = null
    let currentLine = []
    for (const item of content.items) {
      if (typeof item.str !== 'string') continue
      const y = Math.round(item.transform[5])
      if (currentY !== null && Math.abs(y - currentY) > 2) {
        lines.push(currentLine.join(' '))
        currentLine = []
      }
      currentY = y
      currentLine.push(item.str)
    }
    if (currentLine.length) lines.push(currentLine.join(' '))
    lines.push('')

    const annotations = await page.getAnnotations()
    for (const a of annotations) {
      if (a.subtype === 'Link' && typeof a.url === 'string') links.push(a.url)
    }
  }
  return { text: lines.join('\n'), links }
}

async function extractDocxText(file) {
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  const html = await mammoth.convertToHtml({ arrayBuffer: buffer })
  const links = [...html.value.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
  return { text: result.value, links }
}

// ---------------------------------------------------------------------------
// Text -> candidate mapping
//
// PDF/DOCX text extraction hands back a flat stream of lines that has lost
// the document's visual structure: long bullets wrap across several lines,
// section templates use all kinds of bullet/divider glyphs (or none at all),
// and columns (e.g. "School   City, Country") collapse onto one line. The
// pipeline below is section- and context-aware rather than purely
// line-by-line: it first reconstructs wrapped sentences, then locates named
// sections, then — within each section — groups lines into entries using
// whatever structural signal that resume actually provides (an entry-divider
// glyph, a date range, a degree keyword, …) before extracting fields.

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/\S+/i
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/\S+/i
const URL_RE = /(https?:\/\/\S+|(?:www\.)?[a-z0-9-]+\.(?:com|io|dev|net|org)\/\S*)/i
const YEAR_RE = /\b(19|20)\d{2}\b/
const DATE_RANGE_RE =
  /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4})\s*(?:-|–|—|to)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4}|present|current)\b/i
const SINGLE_DATE_RE = /^(?:[A-Za-z]{3,9}\.?\s+\d{4}|\d{4})$/
// Bullet glyphs used on individual description lines.
const BULLET_RE = /^[•\-*●▪◦‣∙·○]\s*/
// A leading "|" is a different signal: many resume templates render a
// divider/record icon before each Education/Experience/Project entry that
// PDF text extraction turns into a bare pipe character. It marks entry
// boundaries, not description bullets, so it's tracked separately.
const ENTRY_DIVIDER_RE = /^\|\s*/
const ROLE_TITLE_RE =
  /\b(engineer|developer|designer|manager|analyst|specialist|consultant|architect|scientist|intern|director|lead|administrator|coordinator|technician|founder|strategist)\b/i
const ROLE_RE = /\b(developer|engineer|designer|lead|intern|contributor|author|maintainer|founder|architect)\b/i
const TECH_LABEL_RE = /technolog|tools?\s*\/|skills?\s*used|tech\s*stack/i
const EMPLOYMENT_HINT_RE = /^(remote|hybrid|on-?site|in-?office|internship|full-?time|part-?time|contract|freelance)$/i
const DEGREE_RE =
  /\b(bachelor|master|associate|diploma|ph\.?d|doctorate|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|b\.?sc|m\.?sc|bca|mca|mba|mfa|bfa|b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?|matriculation|intermediate|high school|secondary school|senior secondary|hsc|ssc|class\s?(?:x|xi|xii|10|12))\b/i
const SCHOOL_RE = /\b(university|college|institute|school|academy|polytechnic)\b/i
const SCORE_RE = /\b(?:cgpa|gpa|percentage|score)\b[^\n]{0,15}?[\d.]+\s*%?(?:\s*\/\s*[\d.]+)?|[\d.]+\s*%/i

const SECTION_PATTERNS = [
  { key: 'summary', re: /^(professional |career )?summary$|^profile$|^objective$|^about( me)?$/i },
  { key: 'experience', re: /^(work |professional )?experiences?$|^employment( history)?$/i },
  { key: 'education', re: /^educations?$|^academic background$/i },
  { key: 'projects', re: /^(personal |academic )?projects?$/i },
  { key: 'skills', re: /^(technical )?skills$|^core competencies$|^technologies$/i },
  { key: 'certifications', re: /^certifications?$|^licenses?( (and|&) certifications?)?$/i },
  { key: 'awards', re: /^awards?(\s*(and|&)\s*achievements?)?$|^achievements?$|^honou?rs?(\s*(and|&)\s*awards?)?$/i },
]

const trimOnly = (l) => l.trim()
const collapseSpaces = (l) => l.replace(/\s+/g, ' ').trim()
const cleanLine = collapseSpaces

const dedupe = (arr) => {
  const seen = new Set()
  return arr.filter((v) => {
    const key = v.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// Rejoin sentences/bullets that PDF text extraction broke across multiple
// lines. A line starting with a lowercase letter is virtually always the
// tail of a wrapped sentence, never a new name/title/date/heading — those
// never start lowercase in a resume — so it's a safe, low-risk merge signal.
function reconstructWrappedLines(rawLines) {
  const merged = []
  let buffer = null
  for (const raw of rawLines) {
    if (!raw) {
      if (buffer !== null) {
        merged.push(buffer)
        buffer = null
      }
      merged.push('')
      continue
    }
    const startsLower = /^[a-z]/.test(raw)
    if (buffer !== null && startsLower) {
      buffer = `${buffer} ${raw}`
    } else {
      if (buffer !== null) merged.push(buffer)
      buffer = raw
    }
  }
  if (buffer !== null) merged.push(buffer)
  return merged
}

// Lines are trimmed but NOT space-collapsed here — a few extractors below
// (contact block, education institution/location) rely on runs of 2+ spaces
// as a column separator that the source PDF's layout leaves behind.
const splitLines = (text) => reconstructWrappedLines((text || '').split(/\r?\n/).map(trimOnly))

function findSectionHeaders(lines) {
  const headers = []
  lines.forEach((line, i) => {
    const clean = collapseSpaces(line)
    if (!clean || clean.length > 40) return
    const match = SECTION_PATTERNS.find(({ re }) => re.test(clean))
    if (match) headers.push({ key: match.key, index: i })
  })
  return headers
}

function sliceSections(lines, headers) {
  const sections = {}
  headers.forEach((h, i) => {
    const end = i + 1 < headers.length ? headers[i + 1].index : lines.length
    const body = lines.slice(h.index + 1, end)
    sections[h.key] = (sections[h.key] || []).concat(body)
  })
  return sections
}

// Splits `lines` into entry groups, starting a new group each time a line
// matches `anchorRe`. With `stripAnchor`, the matched prefix (an entry
// divider/bullet) is removed from the line that starts the new group.
function splitOnRepeatedAnchor(lines, anchorRe, { allowFirstSplit = false, stripAnchor = false } = {}) {
  const groups = []
  let current = []
  for (const line of lines) {
    const isAnchor = anchorRe.test(line)
    const canSplit = current.length > 0 || allowFirstSplit
    if (isAnchor && canSplit) {
      if (current.length) groups.push(current)
      current = [stripAnchor ? line.replace(anchorRe, '').trim() : line]
    } else {
      current.push(line)
    }
  }
  if (current.length) groups.push(current)
  return groups
}

// Pulls description/responsibility lines out of an entry's body. If any line
// carries a bullet glyph, only bulleted lines count (that template marks
// every bullet explicitly); otherwise every remaining plain-sentence line is
// treated as a description line, since some templates use no glyph at all.
function collectDescriptionLines(bodyLines) {
  const hasBullets = bodyLines.some((l) => BULLET_RE.test(l))
  const source = hasBullets ? bodyLines.filter((l) => BULLET_RE.test(l)) : bodyLines
  return source.map((l) => collapseSpaces(l.replace(BULLET_RE, ''))).filter(Boolean)
}

function extractPersonal(contactLines, { linkedinQueue = [], githubQueue = [], portfolioQueue = [] } = {}) {
  const rawLines = contactLines.filter((l) => l.trim())
  const lines = rawLines.map(collapseSpaces)
  const blockText = lines.join(' ')

  const email = blockText.match(EMAIL_RE)?.[0] || ''
  const phone = lines.map((l) => l.match(PHONE_RE)?.[0]).find(Boolean) || ''

  // Some templates render "LinkedIn"/"GitHub"/"Portfolio" as a bare clickable
  // label with no visible URL text — the actual link still exists in the
  // file (as a hyperlink annotation), it's just not in the plain-text
  // stream. Only consume one from the queue when the label word is
  // genuinely present, so a project's repo link never gets misattributed.
  let linkedin = blockText.match(LINKEDIN_RE)?.[0] || ''
  if (!linkedin && /\blinkedin\b/i.test(blockText) && linkedinQueue.length) linkedin = linkedinQueue.shift()

  let github = blockText.match(GITHUB_RE)?.[0] || ''
  if (!github && /\bgithub\b/i.test(blockText) && githubQueue.length) github = githubQueue.shift()

  let portfolio = ''
  if (/\bportfolio\b/i.test(blockText) && portfolioQueue.length) portfolio = portfolioQueue.shift()

  let fullName = ''
  for (const line of lines) {
    if (EMAIL_RE.test(line) || LINKEDIN_RE.test(line) || GITHUB_RE.test(line) || PHONE_RE.test(line)) continue
    const words = line.split(/\s+/)
    if (words.length >= 2 && words.length <= 5 && line.length <= 60 && /^[A-Za-z.'-]+(\s[A-Za-z.'-]+)+$/.test(line)) {
      fullName = line
      break
    }
  }

  let title = ''
  if (fullName) {
    const nameIdx = lines.indexOf(fullName)
    const next = lines[nameIdx + 1]
    if (next && next.length <= 60 && ROLE_TITLE_RE.test(next)) title = next
  }

  // Location: prefer a column-separated trailing token on a contact line
  // (e.g. "+1 555…   email@x.com   LinkedIn   GitHub   Noida, India"), which
  // a resume's single-line contact bar commonly renders as; otherwise fall
  // back to a standalone "City, Region" line.
  let location = ''
  for (const raw of rawLines) {
    const parts = raw.split(/\s{2,}/).map((p) => p.trim()).filter(Boolean)
    const last = parts[parts.length - 1]
    if (last && last.length <= 50 && /,/.test(last) && !EMAIL_RE.test(last) && !PHONE_RE.test(last) && !URL_RE.test(last)) {
      location = last
      break
    }
  }
  if (!location) {
    for (const line of lines) {
      if (line === fullName || line === title) continue
      if (EMAIL_RE.test(line) || LINKEDIN_RE.test(line) || GITHUB_RE.test(line) || PHONE_RE.test(line)) continue
      if (line.length <= 50 && /^[A-Za-z][A-Za-z .'-]*,\s*[A-Za-z][A-Za-z .'-]*$/.test(line)) {
        location = line
        break
      }
    }
  }

  return { fullName, title, email, phone, location, linkedin, github, portfolio }
}

function extractSkills(sectionLines) {
  const items = []
  for (const raw of sectionLines) {
    if (!raw) continue
    const cleaned = collapseSpaces(raw).replace(BULLET_RE, '')
    const afterLabel = cleaned.includes(':') ? cleaned.split(':').slice(1).join(':') : cleaned
    afterLabel
      .split(/[,|•·]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && p.length <= 40)
      .forEach((p) => items.push(p))
  }
  return dedupe(items).slice(0, 40)
}

function extractListItems(sectionLines) {
  const items = []
  for (const raw of sectionLines) {
    if (!raw) continue
    const cleaned = collapseSpaces(raw).replace(BULLET_RE, '')
    cleaned
      .split(/\s*[•·]\s*/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && p.length <= 140)
      .forEach((p) => items.push(p))
  }
  return dedupe(items)
}

// ---- Education ----

function buildEducationEntry(clusterRaw) {
  const cluster = clusterRaw.filter((l) => l.trim())
  const collapsedCluster = cluster.map(collapseSpaces)
  const text = collapsedCluster.join(' ')

  const degreeIdx = collapsedCluster.findIndex((l) => DEGREE_RE.test(l))
  const degreeLine = degreeIdx >= 0 ? collapsedCluster[degreeIdx] : ''

  const universityIdx = collapsedCluster.findIndex((l, i) => i !== degreeIdx && SCHOOL_RE.test(l))
  let university = ''
  if (universityIdx >= 0) {
    // The institution line often has "Name   City, Country" laid out in
    // columns (runs of 2+ spaces) in the source PDF — split on that to
    // recover the location instead of losing it inside one long string.
    const parts = cluster[universityIdx].split(/\s{2,}/).map((p) => p.trim()).filter(Boolean)
    const last = parts[parts.length - 1]
    if (parts.length >= 2 && last && /,/.test(last) && last.length <= 40) {
      university = `${parts.slice(0, -1).join(' ')}, ${last}`
    } else {
      university = collapsedCluster[universityIdx]
    }
  }

  const years = text.match(new RegExp(YEAR_RE.source, 'g')) || []
  const scoreMatch = text.match(SCORE_RE)

  return {
    id: nextId('edu'),
    degree: degreeLine ? cleanLine(degreeLine) : '',
    university: university ? cleanLine(university) : '',
    year: years.length ? years[years.length - 1] : '',
    score: scoreMatch ? cleanLine(scoreMatch[0]) : '',
  }
}

function extractEducation(sectionLines) {
  const nonEmpty = sectionLines.filter((l) => l.trim())
  if (!nonEmpty.length) return []

  const hasDividers = nonEmpty.some((l) => ENTRY_DIVIDER_RE.test(l))
  let clusters
  if (hasDividers) {
    clusters = splitOnRepeatedAnchor(nonEmpty, ENTRY_DIVIDER_RE, { allowFirstSplit: true, stripAnchor: true })
  } else {
    const collapsed = nonEmpty.map(collapseSpaces)
    const fallbackAnchor = collapsed.some((l) => DEGREE_RE.test(l)) ? DEGREE_RE : SCHOOL_RE
    clusters = splitOnRepeatedAnchor(nonEmpty, fallbackAnchor)
  }

  return clusters.map(buildEducationEntry).filter((e) => e.degree || e.university)
}

// ---- Experience ----

function buildExperienceEntry(clusterRaw) {
  const cluster = clusterRaw.filter((l) => l.trim())
  const headerLine = collapseSpaces(cluster[0] || '')

  let title = headerLine
  let company = ''
  const pipeOrAt = headerLine.split(/\s*\|\s*|\s+at\s+/i).filter(Boolean)
  if (pipeOrAt.length >= 2) {
    title = cleanLine(pipeOrAt[0])
    company = cleanLine(pipeOrAt.slice(1).join(', '))
  } else {
    const commaParts = headerLine.split(/,\s*/)
    if (commaParts.length >= 2) {
      title = cleanLine(commaParts[0])
      company = cleanLine(commaParts.slice(1).join(', '))
    }
  }

  const rest = cluster.slice(1).map(collapseSpaces)
  const dateLine = rest.find((l) => DATE_RANGE_RE.test(l)) || ''
  const dates = dateLine ? dateLine.match(DATE_RANGE_RE) : null
  const companyLower = company.toLowerCase()

  let location = ''
  const bodyLines = rest.filter((l) => {
    if (l === dateLine) return false
    // Drop a line that just restates the company name already captured
    // from the header (a common template artifact — a duplicate caption).
    if (companyLower.length > 5 && l.length > 5) {
      const lLower = l.toLowerCase()
      if (lLower === companyLower || companyLower.startsWith(lLower)) return false
    }
    // A short standalone location/employment-type line (e.g. "Remote",
    // "Internship", "Bengaluru, India") belongs in its own field, not as a
    // description bullet.
    if (!location && !BULLET_RE.test(l) && (EMPLOYMENT_HINT_RE.test(l) || /^[A-Za-z][A-Za-z .'-]*,\s*[A-Za-z][A-Za-z .'-]*$/.test(l))) {
      location = l
      return false
    }
    return true
  })
  const responsibilities = collectDescriptionLines(bodyLines)

  return {
    id: nextId('exp'),
    title,
    company,
    startDate: dates ? cleanLine(dates[1]) : '',
    endDate: dates ? cleanLine(dates[2]) : '',
    location,
    responsibilities: responsibilities.join('\n'),
  }
}

function extractExperience(sectionLines) {
  const nonEmpty = sectionLines.filter((l) => l.trim())
  if (!nonEmpty.length) return []

  const hasDividers = nonEmpty.some((l) => ENTRY_DIVIDER_RE.test(l))
  if (hasDividers) {
    const clusters = splitOnRepeatedAnchor(nonEmpty, ENTRY_DIVIDER_RE, { allowFirstSplit: true, stripAnchor: true })
    return clusters.map(buildExperienceEntry).filter((e) => e.title || e.company)
  }

  // No divider glyph in this template: anchor each entry on its date-range
  // line and take the nearest preceding non-bullet line as its header.
  const dateIdxs = []
  nonEmpty.forEach((line, i) => {
    if (DATE_RANGE_RE.test(collapseSpaces(line))) dateIdxs.push(i)
  })
  if (!dateIdxs.length) return []

  const entries = []
  dateIdxs.forEach((dateIdx, e) => {
    const searchStart = e === 0 ? 0 : dateIdxs[e - 1] + 1
    const headerCandidates = nonEmpty
      .slice(searchStart, dateIdx)
      .filter((l) => !BULLET_RE.test(l) && !DATE_RANGE_RE.test(collapseSpaces(l)))
    const headerLine = headerCandidates[headerCandidates.length - 1]
    if (!headerLine) return

    const nextIdx = e + 1 < dateIdxs.length ? dateIdxs[e + 1] : nonEmpty.length
    const bodyLines = nonEmpty.slice(dateIdx + 1, nextIdx)
    entries.push(buildExperienceEntry([headerLine, nonEmpty[dateIdx], ...bodyLines]))
  })
  return entries.filter((e) => e.title || e.company)
}

// ---- Projects ----

const looksLikeTechLine = (line) => {
  if (BULLET_RE.test(line) || line.length > 90 || /[.!?]$/.test(line)) return false
  return (line.match(/,/g) || []).length >= 1
}

function splitProjectsByHeaderHeuristic(lines) {
  const clusters = []
  let current = null
  for (const line of lines) {
    const clean = collapseSpaces(line)
    const isHeaderCandidate = !BULLET_RE.test(line) && !URL_RE.test(clean) && !looksLikeTechLine(clean) && clean.length <= 80
    if (isHeaderCandidate) {
      if (current) clusters.push(current)
      current = [line]
    } else if (current) {
      current.push(line)
    }
  }
  if (current) clusters.push(current)
  return clusters
}

function buildProjectEntry(clusterRaw, { githubQueue = [] } = {}) {
  const cluster = clusterRaw.filter((l) => l.trim())
  const nameLine = collapseSpaces(cluster[0] || '')
  const hadGithubLabel = /\b(github|gitlab|bitbucket)\b/i.test(nameLine)
  // Strip a trailing bare hyperlink label (e.g. "Project Name   Github") that
  // PDF text extraction leaves behind when it can't recover the actual URL.
  const name = cleanLine(nameLine.replace(/\s+(github|gitlab|bitbucket|link|demo|live)\s*$/i, ''))

  let role = ''
  let date = ''
  let link = ''
  let techLine = ''
  const bodyLines = []

  for (const rawLine of cluster.slice(1)) {
    const clean = collapseSpaces(rawLine)
    if (!clean) continue
    if (!link && URL_RE.test(clean)) {
      link = clean.match(URL_RE)[0]
      continue
    }
    if (!techLine && TECH_LABEL_RE.test(clean)) {
      techLine = clean
      continue
    }
    if (!date && DATE_RANGE_RE.test(clean)) {
      date = clean.match(DATE_RANGE_RE)[0]
      continue
    }
    if (!date && SINGLE_DATE_RE.test(clean)) {
      date = clean
      continue
    }
    if (!role && clean.split(/\s+/).length <= 4 && ROLE_RE.test(clean)) {
      role = clean
      continue
    }
    bodyLines.push(rawLine)
  }

  const technologies = techLine
    ? techLine
        .split(':')
        .slice(1)
        .join(':')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  // A bare "Github" label with no recoverable URL in the text means the real
  // link exists only as a hyperlink annotation — consume the next one in
  // document order, which lines up 1:1 with each project's repo link.
  if (!link && hadGithubLabel && githubQueue.length) link = githubQueue.shift()

  // `role` (detected above) only exists in the app's project shape as far as
  // keeping it out of the description bullets — there's no dedicated field
  // for it, so it's dropped rather than silently prefixed onto real text.
  const descriptionLines = collectDescriptionLines(bodyLines)

  return {
    id: nextId('proj'),
    name,
    date,
    tech: technologies.join(', '),
    description: descriptionLines.join('\n'),
    link,
  }
}

function extractProjects(sectionLines, ctx) {
  const nonEmpty = sectionLines.filter((l) => l.trim())
  if (!nonEmpty.length) return []

  const hasDividers = nonEmpty.some((l) => ENTRY_DIVIDER_RE.test(l))
  const clusters = hasDividers
    ? splitOnRepeatedAnchor(nonEmpty, ENTRY_DIVIDER_RE, { allowFirstSplit: true, stripAnchor: true })
    : splitProjectsByHeaderHeuristic(nonEmpty)

  return clusters.map((c) => buildProjectEntry(c, ctx)).filter((p) => p.name)
}

/**
 * Map raw extracted resume text onto the app's candidate shape. Only fields
 * matched with reasonable confidence are filled in — everything else is left
 * blank for the user to complete themselves. `links` are real hyperlink URLs
 * recovered from the file (see extractTextFromFile) for templates that only
 * show a bare "LinkedIn"/"GitHub" label in the text itself.
 */
export function parseResumeText(rawText, links = []) {
  const lines = splitLines(rawText || '')
  const headers = findSectionHeaders(lines)
  const sections = sliceSections(lines, headers)
  const headerBlockEnd = headers.length ? headers[0].index : Math.min(lines.length, 10)
  const contactLines = lines.slice(0, headerBlockEnd)

  // Queues are consumed in document order: profile links (contact block)
  // come first, then each project's own repo link — shift() on the same
  // array threads that order through extractPersonal and extractProjects.
  const linkedinQueue = links.filter((u) => /linkedin\.com/i.test(u))
  const githubQueue = links.filter((u) => /github\.com/i.test(u))
  const portfolioQueue = links.filter((u) => !/linkedin\.com|github\.com/i.test(u) && !/^(mailto|tel):/i.test(u))

  const candidate = createEmptyCandidate()
  const personal = extractPersonal(contactLines, { linkedinQueue, githubQueue, portfolioQueue })
  candidate.personal = { ...candidate.personal, ...personal }

  let summary = sections.summary ? sections.summary.filter(Boolean).map(collapseSpaces).join(' ').trim() : ''
  if (!summary) {
    // Some templates put an unlabeled intro paragraph right under the name
    // instead of a "Summary" heading — the longest non-contact line in that
    // block is almost always it.
    const longLine = contactLines
      .filter((l) => l.trim() && collapseSpaces(l) !== personal.fullName)
      .map(collapseSpaces)
      .find((l) => l.length > 80 && !EMAIL_RE.test(l) && !PHONE_RE.test(l))
    if (longLine) summary = longLine
  }
  candidate.summary = summary

  if (!candidate.personal.title && summary) {
    // An unlabeled summary commonly opens with the person's own role, e.g.
    // "Full-Stack Developer with hands-on experience…" — lift that leading
    // phrase into Title too without touching the summary text itself.
    const lead = summary.match(/^([A-Za-z][A-Za-z\s/&-]{2,40}?)(?:\s+with\s|\s+who\s|,|\.|\s+—)/)
    if (lead && ROLE_TITLE_RE.test(lead[1])) {
      candidate.personal.title = cleanLine(lead[1])
    }
  }

  candidate.skills = sections.skills ? extractSkills(sections.skills) : []
  candidate.certifications = sections.certifications ? extractListItems(sections.certifications) : []
  candidate.achievements = sections.awards ? extractListItems(sections.awards) : []
  candidate.education = sections.education ? extractEducation(sections.education) : []
  candidate.experience = sections.experience ? extractExperience(sections.experience) : []
  candidate.projects = sections.projects ? extractProjects(sections.projects, { githubQueue }) : []
  return candidate
}

/** True when parsing found essentially nothing usable — the caller should
 * tell the user to fill the form in manually rather than claim success. */
export function isCandidateEffectivelyEmpty(candidate) {
  return (
    !candidate.personal.fullName.trim() &&
    !candidate.personal.email.trim() &&
    candidate.education.length === 0 &&
    candidate.experience.length === 0 &&
    candidate.projects.length === 0 &&
    candidate.skills.length === 0
  )
}
