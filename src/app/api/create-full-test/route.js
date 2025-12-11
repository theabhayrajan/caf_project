import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

export async function POST(req) {
  try {
    const form = await req.formData();

    const class_id = form.get("class_id");
    const test_code = form.get("test_code");
    const video_link = form.get("video_link");
    const total_questions = Number(form.get("total_questions"));
    const questionsJson = form.get("questions");

    const questions = JSON.parse(questionsJson);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });

    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "caf_system",
    });

    const [classTestResult] = await db.execute(
      `INSERT INTO class_tests (class_id, test_code, created_at)
       VALUES (?, ?, NOW())`,
      [class_id, test_code]
    );

    const classTestId = classTestResult.insertId;
    for (let i = 0; i < questions.length; i++) {
      const file = form.get(`image_${i}`);

      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const ext = file.type.split("/")[1] || "png";
        const filename = `q_${Date.now()}_${i}.${ext}`;
        const filepath = path.join(uploadDir, filename);

        fs.writeFileSync(filepath, buffer);

        questions[i].image_url = `/uploads/${filename}`;
      } else {
        if (!questions[i].image_url) {
          questions[i].image_url = "";
        }
      }
    }

    const [questionsResult] = await db.execute(
      `INSERT INTO questions (class_test_id, video_link, total_questions, created_at)
       VALUES (?, ?, ?, NOW())`,
      [classTestId, video_link, total_questions]
    );

    const questionId = questionsResult.insertId;

    for (const q of questions) {
      await db.execute(
        `INSERT INTO question_list 
           (question_id, title, image_url, question_choice1, question_choice2, 
            question_choice3, question_choice4, correct_answer, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          questionId,
          q.title || "",
          q.image_url || "",
          q.options[1] || "",
          q.options[2] || "",
          q.options[3] || "",
          q.options[4] || "",
          q.correctAnswer,
        ]
      );
    }

    await db.end();

    return new Response(
      JSON.stringify({
        success: true,
        class_test_id: classTestId,
        question_id: questionId,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("CREATE FULL TEST ERROR:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
