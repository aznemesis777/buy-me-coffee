// app/api/profile/view/[username]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      include: {
        profile: {
          include: {
            _count: {
              select: {
                donationsReceived: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const totalEarnings = await prisma.donation.aggregate({
      where: { recipientId: user.profile.id },
      _sum: { amount: true },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: user.profile.id,
        name: user.profile.name,
        about: user.profile.about,
        avatarImage: user.profile.avatarImage,
        socialMediaURL: user.profile.socialMediaURL,
        backgroundImage: user.profile.backgroundImage,
        successMessage: user.profile.successMessage,
        totalDonations: user.profile._count.donationsReceived,
        totalEarnings: totalEarnings._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
