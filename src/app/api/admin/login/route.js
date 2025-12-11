import { NextResponse } from "next/server";
import { db } from "../../../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    const [rows] = await db.execute(
      "SELECT * FROM superadmin WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    console.log("SECRET" , secret)
    if (!secret) {
      return NextResponse.json(
        { error: "JWT secret not configured" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      secret,
      { expiresIn: "1d" }
    );

    // ✅ Set cookie from server (most reliable)
    const response = NextResponse.json({
      message: "Login successful",
      token,
    });

    response.cookies.set({
      name: "caf_admin_token",
      value: token,
      path: "/",
      maxAge: 86400,
      sameSite: "Lax",
    });

    return response;

  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
