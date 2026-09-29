import Card from './Card.jsx'
import ChipInput from './ChipInput.jsx'
import { IconAward } from './icons.jsx'

export default function CertificationsSection({ certifications, onChange, achievements, onAchievementsChange }) {
  return (
    <Card icon={<IconAward width={16} height={16} />} title="Certifications & Achievements" className="card-optional">
      <div className="field">
        <label>Certifications</label>
        <ChipInput values={certifications} onChange={onChange} placeholder="Type a certification and press Enter..." />
      </div>
      <div className="field field-spaced">
        <label>Awards &amp; Achievements</label>
        <ChipInput values={achievements} onChange={onAchievementsChange} placeholder="Type an achievement and press Enter..." />
      </div>
      <div className="field-hint">Optional — add any relevant certifications or achievements.</div>
    </Card>
  )
}
