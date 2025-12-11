import mysql from "mysql2/promise";

export async function GET(req, context) {
  const { id } = await context.params;  

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
  }

  try {
    const db = await mysql.createConnection({
     host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
    });

    const [testRows] = await db.execute(
      "SELECT * FROM questions WHERE id = ?",
      [id]
    );

    if (testRows.length === 0) {
      return new Response(JSON.stringify({ error: "Test not found" }), {
        status: 404,
      });
    }

    const test = testRows[0];
    const [questionList] = await db.execute(
      "SELECT * FROM question_list WHERE question_id = ?",
      [id]
    );

    await db.end();

    return new Response(
      JSON.stringify({
        test,
        questions: questionList,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.log("TEST FETCH ERROR:", err);
    return new Response(JSON.stringify({ error: "Server Error" }), {
      status: 500,
    });
  }
}
