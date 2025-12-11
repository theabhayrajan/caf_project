import { NextResponse } from "next/server";
import { db } from "../../../../config/db";
 
export async function POST(req) {
  try {
    const { phone, role_id } = await req.json();
 
    if (!phone || !role_id) {
      return NextResponse.json({ success: false, message: "Missing fields" });
    }
 
    // Check if number already exists
    const [rows] = await db.execute("SELECT * FROM users WHERE phone = ?", [phone]);
 
    // If found with different role_id → BLOCK
    if (rows.length > 0 && rows[0].role_id !== role_id) {
      return NextResponse.json({
        success: false,
        message: `This number is already registered with a different role.`,
      });
    }
 
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);
 
    if (rows.length === 0) {
      // Insert new user with role_id
      await db.execute(
        "INSERT INTO users (phone, role_id, otp, otp_expiry, created_at) VALUES (?, ?, ?, ?, NOW())",
        [phone, role_id, otp, expiry]
      );
    } else {
      // Update OTP only
      await db.execute(
        "UPDATE users SET otp = ?, otp_expiry = ?, updated_at = NOW() WHERE phone = ?",
        [otp, expiry, phone]
      );
    }
 
    return NextResponse.json({
      success: true,
      otp: otp,
      message: "OTP sent",
    });
 
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message });
  }
}