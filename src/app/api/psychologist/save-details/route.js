import { NextResponse } from "next/server";
import { db } from "../../../../config/db";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      userId,
      name,
      occupation,
      experience,
      city,
      pincode,
      website,
      is_member,
      provide_counselling,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing user ID" },
        { status: 400 }
      );
    }

    await db.execute(
      `INSERT INTO psychologist_profiles 
  (user_id, name, occupation, experience, city, pincode, website_link, provide_counselling, is_member)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        occupation,
        experience,
        city,
        pincode,
        website, // frontend variable is okay
        provide_counselling ? 1 : 0,
        is_member ? 1 : 0,
      ]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
