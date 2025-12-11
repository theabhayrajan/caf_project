import mysql from "mysql2/promise";

export async function DELETE(req) {
  try {
    const { id } = await req.json();  // id = class_tests.id

    if (!id) {
      return Response.json({ success: false, error: "Missing id" });
    }

    const db = await mysql.createConnection({
    host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
    });

    // 1️⃣ FIRST: Get all question IDs from questions table linked with class_test_id
    const [questionRows] = await db.execute(
      "SELECT id FROM questions WHERE class_test_id = ?",
      [id]
    );

    // 2️⃣ Delete all question_list rows for each question_id
    for (const q of questionRows) {
      await db.execute("DELETE FROM question_list WHERE question_id = ?", [q.id]);
    }

    // 3️⃣ Delete from questions table
    await db.execute("DELETE FROM questions WHERE class_test_id = ?", [id]);

    // 4️⃣ Finally delete from class_tests table
    await db.execute("DELETE FROM class_tests WHERE id = ?", [id]);

    await db.end();

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return Response.json(
      { success: false, error: "Server Error" },
      { status: 500 }
    );
  }
}
