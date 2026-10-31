import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";

export const metadata: Metadata = {
  title: "الأدرك — مقاولون عامون في سلطنة عُمان",
  description:
    "نبني في عُمان منذ عام 1986. مشاريع حكومية وتجارية وصناعية وسكنية، ومصانع إنتاج داخلية، وقوة عاملة قوامها 6,000 شخص.",
};

export default function Page() {
  return <HomePage lang="ar" />;
}
