import Card from './Card.jsx'
import { IconGrad, IconPlus, IconTrash } from './icons.jsx'
import { nextId } from '../data/demoData.js'

const empty = () => ({ id: nextId('edu'), degree: '', university: '', year: '', score: '' })

export default function EducationSection({ items, onChange }) {
  const update = (id, key, value) => onChange(items.map((it) => (it.id === id ? { ...it, [key]: value } : it)))
  const add = () => onChange([...items, empty()])
  const remove = (id) => onChange(items.filter((it) => it.id !== id))

  return (
    <Card
      icon={<IconGrad width={16} height={16} />}
      title="Education"
      action={
        <button type="button" className="btn-ghost-sm" onClick={add}>
          <IconPlus width={14} height={14} /> Add Education
        </button>
      }
    >
      {items.length === 0 && <p className="empty-hint">No education added yet.</p>}
      <div className="repeat-list">
        {items.map((it) => (
          <div className="repeat-item" key={it.id}>
            <button type="button" className="remove-btn" onClick={() => remove(it.id)} aria-label="Remove education">
              <IconTrash width={14} height={14} />
            </button>
            <div className="field-grid">
              <div className="field">
                <label>Degree</label>
                <input value={it.degree} onChange={(e) => update(it.id, 'degree', e.target.value)} placeholder="B.Tech in Computer Science" />
              </div>
              <div className="field">
                <label>University</label>
                <input value={it.university} onChange={(e) => update(it.id, 'university', e.target.value)} placeholder="State University" />
              </div>
              <div className="field">
                <label>Graduation Year</label>
                <input value={it.year} onChange={(e) => update(it.id, 'year', e.target.value)} placeholder="2023" />
              </div>
              <div className="field">
                <label>CGPA / Percentage</label>
                <input value={it.score} onChange={(e) => update(it.id, 'score', e.target.value)} placeholder="CGPA: 8.7/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
