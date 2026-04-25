import { useState } from "react";
import { LoginView } from "~/views/LoginView.jsx";
import { HomeView } from "~/views/HomeView.jsx";
import {
  clearSession,
  getSession,
  setSession as persistSession,
} from "~/lib/session.js";

export function App() {
  const [session, setSession] = useState(() => getSession());

  function handleSignedIn(user) {
    persistSession(user);
    setSession(user);
  }

  function handleSignOut() {
    clearSession();
    setSession(null);
  }

  if (!session) {
    return <LoginView onSignedIn={handleSignedIn} />;
  }

  return <HomeView session={session} onSignOut={handleSignOut} />;
}
