// src/backend/drizzle-service/db-operations.js

import { db } from './db-instance'; // Drizzle database instance
import { files, fileEmbeddings } from './schema'; // Your schema tables
import { eq } from 'drizzle-orm'; // Import the query helper

/**
 * Drizzle Logic: File Upload Completion (File Creation)
 * Inserts file metadata and cascades to create the vector embedding record.
 * @param {number} userId - ID of the user owning the file.
 * @param {string} fileName - Display name of the file.
 * @param {string} s3Key - S3 object key (unique identifier).
 * @param {number} sizeBytes - Size of the file.
 * @param {object} vectorData - The SBERT vector data.
 * @returns {object} The ID of the newly created file record.
 */
export async function createNewFileRecord(
  userId,
  fileName,
  s3Key,
  sizeBytes,
  vectorData
) {
  // --- STEP 1: Insert the main file metadata ---
  const [newFile] = await db
    .insert(files)
    .values({
      userId,
      fileName,
      s3Key,
      sizeBytes,
      storageTier: 'Hot', // Default tier upon initial upload
      isEncrypted: true,
      // updatedAt: new Date(), // Drizzle handles defaultNow() but explicit update is good practice
    })
    .returning({ id: files.id });

  if (newFile) {
    // --- STEP 2: Insert the file's vector embedding for AI search ---
    await db.insert(fileEmbeddings).values({
      fileId: newFile.id,
      vectorData: JSON.stringify(vectorData), // Store the SBERT vector
    });
  }

  return newFile; // Returns the ID of the created file
}

/**
 * Drizzle Logic: Permanent Deletion
 * Deletes the file metadata record based on the S3 key.
 * NOTE: The S3 object deletion MUST be handled by the calling Python Lambda/service.
 * @param {string} s3KeyToDelete - The S3 object key of the file to delete.
 * @returns {boolean} True if a record was deleted, false otherwise.
 */
export async function deleteFileAndMetadata(s3KeyToDelete) {
  // --- STEP 1: Delete the metadata record ---
  // The CASCADE DELETE rule defined in the schema (onDelete: 'cascade')
  // automatically and permanently removes the associated row in fileEmbeddings.
  const result = await db
    .delete(files)
    .where(eq(files.s3Key, s3KeyToDelete))
    .returning({ deletedId: files.id });

  // Check if a record was actually deleted
  return result.length > 0;
}
