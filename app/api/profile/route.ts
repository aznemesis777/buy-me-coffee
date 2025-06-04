import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findFirst({
      where: { user: { clerkId: userId } },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 400 }
      );
    }

    // Create the profile
    const profile = await prisma.profile.create({
      data: {
        name: data.name,
        about: data.about || null,
        avatarImage: data.avatarImage || null,
        socialMediaURL: data.socialMediaURL || null,
        backgroundImage: data.backgroundImage || null,
        successMessage: data.successMessage || null,
      },
    });

    // Update user to link with profile
    await prisma.user.update({
      where: { id: user.id },
      data: { profileId: profile.id },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Profile creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
