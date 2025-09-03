// app/api/donation/total-earnings/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        totalEarnings: 0,
        totalDonations: 0,
      });
    }

    const result = await prisma.donation.aggregate({
      where: { recipientId: user.profile.id },
      _sum: { amount: true },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      totalEarnings: result._sum.amount || 0,
      totalDonations: result._count,
    });
  } catch (error) {
    console.error("Get total earnings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}