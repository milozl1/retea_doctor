/**
 * Read-only Drizzle schema for the Doctor/MedLearn PostgreSQL database.
 *
 * Only the columns actually consumed by retea_doctor are declared here to keep
 * the maintenance surface small.  These tables live in the SEPARATE
 * MEDLEARN_DATABASE_URL database — never mix with the retea_doctor `db` client.
 */

import { pgTable, text, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";

// ─── User Progress ───────────────────────────────────────────────────────────
export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull(),
  userImageSrc: text("user_image_src").notNull().default(""),
  experienceLevel: text("experience_level").notNull().default("student"),
  points: integer("points").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  specializationId: integer("specialization_id"),
});

// ─── Specializations ─────────────────────────────────────────────────────────
export const specializations = pgTable("specializations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  iconSrc: text("icon_src"),
  color: text("color").notNull().default("#2196F3"),
});

// ─── Case Studies ─────────────────────────────────────────────────────────────
export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  patientHistory: text("patient_history").notNull().default(""),
  presentation: text("presentation").notNull().default(""),
  category: text("category").notNull().default(""),
  specializationId: integer("specialization_id"),
  difficulty: text("difficulty").notNull().default("medium"),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
