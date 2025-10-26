<!-- cf9927ab-bbcf-4872-91af-4ec59d8bd110 ef3088c9-aa89-4984-97db-e0ff9b502f10 -->
# GatherUp Accountability Platform - Complete Implementation Plan

## SPRINT 1: Database Design & Migration (Week 1)

### Goals

- Design simplified single-tenant database schema
- Remove all existing car service tables
- Implement new accountability system tables
- Seed initial admin user and default email templates

### 1.1 Database Schema Design (Single-Tenant)

**Core Tables (10 total):**

1. `admin` - Single administrator user
2. `members` - Accountability seekers with onboarding data
3. `goals` - SMART goals (one active per member)
4. `matches` - Accountability pairs or pods
5. `match_members` - Junction table linking members to matches
6. `rematch_requests` - Member requests for new partners
7. `invitations` - Unique one-time invite links
8. `email_templates` - Customizable email content
9. `email_logs` - Track sent communications
10. `progress_updates` - Member progress scores (1-12 scale)

### 1.2 Detailed Schema Structure

```typescript
// lib/db/schema.ts - COMPLETE NEW SCHEMA

import { pgTable, serial, varchar, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
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
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  
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
  matchId: integer("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  leftAt: timestamp("left_at"),
});

// ============================================
// REMATCH_REQUESTS TABLE
// ============================================
export const rematchRequests = pgTable("rematch_requests", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
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
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  goalId: integer("goal_id").notNull().references(() => goals.id, { onDelete: "cascade" }),
  
  progressScore: integer("progress_score").notNull(), // 1-12 scale
  notes: text("notes"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// RELATIONS
// ============================================
export const membersRelations = relations(members, ({ many, one }) => ({
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
```

### 1.3 Step-by-Step Migration Implementation

**Step 1: Backup Existing Database**

```bash
# Create backup of current database
pg_dump $POSTGRES_URL > backup_$(date +%Y%m%d).sql
```

**Step 2: Replace Schema File**

- Open `lib/db/schema.ts`
- Delete all existing table definitions (users, teams, customers, serviceRecords, bookings, staff)
- Copy the new schema from section 1.2 above
- Save file

**Step 3: Generate Migration**

```bash
npm run db:generate
# This creates migration files in lib/db/migrations/
```

**Step 4: Review Migration SQL**

- Check `lib/db/migrations/` for the new migration file
- Verify it drops old tables and creates new ones
- Ensure foreign keys and constraints are correct

**Step 5: Apply Migration**

```bash
npm run db:migrate
```

**Step 6: Create Seed Script**

Create `lib/db/seed-accountability.ts`:

```typescript
import { db } from "./drizzle";
import { admin, emailTemplates } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Create admin user
  const passwordHash = await bcrypt.hash("admin123", 10);
  
  await db.insert(admin).values({
    email: "admin@gatherup.com",
    passwordHash,
    name: "Admin User",
  });
  
  console.log("✅ Admin user created (email: admin@gatherup.com, password: admin123)");

  // 2. Create default email templates
  await db.insert(emailTemplates).values([
    {
      templateType: "welcome",
      name: "Welcome Email",
      subject: "Welcome to GatherUp!",
      bodyHtml: "<h1>Welcome {{memberName}}!</h1><p>We're excited to have you join GatherUp.</p>",
      bodyText: "Welcome {{memberName}}! We're excited to have you join GatherUp.",
      variables: ["memberName"],
      isActive: true,
    },
    {
      templateType: "match_notification",
      name: "Match Notification",
      subject: "You've been matched with an accountability partner!",
      bodyHtml: "<h1>Great news, {{memberName}}!</h1><p>You've been matched with {{partnerName}}. Their preferred contact: {{partnerContact}}</p>",
      bodyText: "Great news, {{memberName}}! You've been matched with {{partnerName}}. Their preferred contact: {{partnerContact}}",
      variables: ["memberName", "partnerName", "partnerContact"],
      isActive: true,
    },
    {
      templateType: "check_in",
      name: "Check-In Reminder",
      subject: "Time to check in with your accountability partner",
      bodyHtml: "<h1>Hi {{memberName}},</h1><p>It's check-in day! Reach out to your partner and share your progress.</p>",
      bodyText: "Hi {{memberName}}, It's check-in day! Reach out to your partner and share your progress.",
      variables: ["memberName"],
      isActive: true,
    },
    {
      templateType: "reflection",
      name: "Midweek Reflection",
      subject: "Your midweek reflection prompt",
      bodyHtml: "<h1>Hi {{memberName}},</h1><p>Take a moment to reflect: What progress have you made this week toward {{goal}}?</p>",
      bodyText: "Hi {{memberName}}, Take a moment to reflect: What progress have you made this week toward {{goal}}?",
      variables: ["memberName", "goal"],
      isActive: true,
    },
  ]);
  
  console.log("✅ Default email templates created");
  console.log("🎉 Seeding complete!");
}

seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
```

**Step 7: Run Seed Script**

```bash
npx tsx lib/db/seed-accountability.ts
```

**Step 8: Verify in Drizzle Studio**

```bash
npm run db:studio
# Opens at http://localhost:4983
# Check all tables are created correctly
```

### 1.4 Deliverables & Acceptance Criteria

**Deliverables:**

- ✅ New schema.ts with 10 tables
- ✅ Migration files generated
- ✅ Database migrated successfully
- ✅ Seed script with admin user and email templates
- ✅ Verification in Drizzle Studio

**Acceptance Criteria:**

- [ ] All old tables (customers, serviceRecords, bookings, staff) removed
- [ ] All 10 new tables created with correct columns
- [ ] Foreign key relationships working
- [ ] Admin user can be queried: `SELECT * FROM admin`
- [ ] 4 email templates seeded
- [ ] No migration errors in console

---

## Phase 2: Core Features Implementation

### 2.1 Authentication System Updates

**Files to modify:**

- `lib/auth/session.ts` - Add organization context to JWT
- `lib/auth/middleware.ts` - Add role-based access (manager vs member)
- `middleware.ts` - Route protection for /admin vs /member dashboards

**New flows:**

- Manager login (existing pattern)
- Member signup via invite link (validate token, create account)
- Member login (simple email/password)

### 2.2 Invitation System

**New API routes:**

- `POST /api/invitations` - Manager creates invite link
- `GET /api/invitations/validate/[token]` - Validate invite token
- `GET /api/invitations` - List all invites for manager

**New components:**

- `components/InviteGenerator.tsx` - Manager UI to generate links
- `components/InviteTable.tsx` - List of sent invitations with status

### 2.3 Member Onboarding

**New files:**

- `app/(member)/onboarding/page.tsx` - Multi-step onboarding form
- `components/OnboardingForm.tsx` - Form with validation

**Form fields:**

- Personal info (name, email, password)
- Primary goal (SMART format, single goal)
- Goal category selection
- Accountability style preference
- Commitment level (1-10 slider)
- Communication preference (email/text/phone/in-person)
- Match type preference (1:1 or group)
- Know anyone in program? (free text)

**API route:**

- `POST /api/members/onboarding` - Process onboarding submission

**Confirmation flow:**

- Success message: "Thank you! You'll receive an email with your accountability partner details within 1 week."
- Send welcome email
- Update member status to "unmatched"

### 2.4 Manager Dashboard

**New layout:**

- `app/(admin)/admin/layout.tsx` - Admin-specific layout with sidebar
- Update sidebar to show: Dashboard, Members, Matches, Invitations, Communications, Settings

**Dashboard page:** `app/(admin)/admin/page.tsx`

**Metrics cards:**

- Total members
- Active members (currently matched)
- Unmatched members
- Pending rematch requests
- Inactive members (no activity 7+ days)

**Charts/visualizations:**

- Goal categories breakdown (pie chart)
- Match type preferences (1:1 vs pods)
- Average progress scores over time
- Member growth over time

**API route:**

- `GET /api/admin/dashboard` - Aggregate stats

### 2.5 Member Management

**New page:** `app/(admin)/admin/members/page.tsx`

**Features:**

- Searchable/filterable table of all members
- Columns: Name, Email, Goal Category, Match Status, Progress Score, Last Active, Actions
- Filters: Status (all/matched/unmatched/inactive), Match Type, Goal Category
- CSV export button
- Click to view member details

**Member detail page:** `app/(admin)/admin/members/[id]/page.tsx`

- View full onboarding form responses
- Current goal and progress history
- Match history
- Communication preferences
- Manual status updates
- Activity timeline

**API routes:**

- `GET /api/members` - List with filters
- `GET /api/members/[id]` - Single member details
- `PATCH /api/members/[id]` - Update member status
- `GET /api/members/export` - CSV export

### 2.6 Matching System

**New page:** `app/(admin)/admin/matches/page.tsx`

**Features:**

- Active matches list with member names
- Unmatched members queue (sortable by goal category, commitment level)
- "Create Match" button opens modal
- Match creation modal:
  - Select 2+ members from list
  - Filter by goal category
  - See compatibility indicators (same goals, communication preferences)
  - Choose match type (1:1 or pod)
  - Add notes
- Dissolve match option (with reason)

**API routes:**

- `GET /api/matches` - List all matches
- `POST /api/matches` - Create new match
- `GET /api/matches/unmatched` - Get unmatched members
- `DELETE /api/matches/[id]` - Dissolve match
- `POST /api/matches/notify` - Send match notification emails

**Match notification flow:**

- After creating match, manager can send notifications
- Email includes: Partner name(s), shared goals, preferred communication method
- Members receive partner contact info

### 2.7 Rematch Request System

**New page:** `app/(admin)/admin/rematches/page.tsx`

- List of rematch requests
- Show: Member name, current match, reason, requested match type
- Actions: Approve (starts matching process), Deny (with message)

**Member rematch form:** `app/(member)/dashboard/rematch/page.tsx`

- Current match info
- Reason for rematch (required)
- Preferred match type
- Any specific preferences

**API routes:**

- `GET /api/rematch-requests` - Manager view
- `POST /api/rematch-requests` - Member submits request
- `PATCH /api/rematch-requests/[id]` - Manager approves/denies

---

## Phase 3: Member Dashboard & Progress Tracking

### 3.1 Member Dashboard

**New layout:** `app/(member)/dashboard/layout.tsx`

- Simple sidebar: Dashboard, My Goal, Progress, My Match, Settings

**Dashboard page:** `app/(member)/dashboard/page.tsx`

**Displays:**

- Welcome message with current goal
- Match status card:
  - If matched: Partner name(s), preferred communication, contact info
  - If unmatched: "We're finding your perfect accountability partner!"
- Progress overview (current 1-12 score with visual indicator)
- Upcoming check-in dates
- Quick action buttons: Update Progress, Request Rematch

### 3.2 Progress Tracking

**New page:** `app/(member)/dashboard/progress/page.tsx`

**Features:**

- Current goal display
- Progress slider (1-12 scale with labels)
- Optional notes text area
- Submit button
- Progress history chart
- Progress history table with dates and notes

**API routes:**

- `GET /api/progress/[memberId]` - Get progress history
- `POST /api/progress` - Submit new progress update

### 3.3 Goal Management

**New page:** `app/(member)/dashboard/goal/page.tsx`

**Features:**

- Display current goal (SMART format)
- Goal category
- Target date
- Measurable outcome
- Edit button (with manager approval if matched?)
- Goal achievement button

---

## Phase 4: Email Communication System

### 4.1 Email Templates

**New page:** `app/(admin)/admin/communications/templates/page.tsx`

**Template types:**

- Welcome email (after signup)
- Match notification (when paired)
- Check-in prompts (Mon/Thu)
- Reflection prompts (Wed)
- Rematch confirmation
- Goal achievement celebration

**Features:**

- Template editor with variables: `{{memberName}}`, `{{partnerName}}`, `{{goal}}`, etc.
- Preview pane
- HTML + plain text versions
- Save as default or custom per organization

**API routes:**

- `GET /api/email-templates` - List templates
- `POST /api/email-templates` - Create custom template
- `PATCH /api/email-templates/[id]` - Update template

### 4.2 Email Scheduling

**New page:** `app/(admin)/admin/communications/schedule/page.tsx`

**Features:**

- Configure automated emails:
  - Check-in prompts: Mon/Thu at specific time
  - Reflection prompts: Wed at specific time
- Toggle on/off
- Test send feature
- View schedule calendar

**Backend cron jobs:**

- Use Next.js API routes with cron service or Vercel Cron
- `app/api/cron/send-check-ins/route.ts`
- `app/api/cron/send-reflections/route.ts`

**Email service integration:**

- Use existing setup or add Resend/SendGrid/AWS SES
- Batch sending to all matched members
- Track delivery status

### 4.3 Manual Email Sending

**Feature in Communications page:**

- Compose new email
- Select recipients: All members, Matched only, Unmatched only, Specific members
- Choose template or write custom
- Send immediately or schedule
- View email logs

**API routes:**

- `POST /api/emails/send` - Send manual email
- `GET /api/emails/logs` - View sent emails

---

## Phase 5: White-Labeling & Multi-Tenancy ⚠️ **DEFERRED - FUTURE WORK**

> **Note:** This phase is skipped for the MVP but retained in the plan for future implementation when the client wants to scale to multiple gym owners/organizations.

### 5.1 Organization Settings (Future)

**New page:** `app/(admin)/admin/settings/organization/page.tsx`

**Settings:**

- Organization name
- Logo upload (Cloudinary)
- Brand colors (color picker for 5 GatherUp colors)
- Custom domain (future enhancement)
- Email from name/address
- Notification preferences

**API routes:**

- `GET /api/organization/settings` - Get current settings
- `PATCH /api/organization/settings` - Update settings

### 5.2 Dynamic Theming (Future)

**Implementation:**

- Store brand colors in organization settings
- Inject CSS variables at runtime based on org
- Update `app/layout.tsx` to load org-specific theme
- Create `lib/theme.ts` - Theme utilities

### 5.3 Super Admin Features (Future)

**For managing multiple gyms:**

- Super admin dashboard to see all organizations
- Create new organizations
- Assign managers to organizations
- View cross-org analytics

---

## Phase 6: Analytics & Reporting

### 6.1 Manager Analytics Dashboard

**Enhanced metrics:**

- Member retention rate
- Average progress scores
- Match success rate (active vs dissolved)
- Goal category trends
- Communication preference distribution
- Peak activity times

### 6.2 CSV Exports

**Export functionality for:**

- All members with full details
- Match history
- Progress updates
- Email logs
- Rematch requests

**Implementation:**

- Add export buttons to each data table
- Generate CSV server-side
- Download or email to manager

---

## Phase 7: Additional Features & Polish

### 7.1 Activity Logging

**Comprehensive audit trail:**

- All manager actions (matches created, members updated, etc.)
- Member activities (signup, progress updates, rematch requests)
- System events (emails sent, matches dissolved)

**Visibility:**

- Manager can view activity logs in admin dashboard
- Filter by date range, actor, action type

### 7.2 Notifications System

**In-app notifications for:**

- Managers: New signups, rematch requests, inactive members
- Members: Match assigned, check-in reminders (if logged in)

**Implementation:**

- `notifications` table (optional, nice-to-have)
- Notification dropdown in header
- Real-time updates with SWR

### 7.3 Search & Filters

**Enhance all list pages with:**

- Global search
- Advanced filters
- Sort options
- Pagination
- Saved filter presets

### 7.4 UI/UX Polish

**Apply GatherUp design system:**

- Color palette: `#A6FF48`, `#053D3D`, `#E0F2CC`, `#191919`, `#BCE8E7`
- Update `globals.css` with brand colors
- Create custom components matching brand
- Responsive design for mobile
- Loading states and error handling
- Empty states with helpful messaging
- Toast notifications for actions

---

## Implementation Roadmap

### Sprint 1: Foundation (Database & Auth)

1. Design and implement new database schema
2. Run migrations
3. Update authentication for manager/member roles
4. Create seed data script

### Sprint 2: Core MVP (Onboarding & Matching)

5. Build invitation system
6. Create member onboarding flow
7. Implement manager dashboard skeleton
8. Build member management pages
9. Create matching system UI and logic

### Sprint 3: Member Experience

10. Build member dashboard
11. Implement progress tracking
12. Add rematch request flow
13. Create goal management pages

### Sprint 4: Communications

14. Set up email template system
15. Implement automated email scheduling
16. Build manual email sending
17. Add email logging and tracking

### Sprint 5: Multi-Tenancy & White-Label

18. Implement organization settings
19. Add dynamic theming
20. Create organization management (super admin)

### Sprint 6: Analytics & Polish

21. Build analytics dashboard
22. Add CSV export functionality
23. Implement activity logging
24. Add in-app notifications
25. UI/UX polish and refinements
26. Testing and bug fixes

---

## Key Files to Create/Modify

### Database

- ✏️ `lib/db/schema.ts` - Complete rewrite for new schema
- ✏️ `lib/db/queries.ts` - New query functions
- ✏️ `lib/db/seed.ts` - Seed for accountability system

### Authentication

- ✏️ `lib/auth/session.ts` - Add organization context
- ✏️ `lib/auth/middleware.ts` - Role-based access
- ✏️ `middleware.ts` - Route protection

### API Routes (New)

- `app/api/invitations/route.ts`
- `app/api/members/route.ts`
- `app/api/members/[id]/route.ts`
- `app/api/members/onboarding/route.ts`
- `app/api/matches/route.ts`
- `app/api/matches/[id]/route.ts`
- `app/api/rematch-requests/route.ts`
- `app/api/progress/route.ts`
- `app/api/email-templates/route.ts`
- `app/api/emails/send/route.ts`
- `app/api/cron/check-ins/route.ts`
- `app/api/admin/dashboard/route.ts`
- `app/api/organization/settings/route.ts`

### Pages (Manager/Admin)

- `app/(admin)/admin/page.tsx` - Dashboard
- `app/(admin)/admin/members/page.tsx` - Member list
- `app/(admin)/admin/members/[id]/page.tsx` - Member details
- `app/(admin)/admin/matches/page.tsx` - Matching system
- `app/(admin)/admin/invitations/page.tsx` - Invite management
- `app/(admin)/admin/rematches/page.tsx` - Rematch requests
- `app/(admin)/admin/communications/page.tsx` - Email hub
- `app/(admin)/admin/settings/page.tsx` - Organization settings

### Pages (Member)

- `app/(member)/signup/[token]/page.tsx` - Invite signup
- `app/(member)/onboarding/page.tsx` - Onboarding form
- `app/(member)/dashboard/page.tsx` - Member dashboard
- `app/(member)/dashboard/progress/page.tsx` - Progress tracking
- `app/(member)/dashboard/goal/page.tsx` - Goal management
- `app/(member)/dashboard/rematch/page.tsx` - Rematch request

### Components (New)

- `components/admin/InviteGenerator.tsx`
- `components/admin/MemberTable.tsx`
- `components/admin/MatchingModal.tsx`
- `components/admin/EmailComposer.tsx`
- `components/member/OnboardingForm.tsx`
- `components/member/ProgressSlider.tsx`
- `components/member/MatchCard.tsx`
- `components/member/GoalDisplay.tsx`

---

## Success Criteria

### MVP Launch Checklist

- [ ] Manager can create organization and invite members
- [ ] Members can sign up via unique invite links
- [ ] Members complete onboarding with SMART goal
- [ ] Manager views all members in dashboard
- [ ] Manager manually creates 1:1 matches
- [ ] Manager manually creates group pods (3+ members)
- [ ] Match notification emails sent automatically
- [ ] Members can log in and see their match
- [ ] Members can update progress (1-12 scale)
- [ ] Members can request rematches
- [ ] Automated check-in emails (Mon/Thu)
- [ ] Automated reflection emails (Wed)
- [ ] Manager can export member data to CSV
- [ ] GatherUp brand colors applied throughout
- [ ] Responsive design works on mobile
- [ ] All data scoped to organization (multi-tenant ready)

### Post-MVP Enhancements

- Multiple managers per organization
- Super admin for managing gyms
- Custom email domains
- Advanced analytics and reporting
- Member-to-member messaging (future scope)
- Goal templates and library
- Achievement badges and gamification
- Integration with fitness apps
- Mobile app (future)

---

## Technical Stack Retained

✅ **Keep from existing project:**

- Next.js 15 (App Router)
- TypeScript
- PostgreSQL + Drizzle ORM
- Tailwind CSS
- SWR for data fetching
- Redis caching (for session/analytics)
- Cloudinary (for logos/profile images)
- Stripe (for gym subscription billing - optional)

❌ **Remove/Replace:**

- Car service specific APIs (DVLA, service records, bookings)
- Customer vehicle management
- Staff management (unless gym wants to track coaches)

---

## Database Migration Commands

```bash
# 1. Generate new migration
npm run db:generate

# 2. Review migration files in lib/db/migrations

# 3. Apply migration
npm run db:migrate

# 4. Seed initial data
npm run db:seed

# 5. Open Drizzle Studio to verify
npm run db:studio
```

---

## Environment Variables Needed

```env
# Existing
POSTGRES_URL=
REDIS_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXTAUTH_SECRET=

# New (Email service)
EMAIL_SERVICE_API_KEY=  # Resend/SendGrid/SES
EMAIL_FROM_ADDRESS=
EMAIL_FROM_NAME=

# New (Cron - if using Vercel)
CRON_SECRET=  # For securing cron endpoints
```

---

## Notes & Considerations

1. **Data Migration**: Current database has car service data. Decide whether to:

   - Keep in separate tables (archive)
   - Export and drop (clean slate)
   - Maintain both systems in parallel (probably not)

2. **Email Service**: Choose email provider (Resend recommended for simplicity)

3. **Cron Jobs**: For automated emails, use Vercel Cron (if on Vercel) or external service like Trigger.dev

4. **Scalability**: Database design supports thousands of members per organization

5. **Privacy**: Ensure member data is fully isolated per organization

6. **Testing**: Create test organization for development

7. **Documentation**: Update README with new system overview

This plan provides a complete roadmap from database design to full implementation, maintaining the existing tech stack while building an entirely new accountability partner platform suitable for white-labeling to multiple gym owners.

### To-dos

- [ ] Design and implement complete database schema for accountability system with 14 tables including organizations, members, goals, matches, invitations, etc.
- [ ] Generate and apply database migrations, create seed script with default data
- [ ] Update authentication system for manager vs member roles with organization context in JWT
- [ ] Build invitation system with unique one-time links, API routes, and manager UI
- [ ] Create member onboarding flow with multi-step form, SMART goal collection, and confirmation email
- [ ] Build manager dashboard with metrics cards, member overview, and analytics
- [ ] Implement member management pages with search, filters, detail views, and CSV export
- [ ] Create matching system UI for manual pairing into 1:1 or group pods with compatibility indicators
- [ ] Build rematch request flow for members and approval interface for managers
- [ ] Create member dashboard showing match info, goal, and quick actions
- [ ] Implement progress tracking with 1-12 scale slider, history chart, and notes
- [ ] Build email template system with variable substitution for all communication types
- [ ] Implement automated email scheduling for check-ins (Mon/Thu) and reflections (Wed) with cron jobs
- [ ] Add manual email sending interface with recipient selection and email logging
- [ ] Create organization settings page for white-labeling with logo, brand colors, and preferences
- [ ] Implement dynamic theming system to inject organization brand colors at runtime
- [ ] Build analytics dashboard with retention rates, progress trends, and goal category breakdown
- [ ] Implement comprehensive activity logging for audit trail of all actions
- [ ] Apply GatherUp brand colors (#A6FF48, #053D3D, etc.) throughout UI with responsive design
- [ ] End-to-end testing, bug fixes, loading states, error handling, and UX polish