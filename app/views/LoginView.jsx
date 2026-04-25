import { useState } from "react";
import { signIn } from "~/lib/auth.js";

export function LoginView({ onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const user = signIn(email, password);
    if (!user) {
      setError("Email or password not recognised.");
      return;
    }
    onSignedIn(user);
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <h1 id="auth-title">Sign in to Foyer</h1>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-form__field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              autoFocus
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
            />
          </label>
          <label className="auth-form__field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError(null);
              }}
            />
          </label>
          {error && (
            <p className="auth-form__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="auth-form__submit">
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}
