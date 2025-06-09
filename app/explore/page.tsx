// app/explore/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Users, DollarSign, Coffee, ExternalLink } from "lucide-react";

interface Profile {
  id: number;
  name: string;
  about: string;
  avatarImage?: string;
  backgroundImage?: string;
  username: string;
  totalDonations: number;
  totalEarnings: number;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const fetchProfiles = async (page: number = 1, search: string = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(search && { search }),
      });

      const response = await fetch(`/api/profile/explore?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles(currentPage, searchQuery);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProfiles(1, searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const getPaginationRange = () => {
    const range = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(pagination.totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Explore Creators ☕
          </h1>
          <p className="text-gray-600">
            Discover amazing creators and support them with a coffee
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search creators..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
            <button
              onClick={handleSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <Search className="h-5 w-5 text-gray-400 hover:text-green-500" />
            </button>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {pagination.total} creator{pagination.total !== 1 ? "s" : ""}{" "}
              found
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Profiles Grid */}
            {profiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  >
                    {/* Background Image */}
                    {profile.backgroundImage && (
                      <div className="h-24 bg-gradient-to-r from-green-400 to-blue-500 relative">
                        <Image
                          src={profile.backgroundImage}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Avatar */}
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {profile.avatarImage ? (
                            <Image
                              src={profile.avatarImage}
                              alt={profile.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Name and Username */}
                      <div className="text-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {profile.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          @{profile.username}
                        </p>
                      </div>

                      {/* About */}
                      {profile.about && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {profile.about}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex justify-between items-center mb-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Coffee className="w-4 h-4 mr-1" />
                          <span>{profile.totalDonations}</span>
                        </div>
                        <div className="flex items-center text-green-600 font-semibold">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>
                            ${(profile.totalEarnings / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* View Profile Button */}
                      <Link
                        href={`/${profile.username}`}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                      >
                        View Profile
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No creators found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or browse all creators.
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {getPaginationRange().map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? "text-white bg-green-600 border border-green-600"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
