import { useState } from 'react'
import { IconAlert, IconArrowLeft, IconUpload } from './icons.jsx'

export default function UploadResume({ onBack, onImported }) {
  const [status, setStatus] = useState('idle') // idle | parsing | error
  const [errorMessage, setErrorMessage] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = async (file) => {
    setStatus('parsing')
    setErrorMessage('')
    try {
      const { extractTextFromFile, parseResumeText, isCandidateEffectivelyEmpty } = await import('../utils/resumeParser.js')
      const { text, links } = await extractTextFromFile(file)
      const candidate = parseResumeText(text, links)
      onImported(candidate, { lowConfidence: isCandidateEffectivelyEmpty(candidate) })
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'We could not read this file. Please try another PDF or DOCX resume.')
    }
  }

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) handleFile(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="upload-page">
      <div className="upload-shell">
        <button type="button" className="btn-ghost-sm back-link" onClick={onBack}>
          <IconArrowLeft width={14} height={14} /> Back to Start
        </button>

        <div className="upload-card">
          <h2>Upload your resume</h2>
          <p>We&rsquo;ll extract your details so you can review and edit them in the builder.</p>

          <label
            className={`upload-dropzone ${isDragOver ? 'dragover' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
          >
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={onFileInputChange}
              hidden
            />
            <span className="upload-dropzone-icon">
              <IconUpload width={22} height={22} />
            </span>
            <strong>Click to choose a file</strong>
            <span className="upload-hint">or drag and drop it here</span>
          </label>

          {status === 'parsing' && (
            <div className="upload-status">
              <span className="spinner" /> Reading your resume…
            </div>
          )}

          {status === 'error' && (
            <div className="upload-error">
              <IconAlert width={14} height={14} /> {errorMessage}
            </div>
          )}

          <p className="upload-formats">Supported formats: PDF, DOCX</p>
        </div>
      </div>
    </div>
  )
}
