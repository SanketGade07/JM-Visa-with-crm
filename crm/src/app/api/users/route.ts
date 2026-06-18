import { NextRequest, NextResponse } from "next/server";
import { readUsers, writeUsers } from "@/utils/db";
import { CrmUser } from "@/context/CrmContext";
import { normalizeAllowedTabs, normalizePermissions } from "@/utils/crmConstants";

// GET /api/users — Retrieve all user accounts
export async function GET(req: NextRequest) {
  try {
    const users = (await readUsers()).map((user) => ({
      ...user,
      allowedTabs: normalizeAllowedTabs(user.allowedTabs),
      permissions: normalizePermissions(user.permissions, user.role),
    }));
    // Return all users. In a production app we'd strip passwords, 
    // but in this mock sandbox it helps verification.
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to read users" }, { status: 500 });
  }
}

// POST /api/users — Create, Update, or Delete user accounts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const existingUsers = await readUsers();

    // 1. Bulk sync/overwrite users
    if (Array.isArray(body.users)) {
      const normalizedUsers = body.users.map((user: CrmUser) => ({
        ...user,
        allowedTabs: normalizeAllowedTabs(user.allowedTabs),
        permissions: normalizePermissions(user.permissions, user.role),
      }));
      const ok = await writeUsers(normalizedUsers);
      return ok
        ? NextResponse.json({ success: true })
        : NextResponse.json({ error: "Failed to write users" }, { status: 500 });
    }

    // 2. Reset password
    if (body.action === "RESET_PASSWORD") {
      const userId = body.id;
      const enteredPassword = typeof body.password === "string" ? body.password.trim() : "";
      if (!userId) {
        return NextResponse.json({ error: "id is required for password reset" }, { status: 400 });
      }
      if (userId === "user-admin") {
        return NextResponse.json({ error: "Cannot reset primary admin password" }, { status: 400 });
      }

      const existingUser = existingUsers.find((u) => u.id === userId);
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const newPassword = enteredPassword || `jm${Math.floor(100000 + Math.random() * 900000)}`;
      if (!newPassword) {
        return NextResponse.json({ error: "Password cannot be empty" }, { status: 400 });
      }
      const updatedUser: CrmUser = { ...existingUser, password: newPassword };
      const updatedUsersList = existingUsers.map((u) => (u.id === userId ? updatedUser : u));
      const ok = await writeUsers(updatedUsersList);
      if (!ok) {
        return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
      }

      return NextResponse.json({ success: true, user: updatedUser, password: newPassword });
    }

    // 3. Delete user
    if (body.action === "DELETE") {
      const userId = body.id;
      if (!userId) {
        return NextResponse.json({ error: "id is required for delete" }, { status: 400 });
      }
      
      // Prevent deleting seed admin
      if (userId === "user-admin") {
        return NextResponse.json({ error: "Cannot delete primary admin account" }, { status: 400 });
      }

      const updatedUsers = existingUsers.filter((u) => u.id !== userId);
      const ok = await writeUsers(updatedUsers);
      return ok
        ? NextResponse.json({ success: true })
        : NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }

    // 3. Create or Update single user
    const userId = body.id || `user-${Date.now()}`;
    const userEmail = body.email;
    const userName = body.name || "Unnamed User";
    const userRole = body.role || "COUNSELOR";
    const userPassword = body.password || "password123";
    const userAllowedTabs = normalizeAllowedTabs(body.allowedTabs || ["Dashboard"]);
    const userPermissions = normalizePermissions(body.permissions, userRole);

    if (!userEmail) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const updatedUser: CrmUser = {
      id: userId,
      name: userName,
      email: userEmail,
      role: userRole,
      password: userPassword,
      allowedTabs: userAllowedTabs,
      permissions: userPermissions,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    let updatedUsersList: CrmUser[] = [];
    const isExisting = existingUsers.some((u) => u.id === userId);

    if (isExisting) {
      updatedUsersList = existingUsers.map((u) => (u.id === userId ? updatedUser : u));
    } else {
      // Check duplicate email for new user
      const isEmailTaken = existingUsers.some((u) => u.email.toLowerCase() === userEmail.toLowerCase());
      if (isEmailTaken) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
      }
      updatedUsersList = [...existingUsers, updatedUser];
    }

    const ok = await writeUsers(updatedUsersList);
    if (!ok) {
      return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: updatedUser }, { status: isExisting ? 200 : 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
