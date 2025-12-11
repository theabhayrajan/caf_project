// app/api/kids/class-tests/route.js
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const testCode = searchParams.get("testCode");

    if (!testCode) {
      return NextResponse.json(
        { success: false, message: "Missing testCode" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute(
      "SELECT * FROM class_tests WHERE test_code = ?",
      [testCode]
    );

    await connection.end();

    return NextResponse.json({ success: true, tests: rows });
  } catch (err) {
    console.log("KIDS CLASS_TESTS API ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Error fetching tests" },
      { status: 500 }
    );
  }
}
