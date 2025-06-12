//app/sign-in/[[...rest]]/page.tsx
"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 bg-gradient-to-br from-yellow-300 to-yellow-500 flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="w-32 h-32 bg-yellow-600 rounded-full flex items-center justify-center mb-8 mx-auto">
            <div className="relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-1 h-6 bg-white rounded-full opacity-80"></div>
              </div>
              <div className="w-16 h-20 bg-white rounded-lg relative">
                <div className="absolute top-2 left-2 right-2 bottom-6 bg-yellow-600 rounded"></div>
                <div className="absolute -right-3 top-6 w-4 h-8 border-4 border-white rounded-r-lg"></div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Fund your creative work
          </h1>
          <p className="text-lg text-gray-700 max-w-md">
            Accept support. Start a membership. Set up a shop. It's easier than
            you think.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-transparent",
                headerTitle: "text-2xl font-semibold text-gray-800",
                headerSubtitle: "text-gray-600",
                formButtonPrimary: "bg-green-600 hover:bg-green-700 text-white",
                formFieldInput: "border border-gray-300 rounded-lg px-4 py-3",
                footerActionLink: "text-green-600 hover:text-green-700",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
