import { NextResponse } from "next/server";
import { db } from "../../../config/db";

export async function POST(req) {
  try {
    const { test_code } = await req.json();

    const [rows] = await db.execute(
      "SELECT id FROM class_tests WHERE test_code = ?",
      [test_code]
    );

    return NextResponse.json({
      exists: rows.length > 0
    });

  } catch (err) {
    return NextResponse.json(
      { exists: false, error: err.message },
      { status: 500 }
    );
  }
}