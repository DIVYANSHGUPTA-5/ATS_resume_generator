import { useMemo, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import StartPage from './components/StartPage.jsx'
import UploadResume from './components/UploadResume.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import PersonalInfoSection from './components/PersonalInfoSection.jsx'
import SummarySection from './components/SummarySection.jsx'
import EducationSection from './components/EducationSection.jsx'
import ExperienceSection from './components/ExperienceSection.jsx'
import ProjectsSection from './components/ProjectsSection.jsx'
import SkillsSection from './components/SkillsSection.jsx'
import CertificationsSection from './components/CertificationsSection.jsx'
import JobDescriptionSection from './components/JobDescriptionSection.jsx'
import AtsDashboard from './components/AtsDashboard.jsx'
import ResumeQuality from './components/ResumeQuality.jsx'
import ResumePreview from './components/ResumePreview.jsx'
import LoadingOverlay from './components/LoadingOverlay.jsx'
import ToastStack from './components/Toast.jsx'
import { createEmptyCandidate } from './data/demoData.js'
import { analyzeJobMatch, generateResume, analyzeResumeQuality, GENERATION_STEPS } from './utils/atsEngine.js'

let toastId = 0

const hasEnteredResumeData = (candidate, jobDescription) =>
  Boolean(
    candidate.personal.fullName.trim() ||
      candidate.personal.email.trim() ||
      candidate.summary.trim() ||
      candidate.education.length > 0 ||
      candidate.experience.length > 0 ||
      candidate.projects.length > 0 ||
      candidate.skills.length > 0 ||
      candidate.certifications.length > 0 ||
      candidate.achievements.length > 0 ||
      jobDescription.trim()
  )

function App() {
  const [view, setView] = useState('start') // 'start' | 'upload' | 'builder'
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [candidate, setCandidate] = useState(createEmptyCandidate())
  const [jobDescription, setJobDescription] = useState('')
  const [jdAnalysis, setJdAnalysis] = useState(null)
  const [atsAnalysis, setAtsAnalysis] = useState(null)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [toasts, setToasts] = useState([])
  const formTopRef = useRef(null)

  const pushToast = (message, type = 'success') => {
    const id = ++toastId
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }

  const displayedResume = useMemo(() => {
    if (!hasGenerated || !atsAnalysis) return candidate
    const matched = new Set(atsAnalysis.matched.map((k) => k.toLowerCase()))
    const skills = [...candidate.skills].sort((a, b) => {
      const aHit = [...matched].some((k) => a.toLowerCase().includes(k.toLowerCase())) ? 0 : 1
      const bHit = [...matched].some((k) => b.toLowerCase().includes(k.toLowerCase())) ? 0 : 1
      return aHit - bHit
    })
    return { ...candidate, skills }
  }, [candidate, atsAnalysis, hasGenerated])

  const resumeQuality = useMemo(
    () => analyzeResumeQuality(candidate, jobDescription),
    [candidate, jobDescription]
  )

  const validate = () => {
    const next = {}
    if (!candidate.personal.fullName.trim()) next.fullName = 'Full name is required'
    if (!candidate.personal.email.trim()) next.email = 'Email is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return
    setIsAnalyzing(true)
    setTimeout(() => {
      const result = analyzeJobMatch(candidate, jobDescription)
      setJdAnalysis(result)
      setAtsAnalysis(result)
      setIsAnalyzing(false)
      pushToast('Job description analyzed')
    }, 600)
  }

  const runGeneration = () => {
    if (!validate()) {
      pushToast('Please fill in the required fields before generating.', 'error')
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    setIsGenerating(true)
    setActiveStep(0)

    const stepDelay = 420
    GENERATION_STEPS.forEach((_, i) => {
      setTimeout(() => setActiveStep(i), i * stepDelay)
    })

    setTimeout(() => {
      const { analysis } = generateResume(candidate, jobDescription)
      setAtsAnalysis(analysis)
      setJdAnalysis(analysis)
      setHasGenerated(true)
      setIsGenerating(false)
      pushToast('Resume generated successfully!')
    }, GENERATION_STEPS.length * stepDelay + 300)
  }

  const handleReset = () => {
    setCandidate(createEmptyCandidate())
    setJobDescription('')
    setJdAnalysis(null)
    setAtsAnalysis(null)
    setHasGenerated(false)
    setErrors({})
    pushToast('Form reset')
  }

  const handleEdit = () => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleDownload = () => {
    window.print()
  }

  const updateCandidate = (key, value) => setCandidate((c) => ({ ...c, [key]: value }))

  const handleSelectUpload = () => setView('upload')
  const handleSelectCreate = () => setView('builder')

  const handleResumeImported = (parsedCandidate, { lowConfidence } = {}) => {
    setCandidate(parsedCandidate)
    setJdAnalysis(null)
    setAtsAnalysis(null)
    setHasGenerated(false)
    setView('builder')
    pushToast(
      lowConfidence
        ? "We couldn't confidently read details from that file — please fill in your information below."
        : 'Resume imported successfully. Please review the extracted information before generating your resume.',
      lowConfidence ? 'error' : 'success'
    )
  }

  const handleBackToStart = () => {
    if (hasEnteredResumeData(candidate, jobDescription)) {
      setShowBackConfirm(true)
    } else {
      setView('start')
    }
  }

  return (
    <div className="app-shell">
      {view === 'start' && <StartPage onSelectUpload={handleSelectUpload} onSelectCreate={handleSelectCreate} />}

      {view === 'upload' && <UploadResume onBack={() => setView('start')} onImported={handleResumeImported} />}

      {view === 'builder' && (
        <>
          <Header onReset={handleReset} onGenerate={runGeneration} isGenerating={isGenerating} onBackToStart={handleBackToStart} />

          <main className="app-main">
            <div className="app-grid">
              <div className="form-column" ref={formTopRef}>
                <PersonalInfoSection
                  data={candidate.personal}
                  onChange={(v) => updateCandidate('personal', v)}
                  errors={errors}
                />
                <SummarySection value={candidate.summary} onChange={(v) => updateCandidate('summary', v)} />
                <EducationSection items={candidate.education} onChange={(v) => updateCandidate('education', v)} />
                <ExperienceSection items={candidate.experience} onChange={(v) => updateCandidate('experience', v)} />
                <ProjectsSection items={candidate.projects} onChange={(v) => updateCandidate('projects', v)} />
                <SkillsSection skills={candidate.skills} onChange={(v) => updateCandidate('skills', v)} />
                <CertificationsSection
                  certifications={candidate.certifications}
                  onChange={(v) => updateCandidate('certifications', v)}
                  achievements={candidate.achievements}
                  onAchievementsChange={(v) => updateCandidate('achievements', v)}
                />
                <JobDescriptionSection
                  value={jobDescription}
                  onChange={setJobDescription}
                  onAnalyze={handleAnalyze}
                  analysis={jdAnalysis}
                  isAnalyzing={isAnalyzing}
                />
              </div>

              <div className="preview-column">
                {hasGenerated && <AtsDashboard analysis={atsAnalysis} />}
                {hasGenerated && <ResumeQuality analysis={resumeQuality} />}
                <ResumePreview
                  resume={displayedResume}
                  hasGenerated={hasGenerated}
                  onEdit={handleEdit}
                  onRegenerate={runGeneration}
                  onDownload={handleDownload}
                />
              </div>
            </div>
          </main>
        </>
      )}

      {isGenerating && <LoadingOverlay activeStep={activeStep} />}
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
      <ConfirmDialog
        open={showBackConfirm}
        title="Leave the resume builder?"
        message="Your current resume data will remain available if you return to the builder. It's only cleared if you choose Reset."
        confirmLabel="Back to Start"
        cancelLabel="Stay Here"
        onConfirm={() => {
          setShowBackConfirm(false)
          setView('start')
        }}
        onCancel={() => setShowBackConfirm(false)}
      />
    </div>
  )
}

export default App
