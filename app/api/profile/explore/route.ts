// app/api/profile/explore/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const profiles = await prisma.profile.findMany({
      take: limit,
      skip,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            donations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalProfiles = await prisma.profile.count();

    return NextResponse.json({
      success: true,
      profiles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProfiles / limit),
        totalProfiles,
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
