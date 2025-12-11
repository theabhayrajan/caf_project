import { NextResponse } from "next/server";
import { db } from "@/config/db";

export async function PUT(req, context) {
  try {
    const { id } = await context.params;   // yahan await karo

    const { userId, name, grade, accreditation } = await req.json();

    if (!id || !userId || !name) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      `UPDATE kids_profiles
       SET full_name = ?, grade = ?, accreditation = ?
       WHERE id = ? AND user_id = ?`,
      [name, grade, accreditation, id, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Kid not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
