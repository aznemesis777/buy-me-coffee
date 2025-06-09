// app/api/bank-card/user/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const bankCardSchema = z.object({
  country: z.string().min(1),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  cardNumber: z.string().regex(/^\d{4}-\d{4}-\d{4}-\d{4}$/),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.userId) },
      include: { bankCard: true },
    });

    if (!user || user.clerkId !== clerkUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!user.bankCard) {
      return NextResponse.json(
        { error: "Bank card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bankCard: {
        id: user.bankCard.id,
        country: user.bankCard.country,
        firstName: user.bankCard.firstName,
        lastName: user.bankCard.lastName,
        cardNumberLast4: user.bankCard.cardNumber.slice(-4),
        expiryDate: user.bankCard.expiryDate,
        createdAt: user.bankCard.createdAt,
        updatedAt: user.bankCard.updatedAt,
      },
    });
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
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.userId) },
      include: { bankCard: true },
    });

    if (!user || user.clerkId !== clerkUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (user.bankCard) {
      return NextResponse.json(
        { error: "Bank card already exists" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = bankCardSchema.parse(body);

    const bankCard = await prisma.bankCard.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      bankCard: {
        id: bankCard.id,
        country: bankCard.country,
        firstName: bankCard.firstName,
        lastName: bankCard.lastName,
        cardNumberLast4: bankCard.cardNumber.slice(-4),
        expiryDate: bankCard.expiryDate,
        createdAt: bankCard.createdAt,
        updatedAt: bankCard.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create bank card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
