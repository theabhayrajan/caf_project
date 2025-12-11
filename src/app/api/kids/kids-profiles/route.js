import { NextResponse } from "next/server";
import { db } from "@/config/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    const [rows] = await db.execute(
      "SELECT id, full_name, grade, accreditation FROM kids_profiles WHERE user_id = ?",
      [userId]
    );

    return NextResponse.json({ success: true, kids: rows });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
