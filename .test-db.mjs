import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query('SELECT * FROM files ORDER BY last_accessed_at DESC LIMIT 1');
    console.log(res.rows);
  } catch (err) {
    console.error("PG ERROR:", err);
  } finally {
    await pool.end();
  }
}
run();
