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
 * Regenerate daily so the derived year count rolls over on its own. Without
 * this the page is prerendered once at build time and the number would sit
 * frozen until the next deploy.
 */
export const revalidate = 86400;

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
