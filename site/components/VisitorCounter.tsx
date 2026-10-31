"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n-client";

// One shared hosted counter across every route and language. This measures
// page views, not unique people; never seed it with an invented historical total.
const COUNTER_URL = "https://hits.sh/aladrak.vercel.app.svg?label=Views&color=c5a46d&labelColor=183d35";

export default function VisitorCounter() {
  const locale = useLocale();
  const [unavailable, setUnavailable] = useState(false);
  const arabic = locale === "ar";

  return (
    <div className="border-t border-white/10 py-5 px-6 text-center">
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-cream/70">
        <span>{arabic ? "إجمالي مشاهدات الموقع" : "Total site views"}</span>
        {unavailable ? (
          <span className="text-xs">{arabic ? "العدّاد غير متاح مؤقتًا" : "Counter temporarily unavailable"}</span>
        ) : (
          // Use the original image: optimization/caching would prevent counting visits.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={(img) => {
              // An external image can fail before React attaches onError.
              if (img?.complete && img.naturalWidth === 0) setUnavailable(true);
            }}
            src={COUNTER_URL}
            alt={arabic ? "عدّاد مشاهدات الموقع" : "Site view counter"}
            title={arabic ? "المشاهدات منذ تفعيل العدّاد، وليست عدد الزوار الفريدين" : "Views since the counter was enabled, not unique visitors"}
            className="h-5 w-auto"
            referrerPolicy="no-referrer"
            onError={() => setUnavailable(true)}
          />
        )}
      </div>
    </div>
  );
}