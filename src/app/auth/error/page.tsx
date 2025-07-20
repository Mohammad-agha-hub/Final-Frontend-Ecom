"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    OAuthSignin: "Error processing OAuth sign-in",
    OAuthCallback: "Error processing OAuth callback",
    OAuthCreateAccount: "Error creating user account",
    default: "An unexpected error occurred",
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          Authentication Error
        </h1>
        <p className="mb-6">{errorMessages[error || "default"]}</p>
        <Link
          href="/auth/signIn"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded block text-center"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
