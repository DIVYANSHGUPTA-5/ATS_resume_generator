import { IconSparkles, IconUpload } from './icons.jsx'

export default function StartPage({ onSelectUpload, onSelectCreate }) {
  return (
    <div className="start-page">
      <div className="start-hero">
        <div className="start-brand-mark">
          <IconSparkles width={24} height={24} />
        </div>
        <h1>AI Resume Builder</h1>
        <p className="start-tagline">Build or improve your resume with AI</p>
        <span className="start-subtitle">Choose how you want to start</span>
      </div>

      <div className="start-options">
        <div className="start-card">
          <span className="start-card-icon">
            <IconUpload width={24} height={24} />
          </span>
          <span className="start-card-eyebrow">Upload Resume</span>
          <h2>Upload &amp; Edit</h2>
          <p>Upload your existing resume and we&rsquo;ll extract the details so you can edit them.</p>
          <button type="button" className="btn-primary" onClick={onSelectUpload}>
            Upload Resume
          </button>
        </div>

        <div className="start-or" aria-hidden="true">
          or
        </div>

        <div className="start-card">
          <span className="start-card-icon">
            <IconSparkles width={24} height={24} />
          </span>
          <span className="start-card-eyebrow">Create Resume</span>
          <h2>Start From Scratch</h2>
          <p>Enter your personal information, skills, education, projects and experience.</p>
          <button type="button" className="btn-primary" onClick={onSelectCreate}>
            Create Resume
          </button>
        </div>
      </div>
    </div>
  )
}
