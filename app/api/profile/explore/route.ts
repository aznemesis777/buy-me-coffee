// app/api/profile/explore/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              about: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              user: {
                username: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {};

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              username: true,
            },
          },
          _count: {
            select: {
              donationsReceived: true,
            },
          },
        },
      }),
      prisma.profile.count({ where: whereClause }),
    ]);

    const profilesWithEarnings = await Promise.all(
      profiles.map(async (profile) => {
        const earnings = await prisma.donation.aggregate({
          where: { recipientId: profile.id },
          _sum: { amount: true },
        });

        return {
          id: profile.id,
          name: profile.name,
          about: profile.about,
          avatarImage: profile.avatarImage,
          backgroundImage: profile.backgroundImage,
          username: profile.user?.username,
          totalDonations: profile._count.donationsReceived,
          totalEarnings: earnings._sum.amount || 0,
          createdAt: profile.createdAt,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      profiles: profilesWithEarnings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Explore profiles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
