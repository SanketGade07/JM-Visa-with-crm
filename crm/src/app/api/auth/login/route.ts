import { NextRequest, NextResponse } from "next/server";

// Simple credential check — replace with NextAuth + bcrypt (guide §7) once
// a user database is provisioned. Until then, credentials come from .env.
const VALID_USERS = [
  { email: "admin@jmvisa.com",    password: process.env.ADMIN_PASSWORD    || "admin123",    role: "ADMIN" },
  { email: "manager@jmvisa.com",  password: process.env.MANAGER_PASSWORD  || "manager123",  role: "MANAGER" },
  { email: "counselor@jmvisa.com",password: process.env.COUNSELOR_PASSWORD|| "counselor123",role: "COUNSELOR" },
];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = VALID_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, role: user.role });

    // Set an HTTP-only cookie that the middleware reads (guide §7)
    res.cookies.set("crm_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8-hour session
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
