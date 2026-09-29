import Card from './Card.jsx'
import { IconBriefcase, IconPlus, IconTrash } from './icons.jsx'
import { nextId } from '../data/demoData.js'

const empty = () => ({ id: nextId('exp'), title: '', company: '', startDate: '', endDate: '', location: '', responsibilities: '' })

export default function ExperienceSection({ items, onChange }) {
  const update = (id, key, value) => onChange(items.map((it) => (it.id === id ? { ...it, [key]: value } : it)))
  const add = () => onChange([...items, empty()])
  const remove = (id) => onChange(items.filter((it) => it.id !== id))

  return (
    <Card
      icon={<IconBriefcase width={16} height={16} />}
      title="Experience"
      action={
        <button type="button" className="btn-ghost-sm" onClick={add}>
          <IconPlus width={14} height={14} /> Add Experience
        </button>
      }
    >
      {items.length === 0 && <p className="empty-hint">No experience added yet.</p>}
      <div className="repeat-list">
        {items.map((it) => (
          <div className="repeat-item" key={it.id}>
            <button type="button" className="remove-btn" onClick={() => remove(it.id)} aria-label="Remove experience">
              <IconTrash width={14} height={14} />
            </button>
            <div className="field-grid">
              <div className="field">
                <label>Job Title</label>
                <input value={it.title} onChange={(e) => update(it.id, 'title', e.target.value)} placeholder="Software Engineer" />
              </div>
              <div className="field">
                <label>Company</label>
                <input value={it.company} onChange={(e) => update(it.id, 'company', e.target.value)} placeholder="Acme Corp" />
              </div>
              <div className="field">
                <label>Start Date</label>
                <input value={it.startDate} onChange={(e) => update(it.id, 'startDate', e.target.value)} placeholder="Jan 2023" />
              </div>
              <div className="field">
                <label>End Date</label>
                <input value={it.endDate} onChange={(e) => update(it.id, 'endDate', e.target.value)} placeholder="Present" />
              </div>
              <div className="field">
                <label>Location / Employment Type</label>
                <input
                  value={it.location}
                  onChange={(e) => update(it.id, 'location', e.target.value)}
                  placeholder="Remote, Hybrid, Internship..."
                />
              </div>
              <div className="field field-full">
                <label>Responsibilities (one per line)</label>
                <textarea
                  rows={4}
                  value={it.responsibilities}
                  onChange={(e) => update(it.id, 'responsibilities', e.target.value)}
                  placeholder={'Led development of...\nImproved performance by...'}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
