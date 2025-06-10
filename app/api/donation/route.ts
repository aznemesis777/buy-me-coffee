// app/api/donations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const donationSchema = z.object({
  amount: z.number().min(1, "Amount must be at least $1"),
  specialMessage: z.string().optional(),
  socialURLOrBuyMeACoffee: z.string().url().optional().or(z.literal("")),
  recipientId: z.number().int().positive("Invalid recipient ID"),
});

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const donor = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = donationSchema.parse(body);

    const recipientProfile = await prisma.profile.findUnique({
      where: { id: validatedData.recipientId },
      include: { user: true },
    });

    if (!recipientProfile) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    if (recipientProfile.user?.clerkId === clerkUserId) {
      return NextResponse.json(
        { error: "You cannot donate to yourself" },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.create({
      data: {
        amount: validatedData.amount,
        specialMessage: validatedData.specialMessage || null,
        socialURLOrBuyMeACoffee: validatedData.socialURLOrBuyMeACoffee || null,
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
            successMessage: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      donation,
      message: "Donation created successfully",
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

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type");
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let donations;
    let total;

    if (type === "received" && user.profile) {
      [donations, total] = await Promise.all([
        prisma.donation.findMany({
          where: { recipientId: user.profile.id },
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
        prisma.donation.count({
          where: { recipientId: user.profile.id },
        }),
      ]);
    } else {
      [donations, total] = await Promise.all([
        prisma.donation.findMany({
          where: { donorId: user.id },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            recipient: {
              select: {
                name: true,
                avatarImage: true,
              },
            },
          },
        }),
        prisma.donation.count({
          where: { donorId: user.id },
        }),
      ]);
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      donations,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Get donations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
