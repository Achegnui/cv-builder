import { NextResponse } from "next/server";
import { z } from "zod";
import { signUpUser, AUTH_COOKIE_NAME } from "@/lib/supabase/store";

const SignUpSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = SignUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const { user, session } = await signUpUser(email, password);

    const response = NextResponse.json({
      success: true,
      user,
      token: session.token,
    });

    // Set HTTP-only session cookie
    response.cookies.set(AUTH_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to sign up";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
