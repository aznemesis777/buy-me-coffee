//app/dashboard/layout.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

type ProfileData = {
  id: number;
  name: string;
  avatarImage?: string;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile/current-user");
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setProfile(data.user.profile);
            setUsername(data.user.username);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const navigation = [
    { name: "Home", href: "/dashboard", current: pathname === "/dashboard" },
    { name: "Explore", href: "/explore", current: pathname === "/explore" },
    {
      name: "View page",
      href: profile ? `/profile/${profile.id}` : "#",
      current: false,
      external: true,
    },
    {
      name: "Account settings",
      href: "/profile/update",
      current: pathname === "/profile/update",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <div className="w-64 pr-8">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  {...(item.external && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                >
                  {item.name}
                  {item.external && (
                    <svg
                      className="ml-2 w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
