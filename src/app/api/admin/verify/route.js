import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function POST(req) {
  try {
    const text = await req.text();
    if (!text) return NextResponse.json({ valid: false, error: "Empty body" }, { status: 400 });

    let body;
    try { body = JSON.parse(text); } catch { return NextResponse.json({ valid: false, error: "Invalid JSON" }, { status: 400 }); }

    const { token } = body;
    if (!token) return NextResponse.json({ valid: false, error: "No token provided" }, { status: 400 });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return NextResponse.json({ valid: true, decoded }, { status: 200 });
    } catch (e) {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ valid: false, error: err.message }, { status: 500 });
  }
}
