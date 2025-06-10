// app/[username]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  Coffee,
  DollarSign,
  ExternalLink,
  Users,
  ArrowLeft,
} from "lucide-react";
import DonationForm from "@/components/DonationForm";

type Profile = {
  id: number;
  name: string;
  about: string;
  avatarImage?: string;
  backgroundImage?: string;
  socialMediaURL?: string;
  successMessage?: string;
  totalDonations: number;
  totalEarnings: number;
  user?: {
    id: number;
    clerkId: string;
    username: string;
  };
};

export default function ProfileViewPage() {
  const params = useParams();
  const { user } = useUser();
  const username = params.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (user && profile?.user?.clerkId === user.id) {
      setIsOwnProfile(true);
    } else {
      setIsOwnProfile(false);
    }
  }, [user, profile]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/view/${username}`);
      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
      } else {
        setError(data.error || "Profile not found");
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/explore"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        {profile.backgroundImage ? (
          <div className="h-64 relative">
            <Image
              src={profile.backgroundImage}
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
        )}

        <div className="absolute top-4 left-4">
          <Link
            href="/explore"
            className="inline-flex items-center px-3 py-2 bg-black bg-opacity-50 text-white rounded-md hover:bg-opacity-70 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start">
            <div className="relative -mt-12 sm:-mt-8 mb-4 sm:mb-0 sm:mr-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {profile.avatarImage ? (
                  <Image
                    src={profile.avatarImage}
                    alt={profile.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.name}
              </h1>
              <p className="text-gray-600 mb-4">@{username}</p>

              {profile.about && (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {profile.about}
                </p>
              )}

              <div className="flex justify-center sm:justify-start space-x-6 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center sm:justify-start text-gray-600">
                    <Coffee className="w-5 h-5 mr-1" />
                    <span className="font-semibold text-lg">
                      {profile.totalDonations}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Coffees</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center sm:justify-start text-green-600">
                    <DollarSign className="w-5 h-5 mr-1" />
                    <span className="font-semibold text-lg">
                      {(profile.totalEarnings / 100).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Earned</p>
                </div>
              </div>

              {profile.socialMediaURL && (
                <a
                  href={profile.socialMediaURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Visit Social Media
                </a>
              )}
            </div>
          </div>
        </div>

        {user && !isOwnProfile && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Support {profile.name} ☕
              </h2>
              <p className="text-gray-600">
                Show your appreciation with a coffee donation
              </p>
            </div>

            <DonationForm
              recipientId={profile.id}
              recipientName={profile.name}
              successMessage={profile.successMessage}
            />
          </div>
        )}

        {isOwnProfile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">
                This is your profile! 🎉
              </h2>
              <p className="text-blue-700 mb-4">
                This is how others see your profile. Share your link to start
                receiving support!
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/profile/update"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-yellow-900 mb-2">
                Want to support {profile.name}?
              </h2>
              <p className="text-yellow-700 mb-4">
                Sign in to buy them a coffee and show your support!
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            About {profile.name}
          </h2>
          {profile.about ? (
            <p className="text-gray-700 leading-relaxed">{profile.about}</p>
          ) : (
            <p className="text-gray-500 italic">
              {profile.name} hasn't added a detailed description yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
