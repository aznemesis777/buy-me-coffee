// app/[username]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Coffee,
  DollarSign,
  ExternalLink,
  Users,
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Gift,
} from "lucide-react";

interface Profile {
  id: number;
  name: string;
  about: string;
  avatarImage?: string;
  backgroundImage?: string;
  socialMediaURL?: string;
  successMessage?: string;
  totalDonations: number;
  totalEarnings: number;
}

interface DonationFormData {
  amount: string;
  specialMessage: string;
  socialURLOrBuyMeACoffee: string;
}

export default function ProfileViewPage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationData, setDonationData] = useState<DonationFormData>({
    amount: "",
    specialMessage: "",
    socialURLOrBuyMeACoffee: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username]);

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

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !donationData.amount) return;

    const amount = parseFloat(donationData.amount);
    if (amount < 1) {
      alert("Minimum donation amount is $1.00");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/donation/create-donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: profile.id,
          amount: parseFloat(donationData.amount) * 100, // Convert to cents
          specialMessage: donationData.specialMessage || undefined,
          socialURLOrBuyMeACoffee:
            donationData.socialURLOrBuyMeACoffee || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success message and refresh profile
        alert(profile.successMessage || "Thank you for your support! ☕");
        setShowDonationForm(false);
        setDonationData({
          amount: "",
          specialMessage: "",
          socialURLOrBuyMeACoffee: "",
        });
        fetchProfile(); // Refresh to show updated stats
      } else {
        // Handle validation errors specifically
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details
            .map((err: any) => err.message)
            .join(", ");
          alert(`Validation error: ${errorMessages}`);
        } else {
          alert(data.error || "Failed to process donation");
        }
      }
    } catch (err) {
      alert("Failed to process donation");
    } finally {
      setSubmitting(false);
    }
  };

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Support ${profile?.name} with a coffee`,
          text: `Check out ${profile?.name}'s profile and show your support!`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert("Profile link copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Profile link copied to clipboard!");
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
      {/* Header with background */}
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

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link
            href="/explore"
            className="inline-flex items-center px-3 py-2 bg-black bg-opacity-50 text-white rounded-md hover:bg-opacity-70 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>

        {/* Share button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={shareProfile}
            className="inline-flex items-center px-3 py-2 bg-black bg-opacity-50 text-white rounded-md hover:bg-opacity-70 transition-all"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Info */}
        <div className="relative -mt-16 bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start">
            {/* Avatar */}
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

            {/* Profile Details */}
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

              {/* Stats */}
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

              {/* Social Media Link */}
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

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setShowDonationForm(true)}
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Coffee className="w-5 h-5 mr-2" />
            Buy a Coffee
          </button>
          <button
            onClick={() => setShowDonationForm(true)}
            className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Gift className="w-5 h-5 mr-2" />
            Send Support
          </button>
          <button
            onClick={() => setShowDonationForm(true)}
            className="flex items-center justify-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
          >
            <Heart className="w-5 h-5 mr-2" />
            Show Love
          </button>
        </div>

        {/* Donation Form Modal */}
        {showDonationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Support {profile.name} ☕
              </h2>

              <form onSubmit={handleDonation}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={donationData.amount}
                    onChange={(e) =>
                      setDonationData({
                        ...donationData,
                        amount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="1.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum $1.00</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={donationData.specialMessage}
                    onChange={(e) =>
                      setDonationData({
                        ...donationData,
                        specialMessage: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Say something nice..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Social Media/Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={donationData.socialURLOrBuyMeACoffee}
                    onChange={(e) =>
                      setDonationData({
                        ...donationData,
                        socialURLOrBuyMeACoffee: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://your-social-media.com"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDonationForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !donationData.amount}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Processing..." : "Send Support"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Additional Info Section */}
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
