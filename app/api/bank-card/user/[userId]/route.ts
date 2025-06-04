// app/api/bank-card/user/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bankCardSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

async function getCurrentDbUser(clerkUserId: string) {
  return await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    include: { profile: true, bankCard: true },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await getCurrentDbUser(clerkUserId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const requestedUserId = parseInt(params.userId);

    // ✅ FIXED: Authorization check
    if (currentUser.id !== requestedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bankCard = await prisma.bankCard.findUnique({
      where: { userId: requestedUserId },
    });

    return NextResponse.json({ success: true, bankCard });
  } catch (error) {
    console.error("Get bank card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = bankCardSchema.parse(body);
    const userId = parseInt(params.userId);

    // Convert MM/YY to Date
    const [month, year] = validatedData.expiryDate.split("/");
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);

    const bankCard = await prisma.bankCard.create({
      data: {
        country: validatedData.country,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        cardNumber: validatedData.cardNumber,
        expiryDate,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      bankCard,
    });
  } catch (error) {
    console.error("Create bank card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
