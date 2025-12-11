import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    const db = await mysql.createConnection({
     host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
    });

    const [rows] = await db.execute(`
      SELECT 
        q.id,
        q.video_link,
        q.total_questions,
        q.class_test_id,
        ct.class_id,
        c.class_name,
        ct.test_code
      FROM questions q
      LEFT JOIN class_tests ct ON q.class_test_id = ct.id
      LEFT JOIN classes c ON ct.class_id = c.id
      ORDER BY q.id DESC
    `);

    // ⭐ FRONTEND EXPECTS `tests:` key
    return NextResponse.json({
      tests: rows.map(r => ({
        id: r.id,
        class_id: r.class_id,
        test_code: r.test_code,
        video_link: r.video_link,
        questions_count: r.total_questions,
        class_name: r.class_name
      }))
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load tests" },
      { status: 500 }
    );
  }
}
