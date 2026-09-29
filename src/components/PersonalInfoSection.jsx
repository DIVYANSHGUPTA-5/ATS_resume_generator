import Card from './Card.jsx'
import { IconUser } from './icons.jsx'

const FIELDS = [
  { key: 'fullName', label: 'Full Name', placeholder: 'Jane Doe', required: true },
  { key: 'title', label: 'Professional Title', placeholder: 'Full Stack Developer' },
  { key: 'email', label: 'Email', placeholder: 'jane@email.com', type: 'email', required: true },
  { key: 'phone', label: 'Phone', placeholder: '+1 555 123 4567' },
  { key: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/janedoe' },
  { key: 'github', label: 'GitHub', placeholder: 'github.com/janedoe' },
  { key: 'portfolio', label: 'Portfolio', placeholder: 'janedoe.dev' },
]

export default function PersonalInfoSection({ data, onChange, errors }) {
  const update = (key, value) => onChange({ ...data, [key]: value })

  return (
    <Card icon={<IconUser width={16} height={16} />} title="Personal Information">
      <div className="field-grid">
        {FIELDS.map((f) => (
          <div className={`field ${f.key === 'fullName' ? 'field-full' : ''}`} key={f.key}>
            <label htmlFor={f.key}>
              {f.label} {f.required && <span className="required">*</span>}
            </label>
            <input
              id={f.key}
              type={f.type || 'text'}
              value={data[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => update(f.key, e.target.value)}
              className={errors?.[f.key] ? 'input-error' : ''}
            />
            {errors?.[f.key] && <span className="field-error">{errors[f.key]}</span>}
          </div>
        ))}
      </div>
    </Card>
  )
}
