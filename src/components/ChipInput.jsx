import { useState } from 'react'
import { IconX } from './icons.jsx'

export default function ChipInput({ values, onChange, placeholder }) {
  const [draft, setDraft] = useState('')

  const addChip = (raw) => {
    const value = raw.trim().replace(/,$/, '')
    if (!value) return
    if (values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      setDraft('')
      return
    }
    onChange([...values, value])
    setDraft('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addChip(draft)
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  const removeChip = (index) => {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div className="chip-input">
      {values.map((v, i) => (
        <span className="chip" key={`${v}-${i}`}>
          {v}
          <button type="button" className="chip-remove" onClick={() => removeChip(i)} aria-label={`Remove ${v}`}>
            <IconX width={12} height={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addChip(draft)}
        placeholder={placeholder}
        className="chip-input-field"
      />
    </div>
  )
}
