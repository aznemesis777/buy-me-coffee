// app/api/donation/create-donation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createDonationSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

async function getCurrentDbUser(clerkUserId: string) {
  return await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    include: { profile: true, bankCard: true },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIXED: Get database user using clerkId
    const currentUser = await getCurrentDbUser(clerkUserId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = createDonationSchema.parse(body);

    const donation = await prisma.donation.create({
      data: {
        amount: validatedData.amount,
        specialMessage: validatedData.specialMessage,
        socialURLOrBuyMeACoffee: validatedData.socialURLOrBuyMeACoffee,
        donorId: currentUser.id, // ✅ Now using correct database ID
        recipientId: validatedData.recipientId,
      },
      include: { donor: true, recipient: true },
    });

    return NextResponse.json({ success: true, donation });
  } catch (error) {
    console.error("Create donation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
