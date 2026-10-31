import type { Metadata } from "next";
import HsePage from "@/components/pages/HsePage";

export const metadata: Metadata = {
  title: "الصحة والسلامة والبيئة — الأدرك",
  description:
    "كيف تحمي الأدرك قوة عاملة قوامها 6,000 شخص: ثقافة سلامة تقودها الإدارة، وقواعد إنقاذ الحياة التسع، ومركز تدريب داخلي، وشهادات الأيزو 45001 و14001 و9001.",
};

export default function Page() {
  return <HsePage lang="ar" />;
}
