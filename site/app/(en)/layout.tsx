import SiteDocument, { siteMetadata } from "@/components/SiteDocument";
export const metadata = siteMetadata;
export default function Layout({ children }: { children: React.ReactNode }) { return <SiteDocument locale="en">{children}</SiteDocument>; }
