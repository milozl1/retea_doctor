import "dotenv/config";
import { db } from "../db/drizzle";
import { communities } from "../db/schema";
import { defaultCommunities } from "../config/communities";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding communities...");

  for (const community of defaultCommunities) {
    const existing = await db
      .select()
      .from(communities)
      .where(eq(communities.slug, community.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`⏭ Skipping ${community.slug} (already exists)`);
      continue;
    }

    await db.insert(communities).values({
      slug: community.slug,
      name: community.name,
      description: community.description,
      rules: community.rules,
      color: community.color,
      isDefault: community.isDefault,
    });

    console.log(`✅ Created community: ${community.name}`);
  }

  console.log("✨ Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed error:", error);
  process.exit(1);
});
