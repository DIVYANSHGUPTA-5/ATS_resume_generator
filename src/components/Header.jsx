import { IconArrowLeft, IconRefresh, IconSparkles } from './icons.jsx'

export default function Header({ onReset, onGenerate, isGenerating, onBackToStart }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-header-brand">
          <div className="brand-mark">
            <IconSparkles width={18} height={18} />
          </div>
          <div>
            <h1>AI Resume Builder</h1>
            <p>Create an ATS-friendly resume in minutes</p>
          </div>
        </div>
        <div className="app-header-actions">
          {onBackToStart && (
            <button type="button" className="btn-ghost-sm" onClick={onBackToStart}>
              <IconArrowLeft width={14} height={14} /> Back to Start
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={onReset}>
            <IconRefresh width={16} height={16} /> Reset
          </button>
          <button type="button" className="btn-primary" onClick={onGenerate} disabled={isGenerating}>
            <IconSparkles width={16} height={16} />
            {isGenerating ? 'Generating...' : 'Generate Resume'}
          </button>
        </div>
      </div>
    </header>
  )
}
