// Mock AI / ATS service layer.
// Swap the internals of these two functions for real LLM API calls later —
// the function signatures and return shapes are the contract the UI depends on.
//
// Keyword extraction is two-phase: a curated vocabulary of known
// technologies/frameworks/databases/cloud/AI terms and role-requirement
// phrases is matched first, then a generic extractor pulls any other
// capitalized/technical-looking term straight out of the pasted text (so a
// completely different job description still produces real, different
// keywords instead of silently falling back to nothing).

const KEYWORD_LIBRARY = [
  // Languages
  { label: 'Java', pattern: /\bjava\b/i },
  { label: 'Python', pattern: /\bpython\b/i },
  { label: 'JavaScript', pattern: /\bjavascript\b/i },
  { label: 'TypeScript', pattern: /\btypescript\b/i },
  { label: 'C++', pattern: /\bc\+\+/i },
  { label: 'C#', pattern: /\bc#/i },
  { label: 'Go', pattern: /\bgolang\b/i },
  { label: 'Kotlin', pattern: /\bkotlin\b/i },
  { label: 'Swift', pattern: /\bswift\b/i },
  { label: 'Ruby', pattern: /\bruby\b/i },
  { label: 'PHP', pattern: /\bphp\b/i },
  { label: 'Rust', pattern: /\brust\b/i },
  { label: 'Scala', pattern: /\bscala\b/i },

  // Frontend
  { label: 'React', pattern: /\breact(?:\.js)?\b/i },
  { label: 'Angular', pattern: /\bangular\b/i },
  { label: 'Vue', pattern: /\bvue(?:\.js)?\b/i },
  { label: 'Next.js', pattern: /\bnext\.js\b|\bnextjs\b/i },
  { label: 'Redux', pattern: /\bredux\b/i },
  { label: 'HTML', pattern: /\bhtml5?\b/i },
  { label: 'CSS', pattern: /\bcss3?\b/i },
  { label: 'Tailwind CSS', pattern: /\btailwind(?:\s*css)?\b/i },
  { label: 'Svelte', pattern: /\bsvelte\b/i },

  // Backend / frameworks
  { label: 'Spring Boot', pattern: /\bspring\s*boot\b/i },
  { label: 'Node.js', pattern: /\bnode(?:\.js)?\b/i },
  { label: 'Express', pattern: /\bexpress(?:\.js)?\b/i },
  { label: 'Django', pattern: /\bdjango\b/i },
  { label: 'Flask', pattern: /\bflask\b/i },
  { label: 'FastAPI', pattern: /\bfastapi\b/i },
  { label: 'ASP.NET', pattern: /\basp\.net\b/i },
  { label: 'Laravel', pattern: /\blaravel\b/i },
  { label: 'Ruby on Rails', pattern: /\brails\b/i },

  // Databases
  { label: 'PostgreSQL', pattern: /\bpostgres(?:ql)?\b/i },
  { label: 'MySQL', pattern: /\bmysql\b/i },
  { label: 'MongoDB', pattern: /\bmongo\s*db\b/i },
  { label: 'SQL', pattern: /\bsql\b/i },
  { label: 'NoSQL', pattern: /\bnosql\b/i },
  { label: 'Redis', pattern: /\bredis\b/i },
  { label: 'Cassandra', pattern: /\bcassandra\b/i },
  { label: 'DynamoDB', pattern: /\bdynamo\s*db\b/i },
  { label: 'Oracle', pattern: /\boracle\b/i },
  { label: 'SQLite', pattern: /\bsqlite\b/i },
  { label: 'Elasticsearch', pattern: /\belastic\s*search\b/i },

  // Cloud & DevOps
  { label: 'AWS', pattern: /\baws\b/i },
  { label: 'Azure', pattern: /\bazure\b/i },
  { label: 'GCP', pattern: /\bgcp\b|google cloud/i },
  { label: 'Docker', pattern: /\bdocker\b/i },
  { label: 'Kubernetes', pattern: /\bkubernetes\b|\bk8s\b/i },
  { label: 'Terraform', pattern: /\bterraform\b/i },
  { label: 'Jenkins', pattern: /\bjenkins\b/i },
  { label: 'CI/CD', pattern: /\bci\/cd\b|continuous integration/i },
  { label: 'Git', pattern: /\bgit\b/i },
  { label: 'GitHub Actions', pattern: /\bgithub actions\b/i },
  { label: 'Ansible', pattern: /\bansible\b/i },
  { label: 'Microservices', pattern: /\bmicroservices?\b/i },
  { label: 'Serverless', pattern: /\bserverless\b/i },
  { label: 'Cloud Deployment', pattern: /\bcloud[\s-]*(?:deployment|deployments|hosting|infrastructure)\b/i },

  // AI / LLM
  { label: 'AI', pattern: /\bartificial intelligence\b|\bai\b/i },
  { label: 'Machine Learning', pattern: /\bmachine learning\b|\bml\b/i },
  { label: 'Deep Learning', pattern: /\bdeep learning\b/i },
  { label: 'NLP', pattern: /\bnlp\b|natural language processing/i },
  { label: 'LLM', pattern: /\bllms?\b|large language models?/i },
  { label: 'GPT', pattern: /\bgpt(?:-?\d)?\b/i },
  { label: 'OpenAI', pattern: /\bopen\s*ai\b/i },
  { label: 'Generative AI', pattern: /\bgenerative ai\b/i },
  { label: 'Prompt Engineering', pattern: /\bprompt engineering\b/i },
  { label: 'Vector Database', pattern: /\bvector (?:database|store|db)\b/i },
  { label: 'TensorFlow', pattern: /\btensorflow\b/i },
  { label: 'PyTorch', pattern: /\bpytorch\b/i },
  { label: 'Hugging Face', pattern: /\bhugging\s*face\b/i },

  // Methodology / role requirements
  { label: 'Agile', pattern: /\bagile\b/i },
  { label: 'Scrum', pattern: /\bscrum\b/i },
  { label: 'REST API', pattern: /\brest(?:ful)?\s*api/i },
  { label: 'GraphQL', pattern: /\bgraphql\b/i },
  { label: 'System Design', pattern: /\bsystem design\b/i },
  { label: 'Unit Testing', pattern: /\bunit test(?:ing)?\b|\bjunit\b/i },
  { label: 'Code Review', pattern: /\bcode review/i },
  { label: 'Problem Solving', pattern: /\bproblem[\s-]solving\b/i },
  { label: 'Scalable Web Applications', pattern: /\bscalable\s+web\s+applications?\b/i },
  { label: 'Communication Skills', pattern: /\bcommunication\s+skills\b/i },
  { label: 'Team Collaboration', pattern: /\bteam\s+collaboration\b/i },
  { label: 'Cross-functional Collaboration', pattern: /\bcross[\s-]functional\b/i },
  { label: 'Data Structures', pattern: /\bdata structures?\b/i },
  { label: 'Algorithms', pattern: /\balgorithms?\b/i },
  { label: 'Performance Optimization', pattern: /\bperformance optimization\b/i },
  { label: 'Kafka', pattern: /\bkafka\b/i },
  { label: 'Jira', pattern: /\bjira\b/i },
  { label: 'Figma', pattern: /\bfigma\b/i },
]

// Words that should never be treated as a "keyword" on their own — generic
// English + resume/job-post boilerplate. Lower-cased for comparison.
const IGNORE_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'of', 'to', 'in', 'on', 'at', 'for', 'with',
  'without', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'will', 'would', 'shall',
  'should', 'can', 'could', 'may', 'might', 'must', 'do', 'does', 'did', 'not', 'no', 'yes', 'you', 'your',
  'yours', 'we', 'our', 'ours', 'they', 'their', 'them', 'he', 'she', 'his', 'her', 'it', 'its', 'this',
  'that', 'these', 'those', 'who', 'whom', 'which', 'what', 'where', 'when', 'why', 'how', 'all', 'any',
  'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'about', 'into', 'over', 'under', 'again', 'once', 'here', 'there', 'up', 'down', 'out',
  'off', 'above', 'below', 'between', 'through', 'during', 'before', 'after', 'while',
  'experience', 'experienced', 'candidate', 'candidates', 'skill', 'skills', 'requirement', 'requirements',
  'responsibility', 'responsibilities', 'qualification', 'qualifications', 'role', 'roles', 'team', 'teams',
  'company', 'companies', 'join', 'joining', 'position', 'positions', 'about', 'benefits', 'location',
  'salary', 'job', 'jobs', 'description', 'overview', 'summary', 'duties',
  'strong', 'excellent', 'proven', 'working', 'familiarity', 'familiar', 'exposure', 'knowledge', 'ability',
  'abilities', 'proficiency', 'proficient', 'years', 'year', 'plus', 'preferred', 'required', 'require',
  'requires', 'looking', 'seeking', 'seek', 'growing', 'including', 'include', 'includes', 'new', 'high',
  'low', 'level', 'end', 'multiple', 'various', 'ensure', 'ensuring', 'provide', 'providing', 'support',
  'supporting', 'across', 'within', 'related', 'relevant', 'good', 'great', 'best', 'practice', 'practices',
  'design', 'designs', 'designing', 'develop', 'developing', 'build', 'building', 'deploy', 'deploying',
  'manage', 'managing', 'integrate', 'integrating', 'write', 'written', 'participate', 'participation',
  'collaborate', 'collaborating', 'collaboration', 'communicate', 'communicating', 'apply', 'applying',
  'lead', 'leading', 'own', 'owning', 'drive', 'driving', 'partner', 'partnering', 'contribute',
  'contributing', 'create', 'creating', 'maintain', 'maintaining', 'implement', 'implementing', 'utilize',
  'utilizing', 'leverage', 'leveraging', 'demonstrate', 'demonstrating', 'coordinate', 'coordinating',
  'facilitate', 'facilitating', 'perform', 'performing', 'deliver', 'delivering', 'execute', 'executing',
  'improve', 'improving', 'optimize', 'optimizing', 'troubleshoot', 'troubleshooting', 'debug', 'debugging',
  'test', 'testing', 'tested', 'review', 'reviewing', 'mentor', 'mentoring', 'guide', 'guiding', 'train',
  'training', 'help', 'helping', 'work', 'works', 'hands', 'comfort', 'comfortable', 'interest', 'interested',
  'full', 'stack', 'developer', 'engineer', 'software', 'senior', 'junior', 'lead', 'principal', 'manager',
  'specialist', 'analyst', 'consultant', 'intern', 'internship', 'core', 'product', 'products', 'third',
  'party', 'data', 'science', 'scientist', 'clean', 'maintainable', 'system', 'systems', 'using', 'use',
  'used', 'uses', 'well', 'concept', 'concepts', 'track', 'record', 'shipping', 'ship', 'platform',
  'hand', 'hands',
])

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Cheap suffix strip so "APIs"/"applications" line up with the dictionary
// words "api"/"application" they belong to — avoids double-counting plurals.
const stem = (word) => (word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word)

const tokenize = (text) => text.match(/[A-Za-z][A-Za-z0-9+#.]*/g) || []

// Anything left after the dictionary pass that still looks like a real
// technology/proper-noun term: an acronym, a Capitalized word, or a token
// with tech-flavored punctuation/digits (Node.js, C++, GPT-4, etc).
const looksMeaningful = (token) => {
  if (/^[A-Z]{2,6}$/.test(token)) return true
  if (/^[A-Z][a-zA-Z0-9]*$/.test(token)) return true
  if (/[+#]/.test(token) || /\.[a-zA-Z]/.test(token)) return true
  if (/\d/.test(token)) return true
  return false
}

const extractDynamicTerms = (text, consumedWords) => {
  const seen = new Set()
  const results = []
  for (const raw of tokenize(text)) {
    const token = raw.replace(/\.+$/, '')
    if (token.length < 3) continue
    const rawLower = token.toLowerCase()
    const lower = stem(rawLower)
    if (IGNORE_WORDS.has(rawLower) || IGNORE_WORDS.has(lower)) continue
    if (consumedWords.has(lower) || consumedWords.has(rawLower) || seen.has(lower)) continue
    if (!looksMeaningful(token)) continue
    seen.add(lower)
    results.push(token)
    if (results.length >= 10) break
  }
  return results
}

/**
 * Extract meaningful keyword entries { label, pattern } directly from a
 * block of text — dictionary terms first (technologies, frameworks,
 * databases, cloud platforms, AI/LLM terms, role-requirement phrases),
 * then any other capitalized/technical-looking term the dictionary missed.
 */
const extractKeywordEntries = (text = '') => {
  const entries = []
  const seenLabels = new Set()
  const consumedWords = new Set()

  for (const { label, pattern } of KEYWORD_LIBRARY) {
    if (!pattern.test(text)) continue
    const key = label.toLowerCase()
    if (!seenLabels.has(key)) {
      seenLabels.add(key)
      entries.push({ label, pattern })
    }
    label
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter(Boolean)
      .forEach((word) => consumedWords.add(stem(word)))
  }

  for (const token of extractDynamicTerms(text, consumedWords)) {
    const key = stem(token.toLowerCase())
    if (seenLabels.has(key)) continue
    seenLabels.add(key)
    entries.push({ label: token, pattern: new RegExp(`\\b${escapeRegExp(token)}\\b`, 'i') })
  }

  return entries.slice(0, 24)
}

const candidateText = (candidate) => {
  const exp = candidate.experience.map((e) => `${e.title} ${e.company} ${e.responsibilities}`).join(' ')
  const proj = candidate.projects.map((p) => `${p.name} ${p.tech} ${p.description}`).join(' ')
  const edu = candidate.education.map((e) => `${e.degree} ${e.university}`).join(' ')
  return [
    candidate.personal?.title || '',
    candidate.summary,
    exp,
    proj,
    edu,
    candidate.skills.join(' '),
    candidate.certifications.join(' '),
    (candidate.achievements || []).join(' '),
  ].join(' ')
}

/**
 * Analyze how well a candidate matches a target job description.
 * Keywords are extracted live from the actual job description and compared
 * against the actual resume text — never invents or assumes candidate skills.
 */
export function analyzeJobMatch(candidate, jobDescription) {
  const resumeText = candidateText(candidate)
  const jdEntries = extractKeywordEntries(jobDescription)

  const matched = []
  const missing = []
  for (const { label, pattern } of jdEntries) {
    if (pattern.test(resumeText)) matched.push(label)
    else missing.push(label)
  }

  const total = jdEntries.length
  const score = total > 0 ? Math.round((matched.length / total) * 100) : 0

  const hasSummary = candidate.summary.trim().length > 40
  const hasExperience = candidate.experience.length > 0
  const hasProjects = candidate.projects.length > 0
  const hasSkills = candidate.skills.length >= 5

  const suggestions = []
  if (total === 0) {
    suggestions.push('Paste a more detailed job description with specific skills and requirements to get an ATS match.')
  } else if (missing.length > 0) {
    suggestions.push(`Add relevant keywords where truthful: ${missing.slice(0, 4).join(', ')}`)
  }
  if (candidate.summary.trim().length < 180) {
    suggestions.push('Strengthen your professional summary with specific, quantifiable achievements.')
  }
  const shortProjects = candidate.projects.filter((p) => p.description.trim().length < 80)
  if (shortProjects.length > 0) {
    suggestions.push('Expand project descriptions with measurable outcomes and impact.')
  }
  if (!hasSkills) {
    suggestions.push('List at least 5-8 relevant skills to improve ATS keyword coverage.')
  }
  if (suggestions.length === 0) {
    suggestions.push('Great alignment! Consider adding metrics to further strengthen your experience bullets.')
  }

  return {
    score,
    matched,
    missing,
    suggestions: suggestions.slice(0, 3),
    checks: {
      keywordMatch: matched.length > 0,
      skillsAlignment: hasSkills,
      sectionStructure: hasSummary && (hasExperience || hasProjects),
      atsFormatting: true,
    },
    analyzedAt: new Date().toISOString(),
  }
}

/**
 * Produce an ATS-optimized resume from the candidate's own truthful data.
 * Reorders skills so keywords relevant to the target role surface first —
 * it never adds a skill or claim the candidate didn't already provide.
 */
export function generateResume(candidate, jobDescription) {
  const analysis = analyzeJobMatch(candidate, jobDescription)
  const matchedSet = new Set(analysis.matched.map((k) => k.toLowerCase()))

  const orderedSkills = [...candidate.skills].sort((a, b) => {
    const aMatch = [...matchedSet].some((k) => a.toLowerCase().includes(k.toLowerCase())) ? 0 : 1
    const bMatch = [...matchedSet].some((k) => b.toLowerCase().includes(k.toLowerCase())) ? 0 : 1
    return aMatch - bMatch
  })

  return {
    resume: { ...candidate, skills: orderedSkills },
    analysis,
    generatedAt: new Date().toISOString(),
  }
}

export const GENERATION_STEPS = [
  'Analyzing candidate information',
  'Optimizing content',
  'Matching job keywords',
  'Preparing ATS-friendly format',
]

// ---------------------------------------------------------------------------
// Resume Quality Analyzer — deterministic, local scoring across six
// categories (ATS Compatibility, Keyword Optimization, Content Quality,
// Formatting, Impact & Achievements, Readability). Reuses analyzeJobMatch()
// and the keyword extractor above; never invents metrics or skills the
// candidate didn't already provide.

const STRONG_ACTION_VERBS = new Set([
  'built', 'build', 'developed', 'designed', 'implemented', 'led', 'managed', 'created', 'improved',
  'reduced', 'increased', 'optimized', 'launched', 'architected', 'automated', 'streamlined', 'delivered',
  'collaborated', 'mentored', 'spearheaded', 'established', 'integrated', 'deployed', 'engineered',
  'analyzed', 'resolved', 'migrated', 'refactored', 'scaled', 'achieved', 'drove', 'initiated',
  'coordinated', 'executed', 'enhanced', 'accelerated', 'pioneered', 'trained', 'presented', 'authored',
  'shipped', 'grew', 'cut', 'saved', 'redesigned', 'modernized', 'orchestrated', 'strengthened',
  'standardized', 'simplified', 'wrote', 'devised',
])

const clampScore = (n) => Math.max(0, Math.min(100, Math.round(n)))

const average = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0)

const getBullets = (candidate) => {
  const experience = candidate.experience.flatMap((e) =>
    (e.responsibilities || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  )
  const projects = candidate.projects.flatMap((p) =>
    (p.description || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  )
  return { experience, projects, all: [...experience, ...projects] }
}

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0)

const startsWithActionVerb = (bullet) => {
  const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '')
  return STRONG_ACTION_VERBS.has(firstWord)
}

const hasMeasurableResult = (bullet) => /\d/.test(bullet)

function scoreAtsCompatibility(candidate) {
  const checks = [
    Boolean(candidate.personal.fullName.trim()),
    Boolean(candidate.personal.email.trim()),
    Boolean(candidate.personal.phone.trim() || candidate.personal.location.trim()),
    candidate.summary.trim().length > 0,
    candidate.experience.length > 0 || candidate.education.length > 0,
    candidate.skills.length > 0,
    candidate.experience.every((e) => Boolean(e.startDate?.trim())) &&
      candidate.education.every((e) => Boolean(e.year?.trim())),
  ]
  const score = clampScore((checks.filter(Boolean).length / checks.length) * 100)
  return { score, checks }
}

function scoreKeywordOptimization(candidate, jobDescription) {
  const trimmedJd = (jobDescription || '').trim()
  if (trimmedJd) {
    const jdAnalysis = analyzeJobMatch(candidate, jobDescription)
    return { score: jdAnalysis.score, missing: jdAnalysis.missing, usedJobDescription: true }
  }
  const resumeKeywords = extractKeywordEntries(candidateText(candidate))
  const score = clampScore((resumeKeywords.length / 12) * 100)
  return { score, missing: [], usedJobDescription: false, keywordCount: resumeKeywords.length }
}

function scoreContentQuality(candidate) {
  const { all: bullets } = getBullets(candidate)
  const summaryLen = candidate.summary.trim().length
  const summaryScore = summaryLen === 0 ? 0 : clampScore(Math.min(100, (summaryLen / 200) * 100))

  const actionVerbRatio = bullets.length ? average(bullets.map((b) => (startsWithActionVerb(b) ? 100 : 0))) : 0
  const substanceRatio = bullets.length
    ? average(bullets.map((b) => (b.length >= 40 ? 100 : (b.length / 40) * 100)))
    : 0

  const lowerBullets = bullets.map((b) => b.toLowerCase())
  const duplicateCount = lowerBullets.length - new Set(lowerBullets).size
  const weakBullets = bullets.filter((b) => !startsWithActionVerb(b) || b.length < 40)

  let score = clampScore(average([summaryScore, actionVerbRatio, substanceRatio]))
  if (duplicateCount > 0) score = clampScore(score - duplicateCount * 8)
  if (bullets.length === 0) score = clampScore(score * 0.4)

  return { score, weakBulletCount: weakBullets.length, duplicateCount, hasSummary: summaryLen > 0 }
}

function scoreFormatting(candidate) {
  const { all: bullets } = getBullets(candidate)
  const expDateOk = candidate.experience.length
    ? average(candidate.experience.map((e) => (e.startDate?.trim() && e.endDate?.trim() ? 100 : 0)))
    : 100
  const eduYearOk = candidate.education.length
    ? average(candidate.education.map((e) => (e.year?.trim() ? 100 : 0)))
    : 100
  const bulletLengthOk = bullets.length ? average(bullets.map((b) => (b.length <= 220 ? 100 : 0))) : 100
  const emailTrim = candidate.personal.email.trim()
  const contactFormatOk = !emailTrim || /\S+@\S+\.\S+/.test(emailTrim) ? 100 : 0

  let score = clampScore(average([expDateOk, eduYearOk, bulletLengthOk, contactFormatOk]))
  const hasAnyStructuredContent = candidate.experience.length > 0 || candidate.education.length > 0
  if (!hasAnyStructuredContent) score = clampScore(score * 0.3)

  const inconsistentDates = candidate.experience.filter((e) => !(e.startDate?.trim() && e.endDate?.trim())).length
  const longBullets = bullets.filter((b) => b.length > 220).length
  return { score, inconsistentDates, longBullets }
}

function scoreImpact(candidate) {
  const { all: bullets } = getBullets(candidate)
  if (bullets.length === 0) return { score: 0, measurableCount: 0, totalBullets: 0 }
  const measurableCount = bullets.filter(hasMeasurableResult).length
  const score = clampScore((measurableCount / bullets.length) * 100)
  return { score, measurableCount, totalBullets: bullets.length }
}

function scoreReadability(candidate) {
  const { all: bullets } = getBullets(candidate)
  const bulletLengthScore = bullets.length
    ? average(
        bullets.map((b) => {
          const words = countWords(b)
          if (words >= 6 && words <= 28) return 100
          if (words < 6) return (words / 6) * 100
          return Math.max(0, 100 - (words - 28) * 4)
        })
      )
    : 0

  const startWords = bullets.map((b) => b.trim().split(/\s+/)[0]?.toLowerCase())
  const varietyScore = bullets.length ? clampScore((new Set(startWords).size / bullets.length) * 100) : 0

  const summaryTrim = candidate.summary.trim()
  const summarySentences = summaryTrim.split(/(?<=[.!?])\s+/).filter(Boolean)
  const summaryScore = summarySentences.length
    ? average(summarySentences.map((s) => (countWords(s) <= 30 ? 100 : 60)))
    : 0

  const parts = []
  if (bullets.length) parts.push(bulletLengthScore, varietyScore)
  if (summaryTrim) parts.push(summaryScore)
  const score = parts.length ? clampScore(average(parts)) : 0

  return { score, totalBullets: bullets.length }
}

const QUALITY_CATEGORY_DEFS = [
  { key: 'atsCompatibility', label: 'ATS Compatibility' },
  { key: 'keywordOptimization', label: 'Keyword Optimization' },
  { key: 'contentQuality', label: 'Content Quality' },
  { key: 'formatting', label: 'Formatting' },
  { key: 'impact', label: 'Impact & Achievements' },
  { key: 'readability', label: 'Readability' },
]

/**
 * Score the candidate's resume across six deterministic quality dimensions.
 * Distinct from analyzeJobMatch()'s ATS Score: this recalculates live from
 * the current form data (not just on Analyze/Generate) and, when no job
 * description is present, falls back to judging the resume on its own
 * merits instead of against a target role.
 */
export function analyzeResumeQuality(candidate, jobDescription = '') {
  const ats = scoreAtsCompatibility(candidate)
  const keyword = scoreKeywordOptimization(candidate, jobDescription)
  const content = scoreContentQuality(candidate)
  const formatting = scoreFormatting(candidate)
  const impact = scoreImpact(candidate)
  const readability = scoreReadability(candidate)

  const scores = {
    atsCompatibility: ats.score,
    keywordOptimization: keyword.score,
    contentQuality: content.score,
    formatting: formatting.score,
    impact: impact.score,
    readability: readability.score,
  }
  const overallScore = clampScore(average(Object.values(scores)))

  const improvements = []
  const strengths = []

  if (!candidate.personal.fullName.trim() || !candidate.personal.email.trim()) {
    improvements.push('Add your full name and email so ATS systems can parse your contact details.')
  } else {
    strengths.push('Contact information is complete')
  }

  if (candidate.experience.length === 0 && candidate.education.length === 0) {
    improvements.push('Add at least one Experience or Education entry — ATS systems expect these sections.')
  } else if (ats.checks[3] && ats.checks[5]) {
    strengths.push('Resume has good section structure')
  }

  if (keyword.usedJobDescription && keyword.missing.length > 0) {
    improvements.push(`Add relevant technical keywords where truthful: ${keyword.missing.slice(0, 4).join(', ')}`)
  } else if (!keyword.usedJobDescription && keyword.score < 60) {
    improvements.push('Add more specific technical skills and tools you have used — few distinct keywords were detected.')
  } else if (keyword.score >= 80) {
    strengths.push(
      keyword.usedJobDescription ? 'Strong keyword alignment with the target job description' : 'Good technical keyword coverage'
    )
  }

  if (content.weakBulletCount > 0) {
    improvements.push(
      `Improve ${content.weakBulletCount} experience/project bullet point${content.weakBulletCount > 1 ? 's' : ''} with more specific detail.`
    )
  }
  if (content.duplicateCount > 0) {
    improvements.push('Remove duplicate or repeated bullet points.')
  }
  if (!content.hasSummary) {
    improvements.push('Add a professional summary describing your experience and strengths.')
  }

  if (formatting.inconsistentDates > 0) {
    improvements.push('Fill in missing start/end dates so experience entries are consistent.')
  }
  if (formatting.longBullets > 0) {
    improvements.push('Shorten overly long bullet points for easier scanning.')
  }
  if (formatting.score >= 90) {
    strengths.push('Formatting is ATS-friendly')
  }

  if (impact.totalBullets === 0) {
    improvements.push('Add experience or project bullet points describing your work.')
  } else if (impact.measurableCount / impact.totalBullets < 0.5) {
    improvements.push('Add more measurable achievements (numbers, percentages, or scale) to your bullet points.')
  } else {
    strengths.push('Good use of measurable achievements')
  }

  if (readability.totalBullets > 0 && readability.score < 70) {
    improvements.push('Simplify long or repetitive sentences so bullet points are easier to scan.')
  } else if (readability.score >= 85) {
    strengths.push('Bullet points are concise and easy to scan')
  }

  return {
    overallScore,
    categories: QUALITY_CATEGORY_DEFS.map((c) => ({ ...c, score: scores[c.key] })),
    improvements: improvements.slice(0, 5),
    strengths: strengths.slice(0, 5),
    analyzedAt: new Date().toISOString(),
  }
}
