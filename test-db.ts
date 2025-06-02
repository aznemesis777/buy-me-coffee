// test-db.ts
import prisma from "./lib/prisma";

async function testDatabaseConnection() {
  try {
    console.log("🔄 Testing database connection...");

    await prisma.$connect();
    console.log("✅ Successfully connected to Neon database");

    const userCount = await prisma.user.count();
    const profileCount = await prisma.profile.count();
    const donationCount = await prisma.donation.count();
    const bankCardCount = await prisma.bankCard.count();

    console.log("📊 Database Statistics:");
    console.log(`   Users: ${userCount}`);
    console.log(`   Profiles: ${profileCount}`);
    console.log(`   Donations: ${donationCount}`);
    console.log(`   Bank Cards: ${bankCardCount}`);

    console.log("🧪 Testing record creation...");

    const testProfile = await prisma.profile.create({
      data: {
        name: "Test Profile",
        about: "This is a test profile",
      },
    });

    console.log("✅ Successfully created test profile:", testProfile.id);

    await prisma.profile.delete({
      where: { id: testProfile.id },
    });

    console.log("🧹 Cleaned up test record");
    console.log("🎉 All tests passed! Your database is ready to use.");
  } catch (error) {
    console.error("❌ Database test failed:", error);
  } finally {
    await prisma.$disconnect();
    console.log("👋 Disconnected from database");
  }
}

testDatabaseConnection();
