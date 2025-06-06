//app/onboarding/_actions.ts
"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations";

export const completeOnboarding = async (formData: FormData) => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "No logged in user" };
  }

  const data = {
    name: formData.get("name") as string | null,
    username: formData.get("username") as string | null,
    about: formData.get("about") as string | null,
    socialMediaURL: formData.get("socialMediaURL") as string | null,
    successMessage: formData.get("successMessage") as string | null,
    avatarImage: formData.get("avatarImage") as string | null,
    country: formData.get("country") as string | null,
    firstName: formData.get("firstName") as string | null,
    lastName: formData.get("lastName") as string | null,
    cardNumber: formData.get("cardNumber") as string | null,
    expiryMonth: formData.get("expiryMonth") as string | null,
    expiryYear: formData.get("expiryYear") as string | null,
    cvc: formData.get("cvc") as string | null,
  };

  const processedData = {
    ...data,
    name: data.name || "",
    username: data.username || "",
    about: data.about || "",
    country: data.country || "",
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    cardNumber: data.cardNumber || "",
    expiryMonth: data.expiryMonth || "",
    expiryYear: data.expiryYear || "",
    cvc: data.cvc || "",
  };

  const validation = onboardingSchema.safeParse(processedData);

  if (!validation.success) {
    const firstError = validation.error.errors[0];
    return { error: firstError.message };
  }

  const validatedData = validation.data;

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return { error: "Unable to get user email" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true },
    });

    if (existingUser?.profile) {
      return { error: "Profile already exists. Redirecting to dashboard." };
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingUsername = await tx.user.findUnique({
        where: { username: validatedData.username },
      });

      if (existingUsername && existingUsername.clerkId !== userId) {
        throw new Error("Username is already taken");
      }

      let user;
      if (existingUser) {
        if (existingUser.username !== validatedData.username) {
          user = await tx.user.update({
            where: { clerkId: userId },
            data: {
              username: validatedData.username,
            },
          });
        } else {
          user = existingUser;
        }
      } else {
        user = await tx.user.create({
          data: {
            clerkId: userId,
            email: email,
            username: validatedData.username,
          },
        });
      }

      const profile = await tx.profile.create({
        data: {
          name: validatedData.name,
          about: validatedData.about,
          avatarImage: validatedData.avatarImage || null,
          socialMediaURL: validatedData.socialMediaURL || null,
          successMessage: validatedData.successMessage || null,
        },
      });

      const expiryDate = `${validatedData.expiryMonth}/${validatedData.expiryYear}`;
      await tx.bankCard.create({
        data: {
          country: validatedData.country,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          cardNumber: validatedData.cardNumber,
          expiryDate: expiryDate,
          userId: user.id,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { profileId: profile.id },
      });

      return { user, profile };
    });

    const clerkUpdateData: any = {
      publicMetadata: {
        ...clerkUser.publicMetadata,
        onboardingComplete: true,
        profileId: result.profile.id,
        creatorName: validatedData.name,
        username: validatedData.username,
      },

      ...(clerkUser.username !== validatedData.username && {
        username: validatedData.username,
      }),
    };

    if (
      validatedData.firstName &&
      validatedData.firstName !== clerkUser.firstName
    ) {
      clerkUpdateData.firstName = validatedData.firstName;
    }
    if (
      validatedData.lastName &&
      validatedData.lastName !== clerkUser.lastName
    ) {
      clerkUpdateData.lastName = validatedData.lastName;
    }

    if (validatedData.avatarImage) {
      try {
        const response = await fetch(validatedData.avatarImage);
        const blob = await response.blob();

        await client.users.updateUserProfileImage(userId, {
          file: blob,
        });
      } catch (avatarError) {
        console.error("Failed to update Clerk avatar:", avatarError);
      }
    }

    await client.users.updateUser(userId, clerkUpdateData);

    return { success: true };
  } catch (err) {
    console.error("Onboarding error:", err);

    if (err instanceof Error && err.message === "Username is already taken") {
      return {
        error: "This username is already taken. Please choose a different one.",
      };
    }

    return {
      error: "There was an error setting up your profile. Please try again.",
    };
  }
};

export const checkOnboardingStatus = async () => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "No logged in user" };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { profile: true },
  });

  return {
    hasProfile: !!user?.profile,
    isComplete: !!user?.profile,
  };
};
