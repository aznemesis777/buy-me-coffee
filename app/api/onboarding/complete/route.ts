// app/api/onboarding/complete/route.ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const onboardingData = await request.json();

    // Update user metadata to mark onboarding as complete
    await (
      await clerkClient()
    ).users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
        ...onboardingData,
      },
    });

    // Here you might also save additional data to your database
    // await saveUserOnboardingData(userId, onboardingData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
