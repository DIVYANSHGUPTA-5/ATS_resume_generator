import Card from './Card.jsx'
import ChipInput from './ChipInput.jsx'
import { IconAward } from './icons.jsx'

export default function SkillsSection({ skills, onChange }) {
  return (
    <Card icon={<IconAward width={16} height={16} />} title="Skills">
      <ChipInput values={skills} onChange={onChange} placeholder="Type a skill and press Enter..." />
      <div className="field-hint">Press Enter or comma to add a skill.</div>
    </Card>
  )
}
