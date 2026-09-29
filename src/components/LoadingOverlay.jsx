import { IconCheck, IconSparkles } from './icons.jsx'
import { GENERATION_STEPS } from '../utils/atsEngine.js'

export default function LoadingOverlay({ activeStep }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="loading-title">
          <IconSparkles width={20} height={20} />
          Building your resume...
        </div>
        <ul className="loading-steps">
          {GENERATION_STEPS.map((step, i) => (
            <li key={step} className={i <= activeStep ? 'step-done' : 'step-pending'}>
              <span className="step-icon">{i <= activeStep ? <IconCheck width={14} height={14} /> : <span className="step-dot" />}</span>
              {step}
            </li>
          ))}
        </ul>
        <div className="loading-bar">
          <div className="loading-bar-fill" style={{ width: `${((activeStep + 1) / GENERATION_STEPS.length) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
