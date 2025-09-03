// app/api/bank-card/[bankCardId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const bankCardSchema = z.object({
  country: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date format (MM/YY)"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

const updateBankCardSchema = bankCardSchema.partial();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bankCardId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params promise
    const { bankCardId } = await params;

    const bankCard = await prisma.bankCard.findUnique({
      where: { id: parseInt(bankCardId) },
      include: { user: true },
    });

    if (!bankCard || bankCard.user.clerkId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateBankCardSchema.parse(body);

    const updatedBankCard = await prisma.bankCard.update({
      where: { id: parseInt(bankCardId) },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      bankCard: {
        id: updatedBankCard.id,
        country: updatedBankCard.country,
        firstName: updatedBankCard.firstName,
        lastName: updatedBankCard.lastName,
        cardNumberLast4: updatedBankCard.cardNumber.slice(-4),
        expiryDate: updatedBankCard.expiryDate,
        createdAt: updatedBankCard.createdAt,
        updatedAt: updatedBankCard.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Update bank card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}