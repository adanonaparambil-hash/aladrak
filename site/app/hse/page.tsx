import type { Metadata } from "next";
import HsePage from "@/components/pages/HsePage";

export const metadata: Metadata = {
  title: "Health, Safety & Environment — Al Adrak",
  description:
    "How Al Adrak protects a 6,000-strong workforce: leadership-driven safety culture, the 9 Life-Saving Rules, an in-house training centre, Wellness Tracking, and ISO 45001, 14001 and 9001 certification.",
};

export default function Page() {
  return <HsePage />;
}
