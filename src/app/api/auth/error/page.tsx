// app/auth/error/page.tsx
"use client";

import { Suspense } from "react";
import ErrorContent from "./ErrorContent";

export default function ErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense
        fallback={
          <div className="text-center">
            <p>Loading error details...</p>
          </div>
        }
      >
        <ErrorContent />
      </Suspense>
    </main>
  );
}
