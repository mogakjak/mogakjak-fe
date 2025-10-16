"use client";

import { Suspense } from "react";
import OAuthCallbackInner from "./callbackInner";

export const dynamic = "force-dynamic";

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-body1-16M text-gray-600">로그인 중…</p>
        </div>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}
