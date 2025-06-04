import prisma from "@/lib/prisma";

export async function getCurrentDbUser(clerkUserId: string) {
  return await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    include: { profile: true, bankCard: true },
  });
}
