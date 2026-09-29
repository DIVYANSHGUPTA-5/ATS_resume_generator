import ScoreRing from './ScoreRing.jsx'
import { IconAlert, IconCheck } from './icons.jsx'

const toneFor = (score) => (score >= 80 ? 'good' : score >= 60 ? 'mid' : 'low')

export default function ResumeQuality({ analysis }) {
  if (!analysis) return null

  return (
    <div className="ats-dashboard quality-dashboard">
      <div className="quality-dashboard-head">
        <span className="preview-toolbar-label">Resume Quality</span>
        <ScoreRing score={analysis.overallScore} size={72} strokeWidth={7} />
      </div>

      <div className="quality-bars">
        {analysis.categories.map((c) => (
          <div className="quality-bar-row" key={c.key}>
            <span className="quality-bar-label">{c.label}</span>
            <div className="quality-bar-track">
              <div
                className={`quality-bar-fill quality-bar-${toneFor(c.score)}`}
                style={{ width: `${c.score}%` }}
              />
            </div>
            <span className="quality-bar-pct">{c.score}%</span>
          </div>
        ))}
      </div>

      {(analysis.improvements.length > 0 || analysis.strengths.length > 0) && (
        <div className="ats-dashboard-improve">
          {analysis.improvements.length > 0 && (
            <>
              <span className="ats-improve-label">Areas to improve</span>
              <ul className="quality-list">
                {analysis.improvements.map((s, i) => (
                  <li key={i} className="quality-item-warn">
                    <IconAlert width={13} height={13} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {analysis.strengths.length > 0 && (
            <>
              <span className="ats-improve-label quality-strengths-label">Strengths</span>
              <ul className="quality-list">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="quality-item-good">
                    <IconCheck width={13} height={13} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
