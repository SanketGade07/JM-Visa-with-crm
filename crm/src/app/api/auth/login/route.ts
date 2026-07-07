import { NextRequest, NextResponse } from "next/server";
import { readUsers, writeUsers } from "@/utils/db";
import { normalizePermissions } from "@/utils/crmConstants";
import { signSession, verifyPassword, hashPassword } from "@/utils/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Read dynamic user accounts from Supabase storage
    const users = await readUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    let isMatch = false;

    if (user) {
      const storedPassword = user.password || "";
      if (storedPassword.includes(":")) {
        isMatch = await verifyPassword(password, storedPassword);
      } else {
        isMatch = storedPassword === password;
      }
    }

    if (!isMatch || !user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Generate cryptographically signed session token
    const sessionToken = await signSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json({ 
      success: true, 
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        allowedTabs: user.allowedTabs,
        permissions: normalizePermissions(user.permissions, user.role),
      }
    });

    // Set the secure signed session cookie that the middleware will read and verify
    res.cookies.set("crm_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8-hour session
    });

    // Set the crm_role cookie for legacy frontend UI state fallback
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

