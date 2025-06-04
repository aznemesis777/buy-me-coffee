// app/api/profile/user/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createProfileSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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
    const validatedData = createProfileSchema.parse(body);
    const userId = parseInt(params.userId);

    const profile = await prisma.profile.create({
      data: {
        ...validatedData,
        user: {
          connect: { id: userId },
        },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { profileId: profile.id },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Create profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
