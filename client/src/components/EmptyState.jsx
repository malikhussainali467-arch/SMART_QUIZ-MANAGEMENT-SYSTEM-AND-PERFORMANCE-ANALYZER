export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty">
      {Icon && (
        <div className="empty-icon">
          <Icon size={28} />
        </div>
      )}
      <h3>{title}</h3>
      {text && <p style={{ maxWidth: 420 }}>{text}</p>}
      {action}
    </div>
  );
}
