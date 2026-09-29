// Groups a user's own flat skills list into standard resume categories for
// display purposes only — the underlying data stays a flat string[] (so the
// manual editor, ATS engine, and parser are all untouched). Every skill here
// is the user's own; nothing is invented, and a skill that doesn't clearly
// fit anywhere lands in "Other Technologies" rather than a wrong bucket.

const CATEGORY_DEFS = [
  {
    label: 'Databases',
    terms: [
      'mongodb', 'postgresql', 'postgres', 'mysql', 'sql server', 'sql', 'nosql', 'redis', 'sqlite',
      'oracle', 'cassandra', 'dynamodb', 'elasticsearch', 'mariadb', 'firebase', 'firestore', 'couchdb', 'neo4j',
    ],
  },
  {
    label: 'Frameworks & Libraries',
    terms: [
      'react', 'react.js', 'angular', 'vue', 'vue.js', 'next.js', 'nextjs', 'redux', 'spring boot',
      'spring cloud', 'spring framework', 'spring', 'django', 'flask', 'fastapi', 'express.js', 'express',
      'node.js', 'nodejs', 'laravel', 'ruby on rails', 'rails', 'asp.net', '.net', 'tailwind css', 'tailwind',
      'bootstrap', 'jquery', 'svelte', 'nestjs', 'nest.js',
    ],
  },
  {
    label: 'Programming Languages',
    terms: [
      'java', 'python', 'javascript', 'typescript', 'c++', 'c#', 'c', 'go', 'golang', 'kotlin', 'swift',
      'ruby', 'php', 'rust', 'scala', 'r', 'dart', 'matlab', 'perl', 'objective-c',
    ],
  },
  {
    label: 'Core CS Fundamentals',
    terms: [
      'data structures & algorithms', 'data structures and algorithms', 'data structures', 'algorithms', 'dsa',
      'object-oriented programming', 'oops', 'oop', 'dbms', 'operating systems', 'computer networks',
      'system design', 'discrete mathematics', 'compiler design', 'computer architecture',
    ],
  },
  {
    label: 'Tools & Platforms',
    terms: [
      'git', 'github', 'gitlab', 'bitbucket', 'vs code', 'visual studio code', 'intellij', 'intellij idea',
      'eclipse', 'postman', 'docker', 'kubernetes', 'k8s', 'linux', 'aws', 'azure', 'gcp', 'google cloud',
      'jenkins', 'ci/cd', 'terraform', 'ansible', 'jira', 'figma', 'render', 'vercel', 'netlify', 'heroku',
      'mongodb atlas', 'webpack', 'npm', 'yarn',
    ],
  },
  {
    label: 'Backend Technologies',
    terms: [
      'rest api', 'rest apis', 'restful api', 'restful apis', 'graphql', 'microservices architecture',
      'microservices', 'jwt', 'oauth2', 'oauth', 'keycloak', 'agentic ai', 'rabbitmq', 'kafka', 'grpc',
      'websocket', 'soap', 'api gateway',
    ],
  },
]

/**
 * Buckets `skills` (the flat string array a user typed or that was
 * extracted from their resume) into the standard categories above. Only
 * categories with at least one matched skill are returned, in a fixed
 * order, with any unmatched skills grouped under "Other Technologies".
 */
export function categorizeSkills(skills) {
  const buckets = CATEGORY_DEFS.map((c) => ({ label: c.label, items: [] }))
  const other = []

  for (const raw of skills) {
    const skill = (raw || '').trim()
    if (!skill) continue
    const lower = skill.toLowerCase()

    const exactIdx = CATEGORY_DEFS.findIndex((c) => c.terms.includes(lower))
    if (exactIdx >= 0) {
      buckets[exactIdx].items.push(skill)
      continue
    }

    const fuzzyIdx = CATEGORY_DEFS.findIndex((c) => c.terms.some((t) => lower.includes(t) || t.includes(lower)))
    if (fuzzyIdx >= 0) {
      buckets[fuzzyIdx].items.push(skill)
      continue
    }

    other.push(skill)
  }

  const categories = buckets.filter((b) => b.items.length > 0)
  if (other.length) categories.push({ label: 'Other Technologies', items: other })
  return categories
}
