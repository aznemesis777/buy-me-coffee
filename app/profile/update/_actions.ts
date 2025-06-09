"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  about: z
    .string()
    .min(1, "About section is required")
    .max(500, "About section too long"),
  socialMediaURL: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || "")
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      "Invalid URL"
    ),
  successMessage: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || "")
    .refine((val) => val.length <= 200, "Message too long"),
  avatarImage: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || ""),
  country: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  cardNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(val),
      "Invalid card number format (use: 1234-5678-9012-3456)"
    ),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  cvc: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || (/^\d{3,4}$/.test(val) && val.length >= 3 && val.length <= 4),
      "CVC must be 3-4 digits"
    ),
});

export const updateProfile = async (formData: FormData) => {
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
    country: data.country || undefined,
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
    cardNumber: data.cardNumber || undefined,
    expiryMonth: data.expiryMonth || undefined,
    expiryYear: data.expiryYear || undefined,
    cvc: data.cvc || undefined,
  };

  const validation = updateProfileSchema.safeParse(processedData);

  if (!validation.success) {
    const firstError = validation.error.errors[0];
    return { error: firstError.message };
  }

  const validatedData = validation.data;

  const isBankCardUpdate =
    validatedData.country ||
    validatedData.firstName ||
    validatedData.lastName ||
    validatedData.cardNumber ||
    validatedData.expiryMonth ||
    validatedData.expiryYear ||
    validatedData.cvc;

  if (isBankCardUpdate) {
    if (
      !validatedData.country ||
      !validatedData.firstName ||
      !validatedData.lastName ||
      !validatedData.cardNumber ||
      !validatedData.expiryMonth ||
      !validatedData.expiryYear ||
      !validatedData.cvc
    ) {
      return {
        error:
          "All bank card fields are required when updating payment information",
      };
    }
  }

  try {
    const client = await clerkClient();

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
        bankCard: true,
      },
    });

    if (!existingUser || !existingUser.profile) {
      return { error: "Profile not found. Please complete onboarding first." };
    }

    if (validatedData.username !== existingUser.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: validatedData.username },
      });

      if (existingUsername && existingUsername.clerkId !== userId) {
        return { error: "Username is already taken" };
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      if (validatedData.username !== existingUser.username) {
        await tx.user.update({
          where: { clerkId: userId },
          data: {
            username: validatedData.username,
          },
        });
      }

      const updatedProfile = await tx.profile.update({
        where: { id: existingUser.profile!.id },
        data: {
          name: validatedData.name,
          about: validatedData.about,
          socialMediaURL: validatedData.socialMediaURL || null,
          successMessage: validatedData.successMessage || null,
          ...(validatedData.avatarImage && {
            avatarImage: validatedData.avatarImage,
          }),
        },
      });

      if (
        isBankCardUpdate &&
        validatedData.country &&
        validatedData.firstName &&
        validatedData.lastName &&
        validatedData.cardNumber &&
        validatedData.expiryMonth &&
        validatedData.expiryYear
      ) {
        const expiryDate = `${validatedData.expiryMonth}/${validatedData.expiryYear}`;

        if (existingUser.bankCard) {
          await tx.bankCard.update({
            where: { userId: existingUser.id },
            data: {
              country: validatedData.country,
              firstName: validatedData.firstName,
              lastName: validatedData.lastName,
              cardNumber: validatedData.cardNumber,
              expiryDate: expiryDate,
            },
          });
        } else {
          await tx.bankCard.create({
            data: {
              country: validatedData.country,
              firstName: validatedData.firstName,
              lastName: validatedData.lastName,
              cardNumber: validatedData.cardNumber,
              expiryDate: expiryDate,
              userId: existingUser.id,
            },
          });
        }
      }

      return { profile: updatedProfile };
    });

    const clerkUpdateData: any = {
      publicMetadata: {
        ...(await client.users.getUser(userId)).publicMetadata,
        creatorName: validatedData.name,
        username: validatedData.username,
      },
    };

    if (validatedData.username !== existingUser.username) {
      clerkUpdateData.username = validatedData.username;
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
    console.error("Profile update error:", err);

    if (err instanceof Error && err.message === "Username is already taken") {
      return {
        error: "This username is already taken. Please choose a different one.",
      };
    }

    return {
      error: "There was an error updating your profile. Please try again.",
    };
  }
};

export const getCurrentProfile = async () => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "No logged in user" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
        bankCard: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      profile: user.profile,
      bankCard: user.bankCard
        ? {
            id: user.bankCard.id,
            country: user.bankCard.country,
            firstName: user.bankCard.firstName,
            lastName: user.bankCard.lastName,
            cardNumberLast4: user.bankCard.cardNumber.slice(-4),
            expiryDate: user.bankCard.expiryDate,
          }
        : null,
    };
  } catch (err) {
    console.error("Get profile error:", err);
    return {
      error: "There was an error loading your profile.",
    };
  }
};
