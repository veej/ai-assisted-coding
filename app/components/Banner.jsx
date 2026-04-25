export function Banner({ message, accent }) {
  return (
    <div className={`banner banner--accent-${accent}`} role="status">
      <p className="banner__message">{message}</p>
    </div>
  );
}
