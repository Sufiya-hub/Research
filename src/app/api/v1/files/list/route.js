// src/app/api/v1/files/list/route.js

import { NextResponse } from 'next/server';

// --- INITIAL MOCK: Empty Array ---
const mockFileData = [
  // Leave this array empty to simulate a new user with no files.
];

/**
 * Handles GET requests for the file list API endpoint.
 */
export async function GET(request) {
  // If you need to test the file card display, you can uncomment the mock data below.
  // Otherwise, returning the empty array simulates the new user experience.
  /*
    const dataWithFiles = [
        { 
            "fileName": "Project Alpha Brief", 
            "size": "1.5 MB",
            "tags": ["AI Tags", "Hot Tier"],
            "type": "PDF",
            "isUrgent": true,
            "isShared": false,
            "s3Key": "user_123/alpha.pdf"
        },
    ];
    // return NextResponse.json(dataWithFiles, { status: 200 });
    */

  return NextResponse.json(mockFileData, { status: 200 });
}
