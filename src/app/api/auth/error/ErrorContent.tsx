// app/auth/error/ErrorContent.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ErrorContent() {
  const params = useSearchParams();
  const error = params.get("error");

  useEffect(() => {
    if (error) {
      console.error("Authentication error:", error);
    }
  }, [error]);

  function getErrorMessage(error: string | null) {
    switch (error) {
      case "OAuthSignin":
        return "Error processing OAuth signin";
      case "OAuthCallback":
        return "Error processing OAuth callback";
      case "OAuthCreateAccount":
        return "Error creating user account";
      default:
        return "An unexpected error occurred";
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Authentication Error</h2>
      <p className="mb-4">{getErrorMessage(error)}</p>
      <button
        onClick={() => (window.location.href = "/login")}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Return to Sign In
      </button>
    </div>
  );
}
