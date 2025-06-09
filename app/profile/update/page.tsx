//app/profile/update/page.tsx
"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { updateProfile } from "./_actions";

export default function UpdateProfilePage() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string>("");
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [showBankCard, setShowBankCard] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    username: "",
    about: "",
    socialMediaURL: "",
    successMessage: "",
    country: "",
    firstName: "",
    lastName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
  });

  const { user } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/profile/current-user");
        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.profile) {
            const bankCard = data.user.bankCard;
            const expiryParts = bankCard?.expiryDate?.split("/") || ["", ""];

            setFormData({
              name: data.user.profile.name || "",
              username: data.user.username || "",
              about: data.user.profile.about || "",
              socialMediaURL: data.user.profile.socialMediaURL || "",
              successMessage: data.user.profile.successMessage || "",
              country: bankCard?.country || "",
              firstName: bankCard?.firstName || "",
              lastName: bankCard?.lastName || "",
              cardNumber: bankCard
                ? `****-****-****-${bankCard.cardNumberLast4}`
                : "",
              expiryMonth: expiryParts[0] || "",
              expiryYear: expiryParts[1] || "",
              cvc: "",
            });

            setShowBankCard(!!bankCard);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const formatted = value
        .replace(/\D/g, "")
        .replace(/(\d{4})(?=\d)/g, "$1-")
        .substring(0, 19);
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
      return;
    }

    if (name === "cvc") {
      const formatted = value.replace(/\D/g, "").substring(0, 4);
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const submitFormData = new FormData();

      submitFormData.set("name", formData.name);
      submitFormData.set("username", formData.username);
      submitFormData.set("about", formData.about);
      submitFormData.set("socialMediaURL", formData.socialMediaURL);
      submitFormData.set("successMessage", formData.successMessage);

      if (avatarPreview) {
        submitFormData.set("avatarImage", avatarPreview);
      }

      if (showBankCard) {
        if (formData.country) submitFormData.set("country", formData.country);
        if (formData.firstName)
          submitFormData.set("firstName", formData.firstName);
        if (formData.lastName)
          submitFormData.set("lastName", formData.lastName);
        if (formData.cardNumber && !formData.cardNumber.includes("*")) {
          submitFormData.set("cardNumber", formData.cardNumber);
        }
        if (formData.expiryMonth)
          submitFormData.set("expiryMonth", formData.expiryMonth);
        if (formData.expiryYear)
          submitFormData.set("expiryYear", formData.expiryYear);
        if (formData.cvc) submitFormData.set("cvc", formData.cvc);
      }

      const res = await updateProfile(submitFormData);

      if (res?.success) {
        setSuccess(true);
        await user?.reload();

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 10; i++) {
      years.push(i.toString());
    }
    return years;
  };

  const monthOptions = [
    { value: "01", label: "01 - January" },
    { value: "02", label: "02 - February" },
    { value: "03", label: "03 - March" },
    { value: "04", label: "04 - April" },
    { value: "05", label: "05 - May" },
    { value: "06", label: "06 - June" },
    { value: "07", label: "07 - July" },
    { value: "08", label: "08 - August" },
    { value: "09", label: "09 - September" },
    { value: "10", label: "10 - October" },
    { value: "11", label: "11 - November" },
    { value: "12", label: "12 - December" },
  ];

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-6">✅</div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Profile Updated Successfully!
              </h2>
              <p className="text-gray-600">
                Your profile has been updated successfully
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <p className="text-green-700 text-sm mt-2">
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Update Your Profile
          </h1>
          <p className="text-gray-600">
            Update your profile information and payment settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Current Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No image</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
          </div>

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
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Choose a unique username"
              pattern="[a-zA-Z0-9_]+"
              minLength={3}
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              3-20 characters, letters, numbers, and underscores only
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
              value={formData.about}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Tell supporters what you create and why you deserve coffee!"
            />
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
              value={formData.socialMediaURL}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://twitter.com/yourhandle"
            />
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
              value={formData.successMessage}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Thank you so much for the coffee! ☕"
            />
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Payment Information
              </h3>
              <button
                type="button"
                onClick={() => setShowBankCard(!showBankCard)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                {showBankCard ? "Hide" : "Show"} Bank Card
              </button>
            </div>

            {showBankCard && (
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="United States"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="1234-5678-9012-3456"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="expiryMonth"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Expiry Month
                    </label>
                    <select
                      id="expiryMonth"
                      name="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Month</option>
                      {monthOptions.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="expiryYear"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Expiry Year
                    </label>
                    <select
                      id="expiryYear"
                      name="expiryYear"
                      value={formData.expiryYear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Year</option>
                      {generateYearOptions().map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="cvc"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      CVC
                    </label>
                    <input
                      type="text"
                      id="cvc"
                      name="cvc"
                      value={formData.cvc}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                  <p className="text-blue-700 text-sm">
                    💡 <strong>Note:</strong> Your payment information is
                    securely stored and only used for processing donations you
                    receive.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              disabled={loading}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">Error: {error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
