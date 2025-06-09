// app/api/profile/current-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
        bankCard: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profile: user.profile,
        bankCard: user.bankCard
          ? {
              id: user.bankCard.id,
              country: user.bankCard.country,
              firstName: user.bankCard.firstName,
              lastName: user.bankCard.lastName,
              cardNumberLast4: user.bankCard.cardNumber.slice(-4),
              expiryDate: user.bankCard.expiryDate,
            }
          : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
