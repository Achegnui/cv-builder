import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser, AUTH_COOKIE_NAME } from "@/lib/supabase/store";

const LoginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const { user, session } = await loginUser(email, password);

    const response = NextResponse.json({
      success: true,
      user,
      token: session.token,
    });

    response.cookies.set(AUTH_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid email or password";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
