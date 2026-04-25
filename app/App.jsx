import { useState } from "react";
import { LoginView } from "~/views/LoginView.jsx";
import { HomeView } from "~/views/HomeView.jsx";
import { SettingsView } from "~/views/SettingsView.jsx";
import {
  clearSession,
  getSession,
  setSession as persistSession,
} from "~/lib/session.js";

export function App() {
  const [session, setSession] = useState(() => getSession());
  const [view, setView] = useState("home");
  const [bannerVersion, setBannerVersion] = useState(0);

  function handleSignedIn(user) {
    persistSession(user);
    setSession(user);
    setView("home");
  }

  function handleSignOut() {
    clearSession();
    setSession(null);
    setView("home");
  }

  function navigateToSettings() {
    if (session?.role !== "admin") return;
    setView("settings");
  }

  function navigateHome() {
    setView("home");
  }

  function handleBannerSaved() {
    setBannerVersion((v) => v + 1);
    setView("home");
  }

  if (!session) {
    return <LoginView onSignedIn={handleSignedIn} />;
  }

  if (view === "settings" && session.role === "admin") {
    return (
      <SettingsView
        session={session}
        onSignOut={handleSignOut}
        onSaved={handleBannerSaved}
        onCancel={navigateHome}
      />
    );
  }

  return (
    <HomeView
      key={bannerVersion}
      session={session}
      onSignOut={handleSignOut}
      onNavigateToSettings={
        session.role === "admin" ? navigateToSettings : undefined
      }
    />
  );
}
