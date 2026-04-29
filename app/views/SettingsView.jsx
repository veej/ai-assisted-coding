import { useState } from "react";
import { NavBar } from "~/components/NavBar.jsx";
import { ACCENTS, getBanner, setBanner } from "~/lib/banner.js";

const MAX_LENGTH = 140;

export function SettingsView({ session, onSignOut, onSaved, onCancel }) {
  const initial = getBanner();
  const [message, setMessage] = useState(initial.message);
  const [accent, setAccent] = useState(initial.accent);

  const trimmed = message.trim();
  const canSave = trimmed.length > 0 && trimmed.length <= MAX_LENGTH;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSave) return;
    setBanner({ message: trimmed, accent });
    onSaved();
  }

  return (
    <>
      <NavBar session={session} onSignOut={onSignOut} />
      <main className="app-shell">
        <h2>Banner settings</h2>
        <p className="settings-form__hint">
          What everyone signed in to Foyer sees on the home page.
        </p>
        <form className="settings-form" onSubmit={handleSubmit}>
          <label className="settings-form__field">
            <span>Welcome message</span>
            <input
              type="text"
              maxLength={MAX_LENGTH}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              autoFocus
            />
          </label>
          <fieldset className="settings-form__accents">
            <legend>Accent</legend>
            {ACCENTS.map((name) => (
              <label
                key={name}
                className={`accent-radio accent-radio--${name}`}
              >
                <input
                  type="radio"
                  name="accent"
                  value={name}
                  checked={accent === name}
                  onChange={() => setAccent(name)}
                  aria-label={name}
                />
                <span>{name[0].toUpperCase() + name.slice(1)}</span>
              </label>
            ))}
          </fieldset>
          <div className="settings-form__actions">
            <button
              type="button"
              className="settings-form__cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="settings-form__save"
              disabled={!canSave}
            >
              Save
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
