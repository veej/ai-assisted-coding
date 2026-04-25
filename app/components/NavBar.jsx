export function NavBar({ session, onSignOut, onNavigateToSettings }) {
  return (
    <header className="navbar">
      <div className="navbar__brand">Foyer</div>
      <nav className="navbar__nav" aria-label="Primary">
        {session.role === "admin" && onNavigateToSettings && (
          <a
            href="#settings"
            className="navbar__link"
            onClick={(event) => {
              event.preventDefault();
              onNavigateToSettings();
            }}
          >
            Settings
          </a>
        )}
        <span className="navbar__user">{session.email}</span>
        <button type="button" className="navbar__action" onClick={onSignOut}>
          Sign out
        </button>
      </nav>
    </header>
  );
}
