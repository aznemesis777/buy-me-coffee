// app/api/profile/user/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const createProfileSchema = z.object({
  name: z.string().min(1).max(100),
  about: z.string().min(1).max(500),
  avatarImage: z.string().url().optional(),
  socialMediaURL: z.string().url().optional(),
  backgroundImage: z.string().url().optional(),
  successMessage: z.string().max(200).optional(),
});

const updateProfileSchema = createProfileSchema.partial();

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
      include: { profile: true },
    });

    if (!user || user.clerkId !== clerkUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (user.profile) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createProfileSchema.parse(body);

    const profile = await prisma.profile.create({
      data: validatedData,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { profileId: profile.id },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
