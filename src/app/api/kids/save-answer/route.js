// app/api/kids/save-answer/route.js
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(req) {
  const body = await req.json();
  const {
    kid_id,
    test_code,
    class_test_id,
    questions_id,
    question_list_id,
    question_title,
    selected_option,
    is_correct,
  } = body;

  if (
    !kid_id ||
    !test_code ||
    !class_test_id ||
    !questions_id ||
    !question_list_id ||
    !selected_option
  ) {
    return NextResponse.json(
      { success: false, error: "Missing fields" },
      { status: 400 }
    );
  }

  const marks = is_correct ? 1 : 0;

  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    await db.execute(
      `INSERT INTO kid_test_results
       (kid_id, test_code, class_test_id, questions_id, question_list_id,
        question_title, selected_option, is_correct, marks, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        kid_id,
        test_code,
        class_test_id,
        questions_id,
        question_list_id,
        question_title,
        selected_option,
        is_correct ? 1 : 0,
        marks,
      ]
    );

    await db.end();
    return NextResponse.json({ success: true });
  } catch (err) {
    await db.end();
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
