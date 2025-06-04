// app/api/donation/total-earnings/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.userId);

    const totalEarnings = await prisma.donation.aggregate({
      where: { donorId: userId },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      totalEarnings: totalEarnings._sum.amount || 0,
    });
  } catch (error) {
    console.error("Get total earnings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
