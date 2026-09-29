import Card from './Card.jsx'
import { IconCode, IconPlus, IconTrash } from './icons.jsx'
import { nextId } from '../data/demoData.js'

const empty = () => ({ id: nextId('proj'), name: '', date: '', tech: '', description: '', link: '' })

export default function ProjectsSection({ items, onChange }) {
  const update = (id, key, value) => onChange(items.map((it) => (it.id === id ? { ...it, [key]: value } : it)))
  const add = () => onChange([...items, empty()])
  const remove = (id) => onChange(items.filter((it) => it.id !== id))

  return (
    <Card
      icon={<IconCode width={16} height={16} />}
      title="Projects"
      action={
        <button type="button" className="btn-ghost-sm" onClick={add}>
          <IconPlus width={14} height={14} /> Add Project
        </button>
      }
    >
      {items.length === 0 && <p className="empty-hint">No projects added yet.</p>}
      <div className="repeat-list">
        {items.map((it) => (
          <div className="repeat-item" key={it.id}>
            <button type="button" className="remove-btn" onClick={() => remove(it.id)} aria-label="Remove project">
              <IconTrash width={14} height={14} />
            </button>
            <div className="field-grid">
              <div className="field">
                <label>Project Name</label>
                <input value={it.name} onChange={(e) => update(it.id, 'name', e.target.value)} placeholder="AI Resume Screener" />
              </div>
              <div className="field">
                <label>Date</label>
                <input value={it.date} onChange={(e) => update(it.id, 'date', e.target.value)} placeholder="Apr 2024" />
              </div>
              <div className="field field-full">
                <label>Technologies</label>
                <input value={it.tech} onChange={(e) => update(it.id, 'tech', e.target.value)} placeholder="React, Node.js, MongoDB" />
              </div>
              <div className="field field-full">
                <label>Description (one bullet per line)</label>
                <textarea
                  rows={3}
                  value={it.description}
                  onChange={(e) => update(it.id, 'description', e.target.value)}
                  placeholder={'What did you build?\nWhat impact did it have?'}
                />
              </div>
              <div className="field field-full">
                <label>GitHub URL</label>
                <input value={it.link} onChange={(e) => update(it.id, 'link', e.target.value)} placeholder="github.com/username/project" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
