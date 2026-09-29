import { IconCheck, IconX } from './icons.jsx'

export default function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === 'error' ? <IconX width={16} height={16} /> : <IconCheck width={16} height={16} />}
          </span>
          <span>{t.message}</span>
          <button className="toast-close" onClick={() => onDismiss(t.id)} aria-label="Dismiss">
            <IconX width={14} height={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
