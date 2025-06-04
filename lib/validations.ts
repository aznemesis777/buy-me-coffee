// lib/validations.ts
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
});

export const createDonationSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
  specialMessage: z.string().optional(),
  socialURLOrBuyMeACoffee: z.string().url().optional(),
  recipientId: z.number().int().positive(),
});

export const createProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  about: z.string().optional(),
  avatarImage: z.string().url().optional(),
  socialMediaURL: z.string().url().optional(),
  backgroundImage: z.string().url().optional(),
  successMessage: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  about: z.string().optional(),
  avatarImage: z.string().url().optional(),
  socialMediaURL: z.string().url().optional(),
  backgroundImage: z.string().url().optional(),
  successMessage: z.string().optional(),
});

export const bankCardSchema = z.object({
  country: z.string().min(1, "Country is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  cardNumber: z.string().min(16, "Card number must be at least 16 digits"),
  expiryDate: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Expiry date must be in MM/YY format"),
});
