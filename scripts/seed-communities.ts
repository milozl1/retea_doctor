import { db } from "../db/drizzle";
import { communities, posts, comments, networkUsers } from "../db/schema";
import { DEFAULT_COMMUNITIES } from "../config/communities";
import { calculateHotScore } from "../lib/hot-score";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Seed communities
  console.log("📁 Seeding communities...");
  const communityRecords: Array<{ id: number; slug: string }> = [];

  for (const comm of DEFAULT_COMMUNITIES) {
    const [inserted] = await db
      .insert(communities)
      .values({
        slug: comm.slug,
        name: comm.name,
        description: comm.description,
        rules: comm.rules,
        color: comm.color,
        iconSrc: comm.iconEmoji,
        isDefault: comm.isDefault,
      })
      .onConflictDoNothing()
      .returning({ id: communities.id, slug: communities.slug });

    if (inserted) {
      communityRecords.push(inserted);
      console.log(`  ✅ ${comm.name}`);
    } else {
      console.log(`  ⏭️  ${comm.name} (already exists)`);
    }
  }

  // 2. Create demo users
  console.log("\n👤 Seeding demo users...");
  const demoUsers = [
    {
      userId: "demo-doctor-1",
      userName: "Dr. Popescu Andrei",
      userImageSrc: "/default-avatar.png",
      experienceLevel: "specialist",
      isVerified: true,
      role: "admin" as const,
    },
    {
      userId: "demo-doctor-2",
      userName: "Dr. Ionescu Maria",
      userImageSrc: "/default-avatar.png",
      experienceLevel: "specialist",
      isVerified: true,
      role: "moderator" as const,
    },
    {
      userId: "demo-rezident-1",
      userName: "Dr. Vasile George",
      userImageSrc: "/default-avatar.png",
      experienceLevel: "rezident",
      isVerified: false,
      role: "user" as const,
    },
    {
      userId: "demo-student-1",
      userName: "Popa Ana",
      userImageSrc: "/default-avatar.png",
      experienceLevel: "student",
      isVerified: false,
      role: "user" as const,
    },
  ];

  for (const user of demoUsers) {
    await db
      .insert(networkUsers)
      .values(user)
      .onConflictDoNothing();
    console.log(`  ✅ ${user.userName}`);
  }

  // 3. Seed posts
  console.log("\n📝 Seeding posts...");
  const demoPosts = [
    {
      userId: "demo-doctor-1",
      communitySlug: "cardiologie",
      title: "Fibrilație atrială la pacient tânăr - abordare terapeutică",
      content:
        "Am întâlnit recent un caz de fibrilație atrială la un pacient de 28 de ani, fără factori de risc evidenți. Ecografia cardiacă a fost normală, TSH normal.\n\n**Întrebarea mea:** Care ar fi abordarea voastră în ceea ce privește anticoagularea? CHA2DS2-VASc = 0.\n\nAș aprecia orice recomandare din ghidurile ESC recente.",
      type: "case_study" as const,
      tags: ["fibrilatie-atriala", "anticoagulare", "ESC"],
    },
    {
      userId: "demo-doctor-2",
      communitySlug: "neurologie",
      title: "Noutăți în tratamentul sclerozei multiple - anti-CD20",
      content:
        "Am compilat un rezumat al ultimelor studii privind terapiile anti-CD20 în SM. Ocrevus și Kesimpta au arătat rezultate impresionante.\n\n## Puncte cheie:\n- Reducere de 94% a leziunilor T1 Gd+\n- Profil de siguranță favorabil pe termen lung\n- Administrare subcutanată disponibilă\n\nCe experiență aveți cu aceste terapii?",
      type: "article" as const,
      tags: ["scleroza-multipla", "anti-CD20", "neurologie"],
    },
    {
      userId: "demo-rezident-1",
      communitySlug: "rezidentiat",
      title: "Resurse pentru pregătirea examenului de rezidențiat 2025",
      content:
        "Salut! Am adunat câteva resurse utile:\n\n1. **MedLearn** - cursuri interactive\n2. **Harrison's** - biblia medicinei interne\n3. **UpToDate** - evidențe actualizate\n4. **Radiopaedia** - imagistică\n\nCe alte resurse recomandați? Sunt în anul I de rezidențiat, medicina internă.",
      type: "discussion" as const,
      tags: ["rezidentiat", "resurse", "examen"],
    },
    {
      userId: "demo-student-1",
      communitySlug: "general",
      title: "Cum gestionați burnout-ul în medicină?",
      content:
        "Sunt studentă în anul V și simt deja burnout-ul. Între garduri, studiu și viața personală, e greu de jonglat cu totul.\n\nCum faceți față? Aveți strategii care funcționează?\n\nMulțumesc pentru orice sfat! 🙏",
      type: "discussion" as const,
      tags: ["burnout", "wellbeing", "studenti"],
    },
    {
      userId: "demo-doctor-1",
      communitySlug: "cazuri-clinice",
      title: "Sindrom Brugada - descoperire incidentală la check-up",
      content:
        "**Prezentare caz:**\n\nBărbat, 35 de ani, sportiv amator, se prezintă pentru check-up de rutină.\n\n**ECG:** Pattern Brugada tip 1 în V1-V2.\n\n**Antecedente familiale:** Frate decedat la 28 ani - moarte subită.\n\n**Întrebarea:** Procedați direct la test provocare cu ajmalină sau...?\n\nAș dori să aud opinii de la cardiologi.",
      type: "case_study" as const,
      tags: ["brugada", "moarte-subita", "ECG"],
    },
    {
      userId: "demo-doctor-2",
      communitySlug: "boli-infectioase",
      title: "Ghid rapid: Antibioterapia empirică în pneumonii comunitare",
      content:
        "Am creat un mini-ghid bazat pe recomandările IDSA/ATS 2024:\n\n## Pneumonie ușoară (ambulatoriu):\n- Amoxicilină 1g x 3/zi, 5 zile\n- Alternativ: Doxiciclină 100mg x 2/zi\n\n## Pneumonie moderată (spitalizare):\n- Ceftriaxonă 2g/zi + Azitromicină 500mg/zi\n\n## Pneumonie severă (ATI):\n- Ceftriaxonă + Azitromicină ± Vancomicină\n\nSe aplică în România conform ghidurilor locale?",
      type: "article" as const,
      tags: ["pneumonie", "antibiotic", "ghid"],
    },
    {
      userId: "demo-rezident-1",
      communitySlug: "medicina-interna",
      title: "Diagnostic diferențial: Hiponatremie severă la urgențe",
      content:
        "Pacient 65 ani, confuz, Na+ = 112 mEq/L.\n\n**Cum procedați?**\n\n1. Care e rata de corecție sigură?\n2. Cum diferențiați SIADH de depletie volemică?\n3. Ce investigații adiționale cereți?\n\nÎntrebare rapidă de gardă, apreciez orice ajutor! 🆘",
      type: "quick_question" as const,
      tags: ["hiponatremie", "urgente", "medicina-interna"],
    },
    {
      userId: "demo-student-1",
      communitySlug: "off-topic",
      title: "Recomandați un serial medical realist?",
      content:
        "Am văzut House MD, Scrubs, și Grey's Anatomy (primele sezoane).\n\nCe alte seriale medicale sunt relativ realiste?\n\nSunt curioasă de New Amsterdam și The Resident. Merită? 🎬",
      type: "discussion" as const,
      tags: ["seriale", "off-topic", "recomandari"],
    },
  ];

  for (const postData of demoPosts) {
    const comm = communityRecords.find(
      (c) => c.slug === postData.communitySlug
    );
    if (!comm) continue;

    const score = Math.floor(Math.random() * 50) + 5;
    const hotScore = calculateHotScore(score, new Date());

    const [post] = await db
      .insert(posts)
      .values({
        userId: postData.userId,
        communityId: comm.id,
        title: postData.title,
        content: postData.content,
        type: postData.type,
        tags: postData.tags,
        score,
        hotScore,
        commentCount: 0,
      })
      .returning();

    // Update user post count
    await db.execute(
      sql`UPDATE network_users SET post_count = post_count + 1 WHERE user_id = ${postData.userId}`
    );

    console.log(`  ✅ "${postData.title.substring(0, 50)}..."`);

    // Add some demo comments
    if (post) {
      const commentData = [
        {
          userId: "demo-doctor-2",
          content:
            "Foarte interesant caz! Recomand consultarea ghidurilor ESC 2024 pentru o abordare structurată.",
          score: Math.floor(Math.random() * 15) + 1,
        },
        {
          userId: "demo-rezident-1",
          content:
            "Mulțumesc pentru share! Am întâlnit un caz similar și m-a ajutat foarte mult discuția.",
          score: Math.floor(Math.random() * 10) + 1,
        },
      ];

      let parentId: number | null = null;
      for (let i = 0; i < commentData.length; i++) {
        const c = commentData[i];
        const [comment]: any[] = await db
          .insert(comments)
          .values({
            postId: post.id,
            userId: c.userId,
            content: c.content,
            score: c.score,
            depth: i === 0 ? 0 : 1,
            parentId: i === 0 ? null : parentId,
          })
          .returning();

        if (i === 0 && comment) {
          parentId = comment.id;
        }
      }

      // Update post comment count
      await db.execute(
        sql`UPDATE posts SET comment_count = ${commentData.length} WHERE id = ${post.id}`
      );
    }
  }

  // 4. Update community member counts
  console.log("\n📊 Updating community stats...");
  for (const comm of communityRecords) {
    await db.execute(
      sql`UPDATE communities SET post_count = (SELECT count(*) FROM posts WHERE community_id = ${comm.id}) WHERE id = ${comm.id}`
    );
  }

  console.log("\n✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
