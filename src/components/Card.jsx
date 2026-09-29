export default function Card({ icon, title, action, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="card-head">
          <h3 className="card-title">
            {icon && <span className="card-icon">{icon}</span>}
            {title}
          </h3>
          {action}
        </div>
      )}
      <div className="card-body">{children}</div>
    </section>
  )
}
