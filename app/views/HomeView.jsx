import { Banner } from "~/components/Banner.jsx";
import { NavBar } from "~/components/NavBar.jsx";
import { getBanner } from "~/lib/banner.js";

export function HomeView({ session, onSignOut }) {
  const banner = getBanner();

  return (
    <>
      <NavBar session={session} onSignOut={onSignOut} />
      <main className="app-shell">
        <Banner message={banner.message} accent={banner.accent} />
        <section className="home-intro">
          <h2>Hi {session.email.split("@")[0]}</h2>
          <p>
            This is your home. The banner above is set by the admin team and is
            visible to everyone signed in.
          </p>
        </section>
      </main>
    </>
  );
}
