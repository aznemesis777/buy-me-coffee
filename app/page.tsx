// // app/page.tsx
// "use client";
// import { useUser } from "@clerk/nextjs";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// type DatabaseUser = {
//   id: number;
//   clerkId: string;
//   email: string;
//   username: string;
//   profile?: {
//     id: number;
//     name: string;
//     about?: string;
//     avatarImage?: string;
//   };
//   bankCard?: {
//     id: number;
//     country: string;
//     firstName: string;
//     lastName: string;
//   };
// };

const MainPage = () => {
  //   const { user, isLoaded } = useUser();
  //   const router = useRouter();
  //   const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  //   const [loading, setLoading] = useState(true);
  //   useEffect(() => {
  //     const syncUser = async () => {
  //       if (!isLoaded || !user) {
  //         setLoading(false);
  //         return;
  //       }
  //       const onboardingComplete = user.publicMetadata?.onboardingComplete;
  //       if (!onboardingComplete) {
  //         router.push("/profile/create");
  //         return;
  //       }
  //       try {
  //         const response = await fetch("/api/users/sync", {
  //           method: "POST",
  //         });
  //         if (response.ok) {
  //           const data = await response.json();
  //           setDbUser(data.user);
  //         } else {
  //           console.error("Failed to sync user");
  //         }
  //       } catch (error) {
  //         console.error("Error syncing user:", error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     syncUser();
  //   }, [user, isLoaded, router]);
  //   if (loading) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
  //           <p className="text-gray-600">Loading your dashboard...</p>
  //         </div>
  //       </div>
  //     );
  //   }
  //   if (!user) {
  //     return (
  //       <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
  //         <div className="container mx-auto px-4 py-16">
  //           <div className="text-center max-w-4xl mx-auto">
  //             <div className="text-6xl mb-6">☕</div>
  //             <h1 className="text-5xl font-bold text-gray-900 mb-6">
  //               Support Creators with Coffee
  //             </h1>
  //             <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
  //               Buy coffee for your favorite creators and content makers. Show
  //               appreciation for their work with a simple gesture.
  //             </p>
  //             <div className="flex justify-center gap-4">
  //               <Link
  //                 href="/sign-up"
  //                 className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors"
  //               >
  //                 Start Supporting Creators
  //               </Link>
  //               <Link
  //                 href="/browse"
  //                 className="px-8 py-4 border-2 border-green-600 text-green-600 text-lg font-semibold rounded-lg hover:bg-green-50 transition-colors"
  //               >
  //                 Browse Creators
  //               </Link>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }
  //   const profileComplete = dbUser?.profile;
  //   const paymentComplete = dbUser?.bankCard;
  //   const setupProgress = (profileComplete ? 1 : 0) + (paymentComplete ? 1 : 0);
  // return (
  //   <div className="min-h-screen bg-gray-50">
  //     <div className="container mx-auto px-4 py-8">
  //       <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
  //         <div className="flex items-start justify-between">
  //           <div>
  //             <h1 className="text-3xl font-bold text-gray-900 mb-2">
  //               Welcome back, {user.firstName || user.username || "Creator"}! ☕
  //             </h1>
  //             <p className="text-gray-600">
  //               Ready to support amazing creators or receive some coffee love?
  //             </p>
  //           </div>
  //           <div className="text-right">
  //             <div className="text-sm text-gray-500">Setup Progress</div>
  //             <div className="text-2xl font-bold text-green-600">
  //               {setupProgress}/2
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //       <div className="grid md:grid-cols-2 gap-6 mb-8">
  //         <div
  //           className={`p-6 rounded-xl border-2 ${
  //             profileComplete
  //               ? "bg-green-50 border-green-200"
  //               : "bg-yellow-50 border-yellow-200"
  //           }`}
  //         >
  //           <div className="flex items-start justify-between mb-4">
  //             <div>
  //               <h3
  //                 className={`text-lg font-semibold ${
  //                   profileComplete ? "text-green-800" : "text-yellow-800"
  //                 }`}
  //               >
  //                 {profileComplete
  //                   ? "✅ Creator Profile"
  //                   : "📝 Create Your Profile"}
  //               </h3>
  //               <p
  //                 className={`text-sm ${
  //                   profileComplete ? "text-green-700" : "text-yellow-700"
  //                 }`}
  //               >
  //                 {profileComplete
  //                   ? "Your profile is ready to receive donations!"
  //                   : "Set up your profile to start receiving coffee donations"}
  //               </p>
  //             </div>
  //           </div>
  //           {profileComplete ? (
  //             <div className="space-y-2">
  //               <p className="text-sm">
  //                 <strong>Name:</strong> {dbUser?.profile?.name}
  //               </p>
  //               {dbUser?.profile?.about && (
  //                 <p className="text-sm">
  //                   <strong>About:</strong>{" "}
  //                   {dbUser.profile.about.substring(0, 100)}...
  //                 </p>
  //               )}
  //               <div className="flex gap-2 mt-4">
  //                 <Link
  //                   href="/profile/edit"
  //                   className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
  //                 >
  //                   Edit Profile
  //                 </Link>
  //                 <Link
  //                   href={`/profile/${dbUser?.id}`}
  //                   className="px-4 py-2 border border-green-600 text-green-600 text-sm rounded-lg hover:bg-green-50"
  //                 >
  //                   View Public Profile
  //                 </Link>
  //               </div>
  //             </div>
  //           ) : (
  //             <Link
  //               href="/profile/create"
  //               className="inline-block px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
  //             >
  //               Create Profile
  //             </Link>
  //           )}
  //         </div>
  //         <div
  //           className={`p-6 rounded-xl border-2 ${
  //             paymentComplete
  //               ? "bg-green-50 border-green-200"
  //               : "bg-blue-50 border-blue-200"
  //           }`}
  //         >
  //           <div className="flex items-start justify-between mb-4">
  //             <div>
  //               <h3
  //                 className={`text-lg font-semibold ${
  //                   paymentComplete ? "text-green-800" : "text-blue-800"
  //                 }`}
  //               >
  //                 {paymentComplete
  //                   ? "✅ Payment Method"
  //                   : "💳 Add Payment Method"}
  //               </h3>
  //               <p
  //                 className={`text-sm ${
  //                   paymentComplete ? "text-green-700" : "text-blue-700"
  //                 }`}
  //               >
  //                 {paymentComplete
  //                   ? "Ready to receive donations!"
  //                   : "Add your bank card to receive coffee donations"}
  //               </p>
  //             </div>
  //           </div>
  //           {paymentComplete ? (
  //             <div className="space-y-2">
  //               <p className="text-sm">
  //                 <strong>Name:</strong> {dbUser?.bankCard?.firstName}{" "}
  //                 {dbUser?.bankCard?.lastName}
  //               </p>
  //               <p className="text-sm">
  //                 <strong>Country:</strong> {dbUser?.bankCard?.country}
  //               </p>
  //               <div className="flex gap-2 mt-4">
  //                 <Link
  //                   href="/payment/edit"
  //                   className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
  //                 >
  //                   Update Payment
  //                 </Link>
  //               </div>
  //             </div>
  //           ) : (
  //             <Link
  //               href="/payment/add"
  //               className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
  //             >
  //               Add Bank Card
  //             </Link>
  //           )}
  //         </div>
  //       </div>
  //       <div className="bg-white rounded-xl shadow-sm p-6">
  //         <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
  //         <div className="grid sm:grid-cols-3 gap-4">
  //           <Link
  //             href="/browse"
  //             className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center"
  //           >
  //             <div className="text-2xl mb-2">🔍</div>
  //             <h3 className="font-medium">Browse Creators</h3>
  //             <p className="text-sm text-gray-600">Find creators to support</p>
  //           </Link>
  //           <Link
  //             href="/donations"
  //             className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center"
  //           >
  //             <div className="text-2xl mb-2">💝</div>
  //             <h3 className="font-medium">My Donations</h3>
  //             <p className="text-sm text-gray-600">View donation history</p>
  //           </Link>
  //           <Link
  //             href="/account"
  //             className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center"
  //           >
  //             <div className="text-2xl mb-2">⚙️</div>
  //             <h3 className="font-medium">Account Settings</h3>
  //             <p className="text-sm text-gray-600">Manage your account</p>
  //           </Link>
  //         </div>
  //       </div>
  //       <div className="mt-8 bg-gray-100 p-4 rounded-lg">
  //         <h3 className="font-semibold mb-2 text-gray-700">Account Details</h3>
  //         <div className="grid sm:grid-cols-3 gap-4 text-sm">
  //           <p>
  //             <strong>Email:</strong> {dbUser?.email}
  //           </p>
  //           <p>
  //             <strong>Username:</strong> {dbUser?.username}
  //           </p>
  //           <p>
  //             <strong>Member ID:</strong> #{dbUser?.id}
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default MainPage;
