"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./_actions";

export default function OnboardingPage() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");

    try {
      const res = await completeOnboarding(formData);

      if (res?.success) {
        // Reload the user's data from the Clerk API
        await user?.reload();
        router.push("/dashboard");
      }

      if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <form action={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Creator Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Your display name"
          />
          <p className="text-sm text-gray-500 mt-1">
            This is how supporters will see your name
          </p>
        </div>

        <div>
          <label
            htmlFor="about"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            About You *
          </label>
          <textarea
            id="about"
            name="about"
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Tell supporters what you create and why you deserve coffee!"
          />
          <p className="text-sm text-gray-500 mt-1">
            Describe what you create or do
          </p>
        </div>

        <div>
          <label
            htmlFor="socialMediaURL"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Social Media URL
          </label>
          <input
            type="url"
            id="socialMediaURL"
            name="socialMediaURL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://twitter.com/yourhandle"
          />
          <p className="text-sm text-gray-500 mt-1">
            Link to your social media profile (optional)
          </p>
        </div>

        <div>
          <label
            htmlFor="successMessage"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Thank You Message
          </label>
          <textarea
            id="successMessage"
            name="successMessage"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Thank you so much for the coffee! ☕"
          />
          <p className="text-sm text-gray-500 mt-1">
            Message shown to supporters after they buy you coffee (optional)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">Error: {error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Setting up your profile..." : "Complete Setup"}
        </button>
      </form>
    </div>
  );
}
