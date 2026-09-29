export default function ScoreRing({ score, size = 96, strokeWidth = 9 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference
  const tone = score >= 80 ? 'good' : score >= 60 ? 'mid' : 'low'

  return (
    <div className={`score-ring score-ring-${tone}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--ring-track)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="score-ring-progress"
        />
      </svg>
      <div className="score-ring-label">
        <span className="score-ring-value">{score}</span>
        <span className="score-ring-suffix">/100</span>
      </div>
    </div>
  )
}
