import ScoreRing from './ScoreRing.jsx'
import { IconCheck, IconX } from './icons.jsx'

const CHECK_LABELS = [
  { key: 'keywordMatch', label: 'Keyword Match' },
  { key: 'skillsAlignment', label: 'Skills Alignment' },
  { key: 'sectionStructure', label: 'Section Structure' },
  { key: 'atsFormatting', label: 'ATS Formatting' },
]

export default function AtsDashboard({ analysis }) {
  if (!analysis) return null

  return (
    <div className="ats-dashboard">
      <div className="ats-dashboard-main">
        <ScoreRing score={analysis.score} size={72} strokeWidth={7} />
        <div>
          <div className="ats-dashboard-title">JOB MATCH SCORE: {analysis.score}/100</div>
          <div className="ats-dashboard-checks">
            {CHECK_LABELS.map((c) => (
              <span key={c.key} className={`ats-check ${analysis.checks[c.key] ? 'ats-check-pass' : 'ats-check-fail'}`}>
                {analysis.checks[c.key] ? <IconCheck width={13} height={13} /> : <IconX width={13} height={13} />}
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      {analysis.suggestions.length > 0 && (
        <div className="ats-dashboard-improve">
          <span className="ats-improve-label">Areas to improve</span>
          <ul>
            {analysis.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
