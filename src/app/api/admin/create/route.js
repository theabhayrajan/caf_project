import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

// DB Connection
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});


export async function GET() {
  return NextResponse.json({
    message: "Admin Create API is working. Use POST to create admin.",
  });
}


export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO superadmin (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    return NextResponse.json(
      { success: true, message: "Admin created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
