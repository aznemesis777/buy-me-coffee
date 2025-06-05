"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const completeOnboarding = async (formData: FormData) => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "No logged in user" };
  }

  const name = formData.get("name") as string;
  const about = formData.get("about") as string;
  const socialMediaURL = formData.get("socialMediaURL") as string;
  const successMessage = formData.get("successMessage") as string;

  // Validate inputs
  if (!name || !about) {
    return { error: "Please fill in all required fields" };
  }

  try {
    const client = await clerkClient();

    // Get user's email from Clerk
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return { error: "Unable to get user email" };
    }

    // Create or update user and profile in database
    const result = await prisma.$transaction(async (tx) => {
      // Create or update user
      const user = await tx.user.upsert({
        where: { clerkId: userId },
        update: {
          email: email,
        },
        create: {
          clerkId: userId,
          email: email,
          username: email.split("@")[0] + "_" + Date.now(), // Generate unique username
        },
      });

      // Create profile
      const profile = await tx.profile.create({
        data: {
          name,
          about,
          socialMediaURL: socialMediaURL || null,
          successMessage: successMessage || null,
        },
      });

      // Update user with profile reference
      await tx.user.update({
        where: { id: user.id },
        data: { profileId: profile.id },
      });

      return { user, profile };
    });

    // Update Clerk user metadata
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        profileId: result.profile.id,
        creatorName: name,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Onboarding error:", err);
    return {
      error: "There was an error setting up your profile. Please try again.",
    };
  }
};
