import { NextResponse } from "next/server";
import { db } from "../../../../config/db";
 
export async function POST(req) {
  try {
    const { phone, otp } = await req.json();
 
    const [rows] = await db.execute("SELECT * FROM users WHERE phone = ?", [phone]);
 
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" });
    }
 
    const user = rows[0];
 
    if (user.otp !== otp) {
      return NextResponse.json({ success: false, message: "Invalid OTP" });
    }
 
    // ---- Role mapping ----
    const roleNames = {
      1: "psychologist",
      2: "principal",
      3: "kids"
    };
 
    const role = roleNames[user.role_id]; // convert ID → name
 
    // Check profile exists according to role
    let hasDetails = false;
 
    if (user.role_id === 2) {     // principal
      const [profile] = await db.execute(
        "SELECT * FROM principal_profiles WHERE user_id = ?",
        [user.id]
      );
      hasDetails = profile.length > 0;
    }
 
    if (user.role_id === 1) {     // psychologist
      const [profile] = await db.execute(
        "SELECT * FROM psychologist_profiles WHERE user_id = ?",
        [user.id]
      );
      hasDetails = profile.length > 0;
    }
 
    if (user.role_id === 3) {     // kids
      const [profile] = await db.execute(
        "SELECT * FROM kids_profiles WHERE user_id = ?",
        [user.id]
      );
      hasDetails = profile.length > 0;
    }
 
    return NextResponse.json({
      success: true,
      userId: user.id,
      role_id: user.role_id, 
      role: role,             
      hasDetails
    });
 
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
 
 