// app/api/users/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(_request: NextRequest) {
  try {
    console.log("Starting user sync...");

    const { userId } = await auth();
    console.log("Clerk userId:", userId);

    const user = await currentUser();
    console.log("Clerk user:", user ? "found" : "not found");

    if (!userId || !user) {
      console.log("Missing userId or user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Checking if user exists in database...");
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
        bankCard: true,
      },
    });
    console.log("Existing user:", dbUser ? "found" : "not found");

    if (!dbUser) {
      const email = user.emailAddresses[0]?.emailAddress;
      const username =
        user.username || user.firstName || email?.split("@")[0] || "user";

      console.log(
        "Creating new user with email:",
        email,
        "username:",
        username
      );

      if (!email) {
        console.log("No email found");
        return NextResponse.json({ error: "Email not found" }, { status: 400 });
      }

      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: email,
          username: username,
        },
        include: {
          profile: true,
          bankCard: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        username: dbUser.username,
        profile: dbUser.profile,
        bankCard: dbUser.bankCard,
      },
    });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
