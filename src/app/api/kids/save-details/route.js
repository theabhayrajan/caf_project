import { NextResponse } from "next/server";
import { db } from "@/config/db"; 

export async function POST(req) {
  try {
    const { userId, name, grade, accreditation} = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing user ID" },
        { status: 400 }
      );
    }

    await db.execute(
      `INSERT INTO kids_profiles 
      (user_id, full_name, grade, accreditation)
      VALUES (?, ?, ?, ?)`,
      [userId, name, grade, accreditation]
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
