import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSignedDownloadUrl } from '@/lib/s3';

export async function GET(req, context) {
  try {
    // ✅ params is async in Next 15/16
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `SELECT id, name, s3_key
       FROM files
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    const file = rows[0];

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const url = await getSignedDownloadUrl(file.s3_key);

    return NextResponse.json({ url });
  } catch (err) {
    console.error('DOWNLOAD ROUTE ERROR:', err);

    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
