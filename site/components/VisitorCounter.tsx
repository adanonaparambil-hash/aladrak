"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n-client";

// One shared hosted counter across every route and language. This measures
// page views, not unique people; never seed it with an invented historical total.
const COUNTER_URL = "https://hits.sh/aladrak.vercel.app.svg?label=Site%20views&color=183d35&labelColor=183d35&style=flat-square";

export default function VisitorCounter() {
  const locale = useLocale();
  const [unavailable, setUnavailable] = useState(false);
  const arabic = locale === "ar";

  return (
    <div className="inline-flex rounded-full border border-gold/25 bg-white/[0.03] px-3 py-2">
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-cream/70">
        <svg aria-hidden="true" className="h-4 w-4 text-gold/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
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
            src={arabic ? COUNTER_URL.replace("label=Site%20views", `label=${encodeURIComponent("المشاهدات")}`) : COUNTER_URL}
            alt={arabic ? "عدّاد مشاهدات الموقع" : "Site view counter"}
            title={arabic ? "المشاهدات منذ تفعيل العدّاد، وليست عدد الزوار الفريدين" : "Views since the counter was enabled, not unique visitors"}
            className="h-6 w-auto rounded-sm"
            referrerPolicy="no-referrer"
            onError={() => setUnavailable(true)}
          />
        )}
      </div>
    </div>
  );
}