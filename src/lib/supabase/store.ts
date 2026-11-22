import crypto from "crypto";
import type { User, Session, CVVersion, CVVersionListItem } from "./types";
import type { CVData } from "@/lib/schema";
import type { VaultFact } from "@/lib/vault";

export const AUTH_COOKIE_NAME = "cv_builder_auth_session";

// In-memory multi-tenant store for testing & local development
interface InternalUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface InternalSessionRecord {
  token: string;
  userId: string;
  expiresAt: number;
}

const inMemoryUsers: Map<string, InternalUserRecord> = new Map();
const inMemorySessions: Map<string, InternalSessionRecord> = new Map();
const inMemoryCVVersions: Map<string, CVVersion> = new Map();

/**
 * Resets the in-memory store (used for test isolation)
 */
export function resetInMemoryStore(): void {
  inMemoryUsers.clear();
  inMemorySessions.clear();
  inMemoryCVVersions.clear();
}

/**
 * Hash password with a deterministic salt
 */
function hashPassword(password: string): string {
  const salt = "cv_builder_salt_sec_2026";
  return crypto.createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

/**
 * Checks if live Supabase keys are configured
 */
export function isLiveSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );
}

/**
 * Sign Up a new user
 */
export async function signUpUser(email: string, password: string): Promise<{ user: User; session: Session }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (isLiveSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(`${url}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
      },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.msg || err.message || "Failed to create account in Supabase");
    }

    const data = await response.json();
    const user: User = {
      id: data.user?.id || data.id,
      email: data.user?.email || normalizedEmail,
      createdAt: data.user?.created_at || new Date().toISOString(),
    };
    const session: Session = {
      user,
      token: data.access_token || crypto.randomUUID(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
    };
    return { user, session };
  }

  // In-memory provider (Dev / Tests)
  for (const existing of inMemoryUsers.values()) {
    if (existing.email === normalizedEmail) {
      throw new Error("An account with this email address already exists.");
    }
  }

  const userId = crypto.randomUUID();
  const userRecord: InternalUserRecord = {
    id: userId,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  inMemoryUsers.set(userId, userRecord);

  const token = crypto.randomUUID();
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  inMemorySessions.set(token, { token, userId, expiresAt });

  const user: User = {
    id: userId,
    email: userRecord.email,
    createdAt: userRecord.createdAt,
  };

  return {
    user,
    session: { user, token, expiresAt },
  };
}

/**
 * Login an existing user
 */
export async function loginUser(email: string, password: string): Promise<{ user: User; session: Session }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (isLiveSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
      },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.msg || err.error_description || "Invalid email or password");
    }

    const data = await response.json();
    const user: User = {
      id: data.user?.id,
      email: data.user?.email || normalizedEmail,
      createdAt: data.user?.created_at || new Date().toISOString(),
    };
    const session: Session = {
      user,
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };
    return { user, session };
  }

  // In-memory provider
  let foundUser: InternalUserRecord | undefined;
  for (const u of inMemoryUsers.values()) {
    if (u.email === normalizedEmail) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser || foundUser.passwordHash !== hashPassword(password)) {
    throw new Error("Invalid email or password");
  }

  const token = crypto.randomUUID();
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
  inMemorySessions.set(token, { token, userId: foundUser.id, expiresAt });

  const user: User = {
    id: foundUser.id,
    email: foundUser.email,
    createdAt: foundUser.createdAt,
  };

  return {
    user,
    session: { user, token, expiresAt },
  };
}

/**
 * Verifies a session token and returns the authenticated user
 */
export async function getSessionUser(token: string): Promise<User | null> {
  if (!token) return null;

  if (isLiveSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
      createdAt: data.created_at,
    };
  }

  const sessionRec = inMemorySessions.get(token);
  if (!sessionRec) return null;
  if (Date.now() > sessionRec.expiresAt) {
    inMemorySessions.delete(token);
    return null;
  }

  const userRec = inMemoryUsers.get(sessionRec.userId);
  if (!userRec) return null;

  return {
    id: userRec.id,
    email: userRec.email,
    createdAt: userRec.createdAt,
  };
}

/**
 * Logout session
 */
export async function logoutSession(token: string): Promise<void> {
  if (!token) return;

  if (isLiveSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    await fetch(`${url}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {});
    return;
  }

  inMemorySessions.delete(token);
}

/**
 * Delete account and all data (Cascade delete)
 */
export async function deleteUserAccountAndData(userId: string, token: string): Promise<void> {
  if (isLiveSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // 1. Delete all CV versions belonging to this user
    await fetch(`${url}/rest/v1/cv_versions?user_id=eq.${userId}`, {
      method: "DELETE",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    // 2. Delete user auth account
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await fetch(`${url}/auth/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });
    }
    return;
  }

  // In-memory provider: Cascade delete
  // 1. Remove all CV versions owned by user
  for (const [id, cv] of inMemoryCVVersions.entries()) {
    if (cv.userId === userId) {
      inMemoryCVVersions.delete(id);
    }
  }

  // 2. Remove all sessions for user
  for (const [tokenKey, sess] of inMemorySessions.entries()) {
    if (sess.userId === userId) {
      inMemorySessions.delete(tokenKey);
    }
  }

  // 3. Remove user
  inMemoryUsers.delete(userId);
}

// -----------------------------------------------------------------------------
// CV Versions CRUD (with strict Server-Side RLS Enforcement)
// -----------------------------------------------------------------------------

/**
 * Lists all CV versions belonging to the authenticated user
 */
export async function listUserCVVersions(userId: string, token: string): Promise<CVVersionListItem[]> {
  if (isLiveSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // RLS in Supabase ensures only this user's rows are returned
    const res = await fetch(`${url}/rest/v1/cv_versions?select=id,user_id,title,created_at,updated_at&order=updated_at.desc`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  // In-memory provider: Strict user_id check
  const results: CVVersionListItem[] = [];
  for (const item of inMemoryCVVersions.values()) {
    if (item.userId === userId) {
      results.push({
        id: item.id,
        userId: item.userId,
        title: item.title,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }
  }

  return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Creates a new CV version strictly bound to userId
 */
export async function createCVVersion(
  userId: string,
  token: string,
  title: string,
  cvData: CVData,
  vaultData?: VaultFact[]
): Promise<CVVersion> {
  const versionId = crypto.randomUUID();
  const now = new Date().toISOString();

  if (isLiveSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const res = await fetch(`${url}/rest/v1/cv_versions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${token}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: versionId,
        user_id: userId,
        title,
        cv_data: cvData,
        vault_data: vaultData || [],
        created_at: now,
        updated_at: now,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to save CV version to Supabase");
    }

    const data = await res.json();
    const created = Array.isArray(data) ? data[0] : data;
    return {
      id: created.id,
      userId: created.user_id,
      title: created.title,
      cvData: created.cv_data,
      vaultData: created.vault_data,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    };
  }

  const newVersion: CVVersion = {
    id: versionId,
    userId,
    title,
    cvData,
    vaultData: vaultData || [],
    createdAt: now,
    updatedAt: now,
  };

  inMemoryCVVersions.set(versionId, newVersion);
  return newVersion;
}

/**
 * Retrieves a CV version by ID, strictly verifying ownership (RLS)
 */
export async function getCVVersion(userId: string, token: string, versionId: string): Promise<CVVersion | null> {
  if (isLiveSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const res = await fetch(`${url}/rest/v1/cv_versions?id=eq.${versionId}&select=*`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    const item = data[0];

    // Defense-in-depth: double check ownership
    if (item.user_id !== userId) return null;

    return {
      id: item.id,
      userId: item.user_id,
      title: item.title,
      cvData: item.cv_data,
      vaultData: item.vault_data,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  const existing = inMemoryCVVersions.get(versionId);
  if (!existing) return null;

  // Strict isolation check: User A cannot read User B's CV
  if (existing.userId !== userId) {
    return null;
  }

  return existing;
}

/**
 * Updates a CV version, strictly enforcing ownership (RLS)
 */
export async function updateCVVersion(
  userId: string,
  token: string,
  versionId: string,
  title?: string,
  cvData?: CVData,
  vaultData?: VaultFact[]
): Promise<CVVersion | null> {
  if (isLiveSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const patchBody: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (title) patchBody.title = title;
    if (cvData) patchBody.cv_data = cvData;
    if (vaultData) patchBody.vault_data = vaultData;

    const res = await fetch(`${url}/rest/v1/cv_versions?id=eq.${versionId}&user_id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${token}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(patchBody),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    const item = data[0];
    return {
      id: item.id,
      userId: item.user_id,
      title: item.title,
      cvData: item.cv_data,
      vaultData: item.vault_data,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  const existing = inMemoryCVVersions.get(versionId);
  if (!existing) return null;

  // Strict isolation check: User A cannot update User B's CV
  if (existing.userId !== userId) {
    return null;
  }

  const updated: CVVersion = {
    ...existing,
    title: title || existing.title,
    cvData: cvData || existing.cvData,
    vaultData: vaultData !== undefined ? vaultData : existing.vaultData,
    updatedAt: new Date().toISOString(),
  };

  inMemoryCVVersions.set(versionId, updated);
  return updated;
}

/**
 * Deletes a CV version, strictly enforcing ownership (RLS)
 */
export async function deleteCVVersion(userId: string, token: string, versionId: string): Promise<boolean> {
  if (isLiveSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const res = await fetch(`${url}/rest/v1/cv_versions?id=eq.${versionId}&user_id=eq.${userId}`, {
      method: "DELETE",
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
      },
    });

    return res.ok;
  }

  const existing = inMemoryCVVersions.get(versionId);
  if (!existing) return false;

  // Strict isolation check: User A cannot delete User B's CV
  if (existing.userId !== userId) {
    return false;
  }

  inMemoryCVVersions.delete(versionId);
  return true;
}
