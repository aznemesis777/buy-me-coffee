// app/api/profile/[profileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(1),
  about: z.string().optional(),
  avatarImage: z.string().url().optional().or(z.literal("")),
  socialMediaURL: z.string().url().optional().or(z.literal("")),
  backgroundImage: z.string().url().optional().or(z.literal("")),
  successMessage: z.string().optional(),
});

const updateProfileSchema = profileSchema.partial();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { userId } = await auth();
    const { profileId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: parseInt(profileId) },
      include: { user: true },
    });

    if (!profile || !profile.user || profile.user.clerkId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const cleanData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => value !== undefined)
    );

    const updatedProfile = await prisma.profile.update({
      where: { id: parseInt(profileId) },
      data: cleanData,
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params;

    const profile = await prisma.profile.findUnique({
      where: { id: parseInt(profileId) },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        donationsReceived: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            donor: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
