// components/DonationForm.tsx
"use client";

import { useState } from "react";
import { Coffee, Heart, Gift, Star } from "lucide-react";

interface DonationFormProps {
  recipientId: number;
  recipientName: string;
  successMessage?: string;
}

const predefinedAmounts = [
  { amount: 300, label: "$3", coffees: 1, icon: Coffee },
  { amount: 500, label: "$5", coffees: 1, icon: Coffee },
  { amount: 1000, label: "$10", coffees: 2, icon: Heart },
  { amount: 1500, label: "$15", coffees: 3, icon: Gift },
  { amount: 2000, label: "$20", coffees: 4, icon: Star },
];

export default function DonationForm({
  recipientId,
  recipientName,
  successMessage,
}: DonationFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [socialUrl, setSocialUrl] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(Math.round(numValue * 100));
    }
  };

  const getCurrentAmount = () => {
    if (isCustom && customAmount) {
      const numValue = parseFloat(customAmount);
      return !isNaN(numValue) && numValue > 0 ? Math.round(numValue * 100) : 0;
    }
    return selectedAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = getCurrentAmount();
    if (amount <= 0) return;

    setLoading(true);

    try {
      // Use your existing API route
      const response = await fetch("/api/donation/create-donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          recipientId,
          specialMessage: message.trim() || undefined,
          socialURLOrBuyMeACoffee: socialUrl.trim() || undefined,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        // Reset form
        setMessage("");
        setSocialUrl("");
        setCustomAmount("");
        setSelectedAmount(500);
        setIsCustom(false);

        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to process donation");
      }
    } catch (error) {
      console.error("Donation error:", error);
      alert("Failed to process donation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Thank you for your support! ☕
        </h3>
        <p className="text-gray-600 mb-4">
          {successMessage ||
            `Your coffee donation to ${recipientName} was successful!`}
        </p>
        <button
          onClick={() => setShowSuccess(false)}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Send another coffee
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      {/* Amount Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose an amount
        </label>

        {/* Predefined amounts */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {predefinedAmounts.map(({ amount, label, coffees, icon: Icon }) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleAmountSelect(amount)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedAmount === amount && !isCustom
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <Icon className="w-4 h-4 mr-1" />
                <span className="font-semibold">{label}</span>
              </div>
              <div className="text-xs text-gray-500">
                {coffees} coffee{coffees > 1 ? "s" : ""}
              </div>
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">$</span>
          </div>
          <input
            type="number"
            min="1"
            step="0.01"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            placeholder="Custom amount"
            className={`block w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
              isCustom
                ? "border-green-500 focus:ring-green-500"
                : "border-gray-300 focus:ring-green-500 focus:border-green-500"
            }`}
          />
        </div>
      </div>

      {/* Message */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Say something nice (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Say something nice to ${recipientName}...`}
          rows={3}
          maxLength={500}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none"
        />
        <div className="text-xs text-gray-500 mt-1">
          {message.length}/500 characters
        </div>
      </div>

      {/* Social URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your social media or website (optional)
        </label>
        <input
          type="url"
          value={socialUrl}
          onChange={(e) => setSocialUrl(e.target.value)}
          placeholder="https://twitter.com/yourhandle"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || getCurrentAmount() <= 0}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          <Coffee className="w-5 h-5 mr-2" />
        )}
        {loading
          ? "Processing..."
          : `Support with $${(getCurrentAmount() / 100).toFixed(2)}`}
      </button>

      {/* Security note */}
      <p className="text-xs text-gray-500 text-center mt-4">
        🔒 Your payment is processed securely. We never store your payment
        information.
      </p>
    </form>
  );
}
