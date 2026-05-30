import { NextRequest, NextResponse } from "next/server";
import { readExpenses, writeExpenses } from "@/utils/db";
import { Expense } from "@/context/CrmContext";

// GET /api/expenses — list all expenses
// ?category=Office  ?from=2026-01-01  ?to=2026-12-31
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let expenses = readExpenses();
    if (category) expenses = expenses.filter((e) => e.category === category);
    if (from) expenses = expenses.filter((e) => e.date >= from);
    if (to) expenses = expenses.filter((e) => e.date <= to);

    expenses.sort((a, b) => b.date.localeCompare(a.date));

    const total = expenses.reduce((acc, e) => acc + e.amount, 0);
    return NextResponse.json({ expenses, total, count: expenses.length });
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to read expenses" }, { status: 500 });
  }
}

// POST /api/expenses — log a new business expense
// Body: { category, amount, description, date, receipt?, createdBy }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.category || body.amount == null) {
      return NextResponse.json({ error: "category and amount are required" }, { status: 400 });
    }

    const expense: Expense = {
      id: `exp-${Date.now()}`,
      category: body.category,
      amount: Number(body.amount),
      description: body.description || "",
      date: body.date || new Date().toISOString().split("T")[0],
      receipt: body.receipt || undefined,
      createdBy: body.createdBy || "SYSTEM",
      createdAt: new Date().toISOString(),
    };

    const existing = readExpenses();
    const ok = writeExpenses([...existing, expense]);
    if (!ok) return NextResponse.json({ error: "Failed to save expense" }, { status: 500 });

    return NextResponse.json({ success: true, expense }, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to process expense" }, { status: 500 });
  }
}
