// app/layout.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import "./globals.css";

function LoadingSpinner() {
  return (
    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 ml-2"></div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleDashboardClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);

    setTimeout(() => {
      router.push("/dashboard");
      setTimeout(() => setIsNavigating(false), 100);
    }, 200);
  };

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
      appearance={{
        variables: {
          colorPrimary: "#10B981",
        },
      }}
    >
      <html lang="en">
        <body>
          <header className="flex justify-between items-center p-4 bg-white shadow-sm border-b">
            <div
              onClick={handleDashboardClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="text-2xl">☕</div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                Buy Me a Coffee
                {isNavigating && <LoadingSpinner />}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <SignedOut>
                <button
                  onClick={() => router.push("/sign-in")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/sign-up")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Get Started
                </button>
              </SignedOut>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
              </SignedIn>
            </div>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
