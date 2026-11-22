import { describe, it, expect, beforeEach, vi } from "vitest";
import { SAMPLE_CV } from "@/lib/schema";
import { SAMPLE_VAULT_FACTS } from "@/lib/vault";
import { resetInMemoryStore } from "@/lib/supabase/store";
import { POST as handleSignUp } from "@/app/api/auth/signup/route";
import { POST as handleLogin } from "@/app/api/auth/login/route";
import { POST as handleLogout } from "@/app/api/auth/logout/route";
import { GET as handleMe } from "@/app/api/auth/me/route";
import { POST as handleDeleteAccount } from "@/app/api/auth/delete-account/route";
import { GET as handleListCVs, POST as handleCreateCV } from "@/app/api/cvs/route";
import {
  GET as handleGetCV,
  PUT as handleUpdateCV,
  DELETE as handleDeleteCV,
} from "@/app/api/cvs/[id]/route";

describe("Phase 8a: Supabase Accounts, Multi-Version Storage & Row-Level Isolation", () => {
  beforeEach(() => {
    resetInMemoryStore();
  });

  describe("Authentication Flow (Sign-up, Login, Logout, Session)", () => {
    it("rejects sign-up with invalid email or weak password", async () => {
      // Short password (< 8 chars)
      const res1 = await handleSignUp(
        new Request("http://localhost/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "user@example.com", password: "123" }),
        })
      );
      expect(res1.status).toBe(400);
      const data1 = await res1.json();
      expect(data1.error).toContain("at least 8 characters");

      // Invalid email
      const res2 = await handleSignUp(
        new Request("http://localhost/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "invalid-email-format", password: "securePassword123" }),
        })
      );
      expect(res2.status).toBe(400);
      const data2 = await res2.json();
      expect(data2.error).toContain("valid email");
    });

    it("registers user, creates session, and prevents duplicate registration", async () => {
      const res = await handleSignUp(
        new Request("http://localhost/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "student@example.com",
            password: "superSecretPassword2026",
          }),
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.user.email).toBe("student@example.com");
      expect(data.token).toBeDefined();

      // Duplicate attempt must fail
      const dupRes = await handleSignUp(
        new Request("http://localhost/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "student@example.com",
            password: "superSecretPassword2026",
          }),
        })
      );
      expect(dupRes.status).toBe(400);
      const dupData = await dupRes.json();
      expect(dupData.error).toContain("already exists");
    });

    it("authenticates existing user with correct credentials and rejects incorrect password", async () => {
      // 1. Create user
      await handleSignUp(
        new Request("http://localhost/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "alex@example.com",
            password: "correctPassword123",
          }),
        })
      );

      // 2. Try wrong password
      const badLogin = await handleLogin(
        new Request("http://localhost/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "alex@example.com",
            password: "wrongPassword",
          }),
        })
      );
      expect(badLogin.status).toBe(401);

      // 3. Try correct password
      const goodLogin = await handleLogin(
        new Request("http://localhost/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "alex@example.com",
            password: "correctPassword123",
          }),
        })
      );
      expect(goodLogin.status).toBe(200);
      const loginData = await goodLogin.json();
      expect(loginData.success).toBe(true);
      expect(loginData.user.email).toBe("alex@example.com");
      expect(loginData.token).toBeDefined();

      // 4. Test me endpoint with Bearer token
      const meRes = await handleMe(
        new Request("http://localhost/api/auth/me", {
          headers: { Authorization: `Bearer ${loginData.token}` },
        })
      );
      expect(meRes.status).toBe(200);
      const meData = await meRes.json();
      expect(meData.authenticated).toBe(true);
      expect(meData.user.email).toBe("alex@example.com");

      // 5. Test logout
      const logoutRes = await handleLogout(
        new Request("http://localhost/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${loginData.token}` },
        })
      );
      expect(logoutRes.status).toBe(200);

      // 6. Token is revoked after logout
      const meAfterLogout = await handleMe(
        new Request("http://localhost/api/auth/me", {
          headers: { Authorization: `Bearer ${loginData.token}` },
        })
      );
      expect(meAfterLogout.status).toBe(401);
    });
  });

  describe("Multi-Tenant Isolation: User A vs User B (Row-Level Security)", () => {
    let tokenUserA: string;
    let tokenUserB: string;

    beforeEach(async () => {
      // Register User A
      const resA = await handleSignUp(
        new Request("http://localhost/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "userA@example.com", password: "PasswordA123!" }),
        })
      );
      const dataA = await resA.json();
      tokenUserA = dataA.token;

      // Register User B
      const resB = await handleSignUp(
        new Request("http://localhost/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "userB@example.com", password: "PasswordB123!" }),
        })
      );
      const dataB = await resB.json();
      tokenUserB = dataB.token;
    });

    it("requires authentication to access CV version routes", async () => {
      const unauthGet = await handleListCVs(new Request("http://localhost/api/cvs"));
      expect(unauthGet.status).toBe(401);

      const unauthPost = await handleCreateCV(
        new Request("http://localhost/api/cvs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "My CV", cvData: SAMPLE_CV }),
        })
      );
      expect(unauthPost.status).toBe(401);
    });

    it("proves User B cannot see User A's CV versions in list", async () => {
      // User A creates 2 versions
      await handleCreateCV(
        new Request("http://localhost/api/cvs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenUserA}`,
          },
          body: JSON.stringify({
            title: "User A - Frontend Tech Lead",
            cvData: SAMPLE_CV,
          }),
        })
      );

      await handleCreateCV(
        new Request("http://localhost/api/cvs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenUserA}`,
          },
          body: JSON.stringify({
            title: "User A - Academic Resume",
            cvData: SAMPLE_CV,
          }),
        })
      );

      // User A list has 2 items
      const listA = await handleListCVs(
        new Request("http://localhost/api/cvs", {
          headers: { Authorization: `Bearer ${tokenUserA}` },
        })
      );
      const dataA = await listA.json();
      expect(dataA.cvs.length).toBe(2);

      // User B list must be completely empty!
      const listB = await handleListCVs(
        new Request("http://localhost/api/cvs", {
          headers: { Authorization: `Bearer ${tokenUserB}` },
        })
      );
      const dataB = await listB.json();
      expect(dataB.cvs.length).toBe(0);
    });

    it("proves User B cannot read User A's CV by ID (returns 404)", async () => {
      // User A creates a CV version
      const createRes = await handleCreateCV(
        new Request("http://localhost/api/cvs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenUserA}`,
          },
          body: JSON.stringify({
            title: "User A Confidential CV",
            cvData: SAMPLE_CV,
            vaultData: SAMPLE_VAULT_FACTS,
          }),
        })
      );
      const created = await createRes.json();
      const cvId = created.cv.id;

      // User A can read it
      const readA = await handleGetCV(
        new Request(`http://localhost/api/cvs/${cvId}`, {
          headers: { Authorization: `Bearer ${tokenUserA}` },
        }),
        { params: Promise.resolve({ id: cvId }) }
      );
      expect(readA.status).toBe(200);
      const dataA = await readA.json();
      expect(dataA.cv.title).toBe("User A Confidential CV");

      // User B attempts to read User A's CV -> must return 404 (does NOT disclose existence)
      const readB = await handleGetCV(
        new Request(`http://localhost/api/cvs/${cvId}`, {
          headers: { Authorization: `Bearer ${tokenUserB}` },
        }),
        { params: Promise.resolve({ id: cvId }) }
      );
      expect(readB.status).toBe(404);
      const dataB = await readB.json();
      expect(dataB.cv).toBeUndefined();
    });

    it("proves User B cannot modify or overwrite User A's CV", async () => {
      const createRes = await handleCreateCV(
        new Request("http://localhost/api/cvs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenUserA}`,
          },
          body: JSON.stringify({
            title: "User A Original Title",
            cvData: SAMPLE_CV,
          }),
        })
      );
      const cvId = (await createRes.json()).cv.id;

      // User B attempts to overwrite User A's CV
      const maliciousUpdate = await handleUpdateCV(
        new Request(`http://localhost/api/cvs/${cvId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenUserB}`,
          },
          body: JSON.stringify({
            title: "Hacked by User B",
          }),
        }),
        { params: Promise.resolve({ id: cvId }) }
      );

      // Must be rejected with 404
      expect(maliciousUpdate.status).toBe(404);

      // Verify User A's data was NOT changed
      const verifyRes = await handleGetCV(
        new Request(`http://localhost/api/cvs/${cvId}`, {
          headers: { Authorization: `Bearer ${tokenUserA}` },
        }),
        { params: Promise.resolve({ id: cvId }) }
      );
      const verifiedData = await verifyRes.json();
      expect(verifiedData.cv.title).toBe("User A Original Title");
    });

    it("proves User B cannot delete User A's CV", async () => {
      const createRes = await handleCreateCV(
        new Request("http://localhost/api/cvs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenUserA}`,
          },
          body: JSON.stringify({
            title: "User A Protected CV",
            cvData: SAMPLE_CV,
          }),
        })
      );
      const cvId = (await createRes.json()).cv.id;

      // User B attempts to delete User A's CV
      const deleteAttempt = await handleDeleteCV(
        new Request(`http://localhost/api/cvs/${cvId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenUserB}` },
        }),
        { params: Promise.resolve({ id: cvId }) }
      );

      // Must be rejected with 404
      expect(deleteAttempt.status).toBe(404);

      // User A can still retrieve the CV
      const checkA = await handleGetCV(
        new Request(`http://localhost/api/cvs/${cvId}`, {
          headers: { Authorization: `Bearer ${tokenUserA}` },
        }),
        { params: Promise.resolve({ id: cvId }) }
      );
      expect(checkA.status).toBe(200);
    });
  });

  describe("Delete Account & All Data (Rule 5 Privacy Requirement)", () => {
    it("permanently deletes user account, session, and all saved CV versions", async () => {
      // 1. Sign up user
      const signUpRes = await handleSignUp(
        new Request("http://localhost/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "to-delete@example.com", password: "Password123!" }),
        })
      );
      const { token } = await signUpRes.json();

      // 2. Create multiple CV versions
      await handleCreateCV(
        new Request("http://localhost/api/cvs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: "CV Version 1", cvData: SAMPLE_CV }),
        })
      );
      await handleCreateCV(
        new Request("http://localhost/api/cvs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: "CV Version 2", cvData: SAMPLE_CV }),
        })
      );

      // Verify versions exist
      const listBefore = await handleListCVs(
        new Request("http://localhost/api/cvs", {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect((await listBefore.json()).cvs.length).toBe(2);

      // 3. Request account deletion
      const deleteRes = await handleDeleteAccount(
        new Request("http://localhost/api/auth/delete-account", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(deleteRes.status).toBe(200);

      // 4. Token is now invalid
      const meRes = await handleMe(
        new Request("http://localhost/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(meRes.status).toBe(401);

      // 5. Trying to log in again with old password fails
      const loginAttempt = await handleLogin(
        new Request("http://localhost/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "to-delete@example.com", password: "Password123!" }),
        })
      );
      expect(loginAttempt.status).toBe(401);
    });

    it("complies with privacy rule: never logs CV content to console", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");

      const signUpRes = await handleSignUp(
        new Request("http://localhost/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "privacy@example.com", password: "Password123!" }),
        })
      );
      const { token } = await signUpRes.json();

      await handleCreateCV(
        new Request("http://localhost/api/cvs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "Privacy Sensitive CV",
            cvData: SAMPLE_CV,
          }),
        })
      );

      // Ensure no call to console.log contained candidate name or bullet content
      consoleLogSpy.mock.calls.forEach((call) => {
        const text = call.join(" ");
        expect(text).not.toContain("Alex Sample");
        expect(text).not.toContain("Architected component library");
        expect(text).not.toContain("alex.sample@fictional-email.example");
      });

      consoleLogSpy.mockRestore();
    });
  });
});
