import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

// Database config - UPDATE THESE VALUES
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

export async function GET() {
    try {
        // console.log("Fetching homepage data...");
        const [rows] = await pool.execute(
            "SELECT * FROM home_page_content WHERE component_name = 'HomePage'"
        );

        // console.log(" Found rows:", rows.length);
        if (rows.length === 0) {
            console.log(" No data found, returning empty");
            return NextResponse.json({ data: null });
        }

        // console.log("Returning data:", rows[0]);
        return NextResponse.json({ data: rows[0] });
    } catch (error) {
        console.error(' Database GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request) {
    const connection = await pool.getConnection();

    try {
        // console.log("Saving homepage data...");
        const body = await request.json();
        // console.log(" Received body keys:", Object.keys(body));

        // UPDATE QUERY - EXACT TABLE STRUCTURE
        const query = `
      UPDATE home_page_content SET
        quote_text = ?, quote_author = ?, quote_author_info = ?, quote_image_url = ?,
        programs_data = ?, programs_main_title = ?,
        assessments_data = ?, assessments_main_heading = ?, assessments_main_paragraph = ?,
        program_card_image_url = ?, program_card_title = ?, program_card_paragraph = ?,
        child_dev_main_title = ?, child_dev_main_paragraph = ?, child_dev_stages = ?,
        faqs_heading = ?, faqs_data = ?,
        footer_quote = ?, footer_author = ?, footer_author_info = ?, footer_image_url = ?,
        footer_copyright = ?, footer_about_text = ?, footer_about_link = ?, footer_contact_text = ?, footer_contact_link = ?
      WHERE component_name = 'HomePage'
    `;

        const values = [
            // QuoteSection
            body.quote_text || null,
            body.quote_author || null,
            body.quote_author_info || null,
            body.quote_image_url || null,

            // ProgramsSection
            body.programs_data || null,
            body.programs_main_title || null,

            // CafAssessments  
            body.assessments_data || null,
            body.assessments_main_heading || null,
            body.assessments_main_paragraph || null,

            // SchoolProgramCard
            body.program_card_image_url || null,
            body.program_card_title || null,
            body.program_card_paragraph || null,

            // ChildDevelopment
            body.child_dev_main_title || null,
            body.child_dev_main_paragraph || null,
            body.child_dev_stages || null,

            // FAQ
            body.faqs_heading || null,
            body.faqs_data || null,

            // Footer
            body.footer_quote || null,
            body.footer_author || null,
            body.footer_author_info || null,
            body.footer_image_url || null,
            body.footer_copyright || DEFAULT,
            body.footer_about_text || DEFAULT,
            body.footer_about_link || DEFAULT,
            body.footer_contact_text || DEFAULT,
            body.footer_contact_link || DEFAULT,
        ];

        // console.log("Executing UPDATE with values...");
        const [result] = await connection.execute(query, values);
        // console.log("Update result:", result);

        if (result.affectedRows === 0) {
            console.log("No rows updated - data might not exist");
            return NextResponse.json({ error: 'No homepage data found to update' }, { status: 404 });
        }

        console.log("Homepage updated successfully!");
        return NextResponse.json({ success: true, message: 'Homepage updated successfully' });

    } catch (error) {
        console.error(' Database POST error:', error);
        return NextResponse.json({
            error: 'Failed to update: ' + error.message
        }, { status: 500 });
    } finally {
        connection.release();
    }
}
