import { desc, and, eq, isNull, or, sql, inArray } from "drizzle-orm";
import { db } from "./drizzle";
import {
  admin,
  members,
  goals,
  matches,
  matchMembers,
  rematchRequests,
  invitations,
  emailTemplates,
  emailLogs,
  progressUpdates,
} from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";
import { getCached, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

// ============================================
// AUTHENTICATION & SESSION QUERIES
// ============================================

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  console.log("[getUser] Session cookie exists:", !!sessionCookie);
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  console.log(
    "[getUser] Session data:",
    sessionData
      ? `user=${sessionData.user?.email}, role=${sessionData.user?.role}`
      : "null"
  );
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    console.log("[getUser] Session expired");
    return null;
  }

  const userId = sessionData.user.id;
  const role = sessionData.user.role;
  console.log("[getUser] User ID:", userId, "Role:", role);

  // Check if admin
  if (role === "admin") {
    const adminUser = await getCached(
      CACHE_KEYS.USER(userId, "admin"),
      async () => {
        const result = await db
          .select()
          .from(admin)
          .where(eq(admin.id, userId))
          .limit(1);

        return result.length === 0 ? null : { ...result[0], role: "admin" };
      },
      CACHE_TTL.USER_SESSION
    );

    return adminUser;
  }

  // Check if member
  const member = await getCached(
    CACHE_KEYS.USER(userId, "member"),
    async () => {
      const result = await db
        .select()
        .from(members)
        .where(eq(members.id, userId))
        .limit(1);

      return result.length === 0 ? null : { ...result[0], role: "member" };
    },
    CACHE_TTL.USER_SESSION
  );

  return member;
}

export async function getAdmin() {
  const user = await getUser();
  console.log(
    "[getAdmin] User object:",
    user
      ? JSON.stringify({ id: user.id, email: user.email, role: user.role })
      : "null"
  );
  if (!user || user.role !== "admin") {
    console.log(
      "[getAdmin] Returning null - user:",
      !!user,
      "role:",
      user?.role
    );
    return null;
  }
  return user;
}

export async function getMember() {
  const user = await getUser();
  if (!user || user.role !== "member") {
    return null;
  }
  return user;
}

// ============================================
// MEMBER QUERIES
// ============================================

export async function getAllMembers(filters?: {
  status?: string;
  matchType?: string;
  category?: string;
  search?: string;
  includePending?: boolean;
}) {
  let query = db
    .select({
      member: members,
      goal: goals,
    })
    .from(members)
    .leftJoin(
      goals,
      and(eq(goals.memberId, members.id), eq(goals.status, "active"))
    )
    .$dynamic();

  const conditions = [];

  // Exclude pending members by default (unless explicitly requested)
  if (!filters?.includePending) {
    conditions.push(sql`${members.status} != 'pending'`);
  }

  if (filters?.status) {
    conditions.push(eq(members.status, filters.status));
  }

  if (filters?.matchType) {
    conditions.push(eq(members.preferredMatchType, filters.matchType));
  }

  if (filters?.category && filters.category !== "all") {
    conditions.push(eq(goals.category, filters.category));
  }

  if (filters?.search) {
    conditions.push(
      or(
        sql`${members.name} ILIKE ${`%${filters.search}%`}`,
        sql`${members.email} ILIKE ${`%${filters.search}%`}`
      )!
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const results = await query.orderBy(desc(members.createdAt));

  return results;
}

export async function getMemberById(memberId: number) {
  const result = await db
    .select({
      member: members,
      goal: goals,
    })
    .from(members)
    .leftJoin(
      goals,
      and(eq(goals.memberId, members.id), eq(goals.status, "active"))
    )
    .where(eq(members.id, memberId))
    .limit(1);

  return result[0] || null;
}

export async function getMemberWithDetails(memberId: number) {
  const memberData = await getMemberById(memberId);
  if (!memberData) return null;

  // Get progress history
  const progress = await db
    .select()
    .from(progressUpdates)
    .where(eq(progressUpdates.memberId, memberId))
    .orderBy(desc(progressUpdates.createdAt))
    .limit(10);

  // Get match info
  const matchInfo = await db
    .select({
      match: matches,
      matchMember: matchMembers,
    })
    .from(matchMembers)
    .innerJoin(matches, eq(matchMembers.matchId, matches.id))
    .where(
      and(
        eq(matchMembers.memberId, memberId),
        isNull(matchMembers.leftAt),
        eq(matches.status, "active")
      )
    )
    .limit(1);

  // Get partners in current match
  let partners = [];
  if (matchInfo.length > 0) {
    const matchId = matchInfo[0].match.id;
    const partnerData = await db
      .select({
        member: members,
        goal: goals,
      })
      .from(matchMembers)
      .innerJoin(members, eq(matchMembers.memberId, members.id))
      .leftJoin(
        goals,
        and(eq(goals.memberId, members.id), eq(goals.status, "active"))
      )
      .where(
        and(
          eq(matchMembers.matchId, matchId),
          isNull(matchMembers.leftAt),
          sql`${matchMembers.memberId} != ${memberId}`
        )
      );

    partners = partnerData;
  }

  // Get most recent rematch request (pending, approved, or denied)
  const recentRematchRequest = await db
    .select()
    .from(rematchRequests)
    .where(eq(rematchRequests.memberId, memberId))
    .orderBy(desc(rematchRequests.createdAt))
    .limit(1);

  return {
    ...memberData,
    progressHistory: progress,
    currentMatch: matchInfo[0] || null,
    partners,
    rematchRequest: recentRematchRequest[0] || null,
  };
}

export async function getUnmatchedMembers() {
  return await db
    .select({
      member: members,
      goal: goals,
    })
    .from(members)
    .leftJoin(
      goals,
      and(eq(goals.memberId, members.id), eq(goals.status, "active"))
    )
    .where(eq(members.status, "unmatched"))
    .orderBy(desc(members.createdAt));
}

// ============================================
// MATCH QUERIES
// ============================================

export async function getAllMatches() {
  const matchesData = await db
    .select({
      match: matches,
    })
    .from(matches)
    .where(eq(matches.status, "active"))
    .orderBy(desc(matches.createdAt));

  // Get members for each match
  const matchesWithMembers = await Promise.all(
    matchesData.map(async ({ match }) => {
      const memberData = await db
        .select({
          member: members,
          goal: goals,
          matchMember: matchMembers,
        })
        .from(matchMembers)
        .innerJoin(members, eq(matchMembers.memberId, members.id))
        .leftJoin(
          goals,
          and(eq(goals.memberId, members.id), eq(goals.status, "active"))
        )
        .where(
          and(eq(matchMembers.matchId, match.id), isNull(matchMembers.leftAt))
        );

      return {
        ...match,
        members: memberData,
      };
    })
  );

  return matchesWithMembers;
}

export async function getMatchById(matchId: number) {
  const matchData = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId))
    .limit(1);

  if (matchData.length === 0) return null;

  const memberData = await db
    .select({
      member: members,
      goal: goals,
      matchMember: matchMembers,
    })
    .from(matchMembers)
    .innerJoin(members, eq(matchMembers.memberId, members.id))
    .leftJoin(
      goals,
      and(eq(goals.memberId, members.id), eq(goals.status, "active"))
    )
    .where(and(eq(matchMembers.matchId, matchId), isNull(matchMembers.leftAt)));

  return {
    ...matchData[0],
    members: memberData,
  };
}

// ============================================
// REMATCH REQUEST QUERIES
// ============================================

export async function getPendingRematchRequests() {
  return await db
    .select({
      request: rematchRequests,
      member: members,
      match: matches,
    })
    .from(rematchRequests)
    .innerJoin(members, eq(rematchRequests.memberId, members.id))
    .leftJoin(matches, eq(rematchRequests.currentMatchId, matches.id))
    .where(eq(rematchRequests.status, "pending"))
    .orderBy(desc(rematchRequests.createdAt));
}

// ============================================
// INVITATION QUERIES
// ============================================

export async function getInvitationByToken(token: string) {
  const result = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);

  return result[0] || null;
}

export async function getAllInvitations() {
  return await db
    .select()
    .from(invitations)
    .orderBy(desc(invitations.createdAt));
}

// ============================================
// EMAIL TEMPLATE QUERIES
// ============================================

export async function getEmailTemplateByType(templateType: string) {
  const result = await db
    .select()
    .from(emailTemplates)
    .where(
      and(
        eq(emailTemplates.templateType, templateType),
        eq(emailTemplates.isActive, true)
      )
    )
    .limit(1);

  return result[0] || null;
}

export async function getAllEmailTemplates() {
  return await db
    .select()
    .from(emailTemplates)
    .orderBy(emailTemplates.templateType);
}

// ============================================
// PROGRESS QUERIES
// ============================================

export async function getProgressHistory(memberId: number, limit = 30) {
  return await db
    .select({
      progress: progressUpdates,
      goal: goals,
    })
    .from(progressUpdates)
    .innerJoin(goals, eq(progressUpdates.goalId, goals.id))
    .where(eq(progressUpdates.memberId, memberId))
    .orderBy(desc(progressUpdates.createdAt))
    .limit(limit);
}

// ============================================
// DASHBOARD ANALYTICS QUERIES
// ============================================

export async function getDashboardStats() {
  // Total members (excluding pending/incomplete onboarding)
  const [totalMembersResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(members)
    .where(sql`${members.status} != 'pending'`);

  // Pending members (haven't completed onboarding)
  const [pendingMembersResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(members)
    .where(eq(members.status, "pending"));

  const [matchedMembersResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(members)
    .where(eq(members.status, "matched"));

  const [unmatchedMembersResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(members)
    .where(eq(members.status, "unmatched"));

  // Active matches count
  const [activeMatchesResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(matches)
    .where(eq(matches.status, "active"));

  const [pendingRematchesResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(rematchRequests)
    .where(eq(rematchRequests.status, "pending"));

  const [inactiveMembersResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(members)
    .where(
      and(
        eq(members.status, "unmatched"),
        sql`${members.lastActiveAt} < NOW() - INTERVAL '7 days'`
      )
    );

  // Goal category breakdown (only for completed members)
  const categoryBreakdown = await db
    .select({
      category: goals.category,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(goals)
    .innerJoin(members, eq(goals.memberId, members.id))
    .where(and(eq(goals.status, "active"), sql`${members.status} != 'pending'`))
    .groupBy(goals.category);

  // Average progress score (only for completed members)
  const [avgProgressResult] = await db
    .select({
      avgScore: sql<number>`cast(avg(${goals.currentProgress}) as decimal(4,2))`,
    })
    .from(goals)
    .innerJoin(members, eq(goals.memberId, members.id))
    .where(
      and(eq(goals.status, "active"), sql`${members.status} != 'pending'`)
    );

  return {
    totalMembers: totalMembersResult.count || 0,
    pendingMembers: pendingMembersResult.count || 0,
    matchedMembers: matchedMembersResult.count || 0,
    unmatchedMembers: unmatchedMembersResult.count || 0,
    activeMatches: activeMatchesResult.count || 0,
    pendingRematches: pendingRematchesResult.count || 0,
    inactiveMembers: inactiveMembersResult.count || 0,
    categoryBreakdown: categoryBreakdown || [],
    avgProgressScore: avgProgressResult.avgScore || 0,
  };
}

// ============================================
// EMAIL LOG QUERIES
// ============================================

export async function getRecentEmailLogs(limit = 50) {
  return await db
    .select()
    .from(emailLogs)
    .orderBy(desc(emailLogs.sentAt))
    .limit(limit);
}

export async function getEmailLogsByMember(memberId: number, limit = 20) {
  return await db
    .select()
    .from(emailLogs)
    .where(eq(emailLogs.memberId, memberId))
    .orderBy(desc(emailLogs.sentAt))
    .limit(limit);
}
