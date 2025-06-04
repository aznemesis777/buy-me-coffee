// app/api/profile/[profileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateProfileSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);
    const profileId = parseInt(params.profileId);

    const profile = await prisma.profile.update({
      where: { id: profileId },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
