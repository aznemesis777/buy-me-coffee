// lib/validations.ts
import { z } from "zod";

export const onboardingSchema = z.object({
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

  country: z.string().min(1, "Country is required"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .regex(/^\d{4}-\d{4}-\d{4}-\d{4}$/, "Invalid card number format"),
  expiryMonth: z.string().min(1, "Expiry month is required"),
  expiryYear: z.string().min(1, "Expiry year is required"),
  cvc: z
    .string()
    .min(3, "CVC must be at least 3 digits")
    .max(4, "CVC must be at most 4 digits")
    .regex(/^\d+$/, "CVC must contain only numbers"),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
