// app/api/users/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(_request: NextRequest) {
  try {
    console.log("Starting user sync...");

    const { userId } = await auth();
    console.log("Clerk userId:", userId);

    if (!userId) {
      console.log("No userId from auth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    console.log("Clerk user:", user ? "found" : "not found");

    if (!user) {
      console.log("No current user found");
      return NextResponse.json({ error: "User not found" }, { status: 401 });
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
      const email = user.emailAddresses?.[0]?.emailAddress;
      if (!email) {
        console.log("No email found in Clerk user");
        return NextResponse.json({ error: "Email not found" }, { status: 400 });
      }

      let username =
        user.username || user.firstName || email.split("@")[0] || "user";

      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        username = `${username}_${Date.now()}`;
      }

      console.log(
        "Creating new user with email:",
        email,
        "username:",
        username
      );

      try {
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
        console.log("User created successfully:", dbUser.id);
      } catch (createError) {
        console.error("Error creating user:", createError);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }
    } else {
      console.log("User already exists:", dbUser.id);
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

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
