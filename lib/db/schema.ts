import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// ADMIN TABLE
// ============================================
export const admin = pgTable("admin", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// MEMBERS TABLE
// ============================================
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }),

  // Onboarding preferences
  preferredCommunication: varchar("preferred_communication", { length: 50 }), // email/text/phone/in-person
  preferredMatchType: varchar("preferred_match_type", { length: 20 }), // one-on-one/group
  accountabilityStyle: text("accountability_style"), // How they want accountability
  commitmentLevel: integer("commitment_level"), // 1-10 scale
  knowsOtherMembers: text("knows_other_members"), // Pre-existing relationships

  // Status tracking
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending/matched/unmatched/inactive
  matchedAt: timestamp("matched_at"),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// GOALS TABLE
// ============================================
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),

  goalText: text("goal_text").notNull(), // SMART formatted goal
  category: varchar("category", { length: 100 }).notNull(), // fitness/nutrition/mental-health/habit/career/etc
  targetDate: varchar("target_date", { length: 50 }),
  measurableOutcome: text("measurable_outcome"),

  currentProgress: integer("current_progress").default(1), // 1-12 scale
  status: varchar("status", { length: 20 }).notNull().default("active"), // active/achieved/abandoned

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// MATCHES TABLE
// ============================================
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  matchType: varchar("match_type", { length: 20 }).notNull(), // one-on-one/pod
  status: varchar("status", { length: 20 }).notNull().default("active"), // active/inactive/dissolved
  notes: text("notes"), // Admin notes about the match

  createdAt: timestamp("created_at").notNull().defaultNow(),
  dissolvedAt: timestamp("dissolved_at"),
});

// ============================================
// MATCH_MEMBERS TABLE (Junction)
// ============================================
export const matchMembers = pgTable("match_members", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),

  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  leftAt: timestamp("left_at"),
});

// ============================================
// REMATCH_REQUESTS TABLE
// ============================================
export const rematchRequests = pgTable("rematch_requests", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  currentMatchId: integer("current_match_id").references(() => matches.id),

  reason: text("reason").notNull(),
  preferredMatchType: varchar("preferred_match_type", { length: 20 }),
  preferredPartner: text("preferred_partner"), // Optional specific request

  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending/approved/denied/completed
  adminNotes: text("admin_notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// ============================================
// INVITATIONS TABLE
// ============================================
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(), // One-time use token

  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending/accepted/expired
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// EMAIL_TEMPLATES TABLE
// ============================================
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  templateType: varchar("template_type", { length: 50 }).notNull(), // welcome/match_notification/check_in/reflection/rematch
  name: varchar("name", { length: 255 }).notNull(),

  subject: varchar("subject", { length: 255 }).notNull(),
  bodyHtml: text("body_html").notNull(),
  bodyText: text("body_text").notNull(),

  variables: jsonb("variables").$type<string[]>(), // Available variables like {{memberName}}
  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// EMAIL_LOGS TABLE
// ============================================
export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  memberId: integer("member_id").references(() => members.id),

  templateType: varchar("template_type", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),

  sentAt: timestamp("sent_at").notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("sent"), // sent/failed/bounced
  errorMessage: text("error_message"),
});

// ============================================
// PROGRESS_UPDATES TABLE
// ============================================
export const progressUpdates = pgTable("progress_updates", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  goalId: integer("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),

  progressScore: integer("progress_score").notNull(), // 1-12 scale
  notes: text("notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// BOOKINGS TABLE
// ============================================
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  carReg: varchar("car_reg", { length: 20 }).notNull(),
  services: jsonb("services").$type<string[]>().notNull(),
  bookDate: varchar("book_date", { length: 50 }).notNull(),
  bookTime: varchar("book_time", { length: 50 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending/confirmed/completed/cancelled

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// RELATIONS
// ============================================
export const membersRelations = relations(members, ({ many }) => ({
  goals: many(goals),
  progressUpdates: many(progressUpdates),
  matchMembers: many(matchMembers),
  rematchRequests: many(rematchRequests),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  member: one(members, {
    fields: [goals.memberId],
    references: [members.id],
  }),
  progressUpdates: many(progressUpdates),
}));

export const matchesRelations = relations(matches, ({ many }) => ({
  matchMembers: many(matchMembers),
}));

export const matchMembersRelations = relations(matchMembers, ({ one }) => ({
  match: one(matches, {
    fields: [matchMembers.matchId],
    references: [matches.id],
  }),
  member: one(members, {
    fields: [matchMembers.memberId],
    references: [members.id],
  }),
}));

export const progressUpdatesRelations = relations(
  progressUpdates,
  ({ one }) => ({
    member: one(members, {
      fields: [progressUpdates.memberId],
      references: [members.id],
    }),
    goal: one(goals, {
      fields: [progressUpdates.goalId],
      references: [goals.id],
    }),
  })
);

export const rematchRequestsRelations = relations(
  rematchRequests,
  ({ one }) => ({
    member: one(members, {
      fields: [rematchRequests.memberId],
      references: [members.id],
    }),
    currentMatch: one(matches, {
      fields: [rematchRequests.currentMatchId],
      references: [matches.id],
    }),
  })
);

// ============================================
// TYPE EXPORTS
// ============================================
export type Admin = typeof admin.$inferSelect;
export type NewAdmin = typeof admin.$inferInsert;
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type MatchMember = typeof matchMembers.$inferSelect;
export type NewMatchMember = typeof matchMembers.$inferInsert;
export type RematchRequest = typeof rematchRequests.$inferSelect;
export type NewRematchRequest = typeof rematchRequests.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;
export type EmailLog = typeof emailLogs.$inferSelect;
export type NewEmailLog = typeof emailLogs.$inferInsert;
export type ProgressUpdate = typeof progressUpdates.$inferSelect;
export type NewProgressUpdate = typeof progressUpdates.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
