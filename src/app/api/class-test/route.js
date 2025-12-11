import mysql from "mysql2/promise";

export async function POST(req) {
  try {
    const form = await req.formData();

    const id = form.get("id");
    const class_id = form.get("class_id");
    const test_code = form.get("test_code");

    if (!class_id || !test_code) {
      return Response.json({ success: false, error: "Missing fields" });
    }

    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    // Check if test already exists
    const [rows] = await db.execute(
      "SELECT id FROM class_tests WHERE class_id=? AND test_code=?",
      [class_id, test_code]
    );

    if (rows.length > 0) {
      return Response.json({ success: true, id: rows[0].id });
    }

    // Insert new test
    const [insert] = await db.execute(
      "INSERT INTO class_tests (class_id, test_code) VALUES (?, ?)",
      [class_id, test_code]
    );

    return Response.json({ success: true, id: insert.insertId });

  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}
