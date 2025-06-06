//app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!sessionClaims?.metadata?.onboardingComplete) {
    redirect("/onboarding");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      profile: {
        include: {
          donationsReceived: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
              donor: {
                select: {
                  username: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              donationsReceived: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.profile) {
    redirect("/onboarding");
  }

  const totalEarnings = await prisma.donation.aggregate({
    where: { recipientId: user.profile.id },
    _sum: { amount: true },
  });

  const profile = user.profile;
  const recentDonations = profile.donationsReceived;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile.name}! ☕
        </h1>
        <p className="text-gray-600">Here's how your coffee fund is doing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">💰</div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Earnings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${((totalEarnings._sum.amount || 0) / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">☕</div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Coffees Received
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {profile._count.donationsReceived}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="mt-1 text-gray-900">{profile.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                About
              </label>
              <p className="mt-1 text-gray-900">{profile.about}</p>
            </div>
            {profile.socialMediaURL && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Social Media
                </label>
                <a
                  href={profile.socialMediaURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-green-600 hover:text-green-700"
                >
                  {profile.socialMediaURL}
                </a>
              </div>
            )}
            {profile.successMessage && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Thank You Message
                </label>
                <p className="mt-1 text-gray-900">{profile.successMessage}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Coffee Link
              </label>
              <div className="mt-1 flex items-center">
                <code className="bg-gray-100 px-3 py-2 rounded text-sm">
                  {process.env.NODE_ENV === "production"
                    ? `https://yourapp.com/profile/${profile.id}`
                    : `http://localhost:3000/profile/${profile.id}`}
                </code>
                <button className="ml-2 text-green-600 hover:text-green-700 text-sm font-medium">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Donations
          </h2>
          {recentDonations.length > 0 ? (
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {donation.donor.username || "Anonymous"}
                      </p>
                      {donation.specialMessage && (
                        <p className="text-gray-600 mt-1">
                          "{donation.specialMessage}"
                        </p>
                      )}
                      {donation.socialURLOrBuyMeACoffee && (
                        <a
                          href={donation.socialURLOrBuyMeACoffee}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 text-sm mt-1 block"
                        >
                          {donation.socialURLOrBuyMeACoffee}
                        </a>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-green-600 font-semibold">
                      ${(donation.amount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No donations yet. Share your link to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
