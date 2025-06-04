// app/api/bank-card/[bankCardId]/route.ts
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
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bankCardId: string } }
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

    const bankCardId = parseInt(params.bankCardId);

    const existingBankCard = await prisma.bankCard.findUnique({
      where: { id: bankCardId },
    });

    if (!existingBankCard || existingBankCard.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = bankCardSchema.parse(body);

    const [month, year] = validatedData.expiryDate.split("/");
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);

    const bankCard = await prisma.bankCard.update({
      where: { id: bankCardId },
      data: {
        country: validatedData.country,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        cardNumber: validatedData.cardNumber,
        expiryDate,
      },
    });

    return NextResponse.json({ success: true, bankCard });
  } catch (error) {
    console.error("Update bank card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
