// app/api/donation/search-donations/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Await the params promise
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.clerkId !== clerkUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!user.profile) {
      return NextResponse.json({
        success: true,
        donations: [],
        total: 0,
        page,
        totalPages: 0,
      });
    }

    const whereClause = {
      recipientId: user.profile.id,
      ...(query && {
        OR: [
          {
            specialMessage: {
              contains: query,
              mode: "insensitive" as const,
            },
          },
          {
            donor: {
              username: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
          },
        ],
      }),
    };

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          donor: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      }),
      prisma.donation.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      donations,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Search donations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}