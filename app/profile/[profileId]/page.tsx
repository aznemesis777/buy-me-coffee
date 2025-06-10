// app/profile/[profileId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import DonationForm from "@/components/DonationForm";

type ProfileData = {
  id: number;
  name: string;
  about?: string;
  avatarImage?: string;
  socialMediaURL?: string;
  backgroundImage?: string;
  successMessage?: string;
  user?: {
    id: number;
    clerkId: string;
    username: string;
    email: string;
  };
  donationsReceived?: Array<{
    id: number;
    amount: number;
    specialMessage?: string;
    createdAt: string;
    donor: {
      username: string;
    };
  }>;
};

export default function ProfilePage() {
  const params = useParams();
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${params.profileId}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
        } else {
          setError("Profile not found");
        }
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (params.profileId) {
      fetchProfile();
    }
  }, [params.profileId]);

  useEffect(() => {
    if (user && profile?.user?.clerkId === user.id) {
      setIsOwnProfile(true);
    } else {
      setIsOwnProfile(false);
    }
  }, [user, profile]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDonationSuccess = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/explore"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border-2 border-blue-200 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                {profile.backgroundImage ? (
                  <Image
                    src={profile.backgroundImage}
                    alt="Profile background"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="relative -mt-12">
                    {profile.avatarImage ? (
                      <Image
                        src={profile.avatarImage}
                        alt={profile.name}
                        width={80}
                        height={80}
                        className="rounded-full border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-xl font-bold text-gray-600">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 pt-2">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {profile.name}
                      </h1>
                      {isOwnProfile && (
                        <Link
                          href="/profile/update"
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                        >
                          Edit page
                        </Link>
                      )}
                    </div>
                    {profile.user?.username && (
                      <p className="text-gray-600">@{profile.user.username}</p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    About {profile.name}
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] border-2 border-dashed border-gray-200">
                    {profile.about ? (
                      <p className="text-gray-700">{profile.about}</p>
                    ) : (
                      <p className="text-gray-500 italic">
                        I'm a typical person who enjoys exploring different
                        things. I also make music art as a hobby. Follow me
                        along.
                      </p>
                    )}
                  </div>
                </div>

                {profile.socialMediaURL && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Social media URL
                    </h3>
                    <a
                      href={profile.socialMediaURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {profile.socialMediaURL}
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Supporters
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-200">
                    {profile.donationsReceived &&
                    profile.donationsReceived.length > 0 ? (
                      <div className="space-y-4">
                        {profile.donationsReceived.map((donation) => (
                          <div
                            key={donation.id}
                            className="border-b border-gray-200 pb-4 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <span className="text-yellow-600 text-sm">
                                    ☕
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    @{donation.donor.username}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(donation.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <span className="text-lg font-bold text-green-600">
                                ${(donation.amount / 100).toFixed(2)}
                              </span>
                            </div>
                            {donation.specialMessage && (
                              <p className="mt-2 text-gray-700 text-sm pl-11">
                                "{donation.specialMessage}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">
                          Be the first one to support {profile.name}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              {user && !isOwnProfile ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Buy {profile.name} a Coffee
                  </h2>
                  <DonationForm
                    recipientId={profile.id}
                    recipientName={profile.name}
                    successMessage={profile.successMessage}
                  />
                </>
              ) : isOwnProfile ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-blue-900 mb-2">
                      This is your profile! 🎉
                    </h2>
                    <p className="text-blue-700 mb-4">
                      This is how others see your profile. Share your link to
                      start receiving support!
                    </p>
                    <div className="space-y-3">
                      <Link
                        href="/profile/update"
                        className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
                      >
                        Edit Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        className="block w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-center"
                      >
                        Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-yellow-900 mb-2">
                      Want to support {profile.name}?
                    </h2>
                    <p className="text-yellow-700 mb-4">
                      Sign in to buy them a coffee and show your support!
                    </p>
                    <div className="space-y-3">
                      <Link
                        href="/sign-in"
                        className="block w-full px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-center"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/sign-up"
                        className="block w-full px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-center"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
