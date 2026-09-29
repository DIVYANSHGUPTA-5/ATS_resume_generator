import { IconDownload, IconEdit, IconRefresh } from './icons.jsx'
import { categorizeSkills } from '../utils/skillCategories.js'

// Accepts a URL with or without a scheme ("linkedin.com/in/x" or
// "https://linkedin.com/in/x") and returns a safe, absolute href — or ''
// when there's nothing usable, so callers can skip rendering a link at all.
const toHref = (url) => {
  const trimmed = (url || '').trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

// Renders the raw value the user entered/imported as clickable text —
// nothing about the displayed text changes, it's just wrapped in a link.
const ExternalLink = ({ url, className }) => {
  const href = toHref(url)
  if (!href) return null
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {url}
    </a>
  )
}

const contactItems = (personal) => {
  const items = []
  if (personal.email) items.push({ key: 'email', node: personal.email })
  if (personal.phone) items.push({ key: 'phone', node: personal.phone })
  if (personal.location) items.push({ key: 'location', node: personal.location })
  if (personal.linkedin) items.push({ key: 'linkedin', node: <ExternalLink url={personal.linkedin} className="resume-link" /> })
  if (personal.github) items.push({ key: 'github', node: <ExternalLink url={personal.github} className="resume-link" /> })
  if (personal.portfolio) items.push({ key: 'portfolio', node: <ExternalLink url={personal.portfolio} className="resume-link" /> })
  return items
}

// Splits a "one item per line" text block into clean bullet strings —
// shared by experience responsibilities and project descriptions.
const bulletLines = (text) =>
  (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

export default function ResumePreview({ resume, hasGenerated, onEdit, onRegenerate, onDownload }) {
  const { personal, summary, education, experience, projects, skills, certifications, achievements } = resume
  const displayName = personal.fullName || 'Your Name'
  const contact = contactItems(personal)
  const skillCategories = categorizeSkills(skills)

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <span className="preview-toolbar-label">{hasGenerated ? 'Generated Resume' : 'Live Preview'}</span>
        <div className="preview-toolbar-actions">
          <button type="button" className="btn-ghost-sm" onClick={onEdit}>
            <IconEdit width={14} height={14} /> Edit
          </button>
          <button type="button" className="btn-ghost-sm" onClick={onRegenerate}>
            <IconRefresh width={14} height={14} /> Regenerate
          </button>
          <button type="button" className="btn-primary-sm" onClick={onDownload}>
            <IconDownload width={14} height={14} /> Download / Print
          </button>
        </div>
      </div>

      <div className="resume-page" id="resume-preview">
        <header className="resume-header">
          <h1>{displayName}</h1>
          {personal.title && <div className="resume-role">{personal.title}</div>}
          {contact.length > 0 && (
            <div className="resume-contact">
              {contact.map((item, i) => (
                <span key={item.key}>
                  {i > 0 ? '  •  ' : null}
                  {item.node}
                </span>
              ))}
            </div>
          )}
        </header>

        {summary && (
          <section className="resume-section">
            <h2>Summary</h2>
            <p>{summary}</p>
          </section>
        )}

        {education.length > 0 && (
          <section className="resume-section">
            <h2>Education</h2>
            {education.map((edu) => (
              <div className="resume-entry" key={edu.id}>
                <div className="resume-entry-head">
                  <span className="resume-entry-title">{edu.degree}</span>
                  <span className="resume-entry-date">{edu.year}</span>
                </div>
                <div className="resume-entry-sub">
                  {edu.university}
                  {edu.score && ` — ${edu.score}`}
                </div>
              </div>
            ))}
          </section>
        )}

        {experience.length > 0 && (
          <section className="resume-section">
            <h2>Experience</h2>
            {experience.map((exp) => (
              <div className="resume-entry" key={exp.id}>
                <div className="resume-entry-head">
                  <span className="resume-entry-title">
                    {exp.title}
                    {exp.company && ` | ${exp.company}`}
                  </span>
                  <span className="resume-entry-date">
                    {exp.startDate}
                    {exp.startDate && exp.endDate && ' – '}
                    {exp.endDate}
                  </span>
                </div>
                {exp.location && <div className="resume-entry-sub">{exp.location}</div>}
                {exp.responsibilities && (
                  <ul>
                    {bulletLines(exp.responsibilities).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {skillCategories.length > 0 && (
          <section className="resume-section">
            <h2>Skills</h2>
            <div className="resume-skill-groups">
              {skillCategories.map((cat) => (
                <div className="resume-skill-group" key={cat.label}>
                  <span className="resume-skill-group-label">{cat.label}:</span>
                  <span className="resume-skill-group-items">{cat.items.join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="resume-section">
            <h2>Projects</h2>
            {projects.map((proj) => (
              <div className="resume-entry" key={proj.id}>
                <div className="resume-entry-head">
                  <span className="resume-entry-title">{proj.name}</span>
                  {proj.date && <span className="resume-entry-date">{proj.date}</span>}
                </div>
                <ExternalLink url={proj.link} className="resume-project-link resume-link" />
                {proj.tech && (
                  <div className="resume-entry-sub">
                    <strong>Technologies:</strong> {proj.tech}
                  </div>
                )}
                {proj.description && (
                  <ul>
                    {bulletLines(proj.description).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {certifications.length > 0 && (
          <section className="resume-section">
            <h2>Certifications</h2>
            <ul className="resume-flat-list">
              {certifications.map((cert, i) => (
                <li key={i}>{cert}</li>
              ))}
            </ul>
          </section>
        )}

        {achievements.length > 0 && (
          <section className="resume-section">
            <h2>Awards &amp; Achievements</h2>
            <ul className="resume-flat-list">
              {achievements.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
