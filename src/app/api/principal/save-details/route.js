import { NextResponse } from "next/server";
import { db } from "../../../../config/db";

export async function POST(req) {
  const body = await req.json();
  const { userId, name, test_code, city, pincode, is_member } = body;

  await db.execute(
    "INSERT INTO principal_profiles (user_id, name, test_code, city, pincode, is_member) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, name, test_code, city, pincode, is_member]
  );

  return NextResponse.json({ success: true });
}
