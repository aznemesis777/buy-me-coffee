//app/onboarding/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { profile: true },
  });

  if (user?.profile || sessionClaims?.metadata?.onboardingComplete === true) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">☕</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to Buy Me a Coffee!
            </h1>
            <p className="text-gray-600">Let's set up your creator profile</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
