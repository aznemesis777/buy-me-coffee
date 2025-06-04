import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
