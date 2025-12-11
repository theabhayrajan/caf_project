// app/api/kids/full-test/route.js
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const testCode = searchParams.get("testCode");

  if (!testCode) {
    return NextResponse.json(
      { success: false, error: "Missing testCode" },
      { status: 400 }
    );
  }

  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    // 1) class_tests row
    const [classRows] = await db.execute(
      "SELECT id, class_id, test_code FROM class_tests WHERE test_code = ?",
      [testCode]
    );
    if (classRows.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid test code" });
    }
    const classTest = classRows[0];

    // 2) isi test ki saari videos (questions table)
    const [videoRows] = await db.execute(
      "SELECT id, video_link, total_questions FROM questions WHERE class_test_id = ? ORDER BY id ASC",
      [classTest.id]
    );
    if (videoRows.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No questions configured for this test",
      });
    }

    // 3) Har video ke questions (question_list)
    const videos = [];
    for (const v of videoRows) {
      const [qList] = await db.execute(
        `SELECT id, title, image_url,
                question_choice1, question_choice2,
                question_choice3, question_choice4,
                correct_answer
           FROM question_list
          WHERE question_id = ?
          ORDER BY id ASC`,
        [v.id]
      );

      videos.push({
        id: v.id,
        video_link: v.video_link,
        total_questions: v.total_questions,
        questions: qList.map((q) => ({
          id: q.id,
          title: q.title,
          image_url: q.image_url,
          options: [
            q.question_choice1,
            q.question_choice2,
            q.question_choice3,
            q.question_choice4,
          ],
          correct_answer: q.correct_answer, // 1..4
        })),
      });
    }

    await db.end();

    return NextResponse.json({
      success: true,
      class_test_id: classTest.id,
      test_code: classTest.test_code,
      videos,
      total_questions: videos.reduce(
        (sum, v) => sum + (v.total_questions || v.questions.length),
        0
      ),
    });
  } catch (err) {
    await db.end();
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
