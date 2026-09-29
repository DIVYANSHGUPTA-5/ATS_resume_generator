import Card from './Card.jsx'
import ScoreRing from './ScoreRing.jsx'
import { IconSearch, IconTarget } from './icons.jsx'

export default function JobDescriptionSection({ value, onChange, onAnalyze, analysis, isAnalyzing }) {
  return (
    <Card icon={<IconTarget width={16} height={16} />} title="Target Job Description">
      <textarea
        rows={7}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description you're targeting here..."
      />
      <div className="jd-actions">
        <button type="button" className="btn-secondary" onClick={onAnalyze} disabled={isAnalyzing || !value.trim()}>
          <IconSearch width={16} height={16} />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Job'}
        </button>
      </div>

      {analysis && (
        <div className="jd-analysis">
          <div className="jd-analysis-score">
            <ScoreRing score={analysis.score} size={84} strokeWidth={8} />
            <div>
              <div className="jd-analysis-title">ATS Match Score</div>
              <div className="jd-analysis-sub">Based on keyword and structure alignment</div>
            </div>
          </div>

          <div className="jd-keyword-groups">
            <div>
              <h4 className="kw-heading kw-matched">Matched Keywords</h4>
              <div className="kw-list">
                {analysis.matched.length === 0 && <span className="empty-hint">None yet</span>}
                {analysis.matched.map((k) => (
                  <span className="kw kw-matched-chip" key={k}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="kw-heading kw-missing">Missing Keywords</h4>
              <div className="kw-list">
                {analysis.missing.length === 0 && <span className="empty-hint">None — great coverage!</span>}
                {analysis.missing.map((k) => (
                  <span className="kw kw-missing-chip" key={k}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="jd-suggestions">
            <h4 className="kw-heading">Suggestions</h4>
            <ul>
              {analysis.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  )
}
