// app/api/donation/create-donation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const createDonationSchema = z.object({
  amount: z.number().min(100),
  specialMessage: z.string().max(500).optional(),
  socialURLOrBuyMeACoffee: z.string().url().optional(),
  recipientId: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const donor = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
      },
    });

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = createDonationSchema.parse(body);

    const recipient = await prisma.profile.findUnique({
      where: { id: validatedData.recipientId },
      include: {
        user: true,
      },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    if (donor.profileId === validatedData.recipientId) {
      return NextResponse.json(
        { error: "You cannot donate to yourself" },
        { status: 400 }
      );
    }

    if (recipient.user && recipient.user.id === donor.id) {
      return NextResponse.json(
        { error: "You cannot donate to yourself" },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.create({
      data: {
        amount: validatedData.amount,
        specialMessage: validatedData.specialMessage,
        socialURLOrBuyMeACoffee: validatedData.socialURLOrBuyMeACoffee,
        donorId: donor.id,
        recipientId: validatedData.recipientId,
      },
      include: {
        donor: {
          select: {
            username: true,
            email: true,
          },
        },
        recipient: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      donation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create donation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
