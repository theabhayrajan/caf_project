import mysql from "mysql2/promise";

export async function POST(req) {
  try {
    const form = await req.formData();

    const test_id = form.get("test_id");
    const class_test_id = form.get("class_test_id");
    const class_id = form.get("class_id");
    const test_code = form.get("test_code");
    const video_link = form.get("video_link");
    const total_questions = form.get("total_questions");

    const questions = JSON.parse(form.get("questions"));

    const db = await mysql.createConnection({
     host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
    });

    // UPDATE class_tests
    await db.execute(
      `UPDATE class_tests 
       SET class_id=?, test_code=?
       WHERE id=?`,
      [class_id, test_code, class_test_id]
    );

    // UPDATE main test table
    await db.execute(
      `UPDATE questions
       SET video_link=?, total_questions=?
       WHERE id=?`,
      [video_link, total_questions, test_id]
    );

    // UPDATE each question_list row
    for (const q of questions) {
      if (!q?.id) continue;

      await db.execute(
        `UPDATE question_list 
         SET 
           title=?,
           image_url=?,
           question_choice1=?,
           question_choice2=?,
           question_choice3=?,
           question_choice4=?,
           correct_answer=?
         WHERE id=?`,
        [
          q.title ?? "",
          q.image_url ?? null,
          q.options?.[0] ?? "",
          q.options?.[1] ?? "",
          q.options?.[2] ?? "",
          q.options?.[3] ?? "",
          parseInt(q.correctAnswer) || 1, 
          q.id,
        ]
      );
    }

    return Response.json({ success: true });

  } catch (error) {
    console.log("UPDATE ERROR →", error);
    return Response.json({ success: false, error });
  }
}
