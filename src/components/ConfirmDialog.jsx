export default function ConfirmDialog({ open, title, message, confirmLabel = 'Continue', cancelLabel = 'Cancel', onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="loading-overlay" role="dialog" aria-modal="true">
      <div className="confirm-card">
        {title && <h3 className="confirm-title">{title}</h3>}
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
