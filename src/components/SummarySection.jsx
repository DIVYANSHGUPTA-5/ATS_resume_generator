import Card from './Card.jsx'
import { IconFileText } from './icons.jsx'

export default function SummarySection({ value, onChange }) {
  return (
    <Card icon={<IconFileText width={16} height={16} />} title="Professional Summary">
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="A concise 2-4 sentence summary highlighting your experience, key strengths, and career focus..."
      />
      <div className="field-hint">{value.length} characters — aim for 200-400</div>
    </Card>
  )
}
