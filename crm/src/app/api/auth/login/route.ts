import { NextRequest, NextResponse } from "next/server";
import { readUsers } from "@/utils/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Read dynamic user accounts from Supabase storage
    const users = await readUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const res = NextResponse.json({ 
      success: true, 
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        allowedTabs: user.allowedTabs,
      }
    });

    // Set an HTTP-only cookie that the middleware reads
    res.cookies.set("crm_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8-hour session
    });

    return res;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

