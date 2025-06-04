// app/api/donation/search-donations/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.userId);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const donations = await prisma.donation.findMany({
      where: {
        donorId: userId,
        OR: [
          { specialMessage: { contains: query, mode: "insensitive" } },
          { socialURLOrBuyMeACoffee: { contains: query, mode: "insensitive" } },
          { recipient: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        donor: true,
        recipient: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.error("Search donations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
