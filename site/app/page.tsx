import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Expertise from "@/components/Expertise";
import Projects from "@/components/Projects";
import PortfolioGrid from "@/components/PortfolioGrid";
import Facilities from "@/components/Facilities";
import Team from "@/components/Team";
import Excellence from "@/components/Excellence";
import OmanMap from "@/components/OmanMap";
import AwardsCerts from "@/components/AwardsCerts";
import Clients from "@/components/Clients";
import RoyalQuote from "@/components/RoyalQuote";
import HistoryTimeline from "@/components/HistoryTimeline";
import Story from "@/components/Story";
import Future from "@/components/Future";
import Footer from "@/components/Footer";
import ProjectModal from "@/components/ProjectModal";
import FacilityMedia from "@/components/FacilityMedia";

/**
 * This page used to carry `export const revalidate = 86400`, so the server
 * re-rendered it daily and the derived year count rolled over on its own.
 *
 * A static export has no server to do that, and ISR is unsupported there, so
 * the count is baked in at build time instead. The rollover is preserved by the
 * deploy workflow rather than by the framework: `.github/workflows/pages.yml`
 * rebuilds on a New Year schedule as well as on push, which re-evaluates
 * `years()` and republishes. Same outcome, moved from runtime to CI.
 */

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Intro />
      <Expertise />
      <Projects />
      <PortfolioGrid />
      <OmanMap />
      <Facilities />
      <Team />
      <Excellence />
      <AwardsCerts />
      <Clients />
      <RoyalQuote />
      <HistoryTimeline />
      <Story />
      <Future />
      <Footer />
      <ProjectModal />
      <FacilityMedia />
    </main>
  );
}
