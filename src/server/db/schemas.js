import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  boolean,
  index,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Users Table
 * Must exist before files table because of FK reference
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),

  loginOtp: text('login_otp'),
  loginOtpExpires: timestamp('login_otp_expires'),

  fullName: text('full_name'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  reset_token: text('reset_token'),
  reset_token_expires: timestamp('reset_token_expires'),
});

/**
 * Folders Table
 */
export const folders = pgTable(
  'folders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id'),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIndex: index('folders_user_id_idx').on(table.userId),
    parentIndex: index('folders_parent_id_idx').on(table.parentId),
  }),
);

/**
 * Files Table
 */
export const files = pgTable(
  'files',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Owner of the file
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Folder Structure
    parentId: uuid('parent_id'),

    // File metadata
    fileName: text('file_name').notNull(),
    type: text('type').default('unknown'), // Extension/Mime
    s3Key: text('s3_key').notNull().unique(),
    sizeBytes: integer('size_bytes').notNull(),

    // Storage & security metadata
    storageTier: text('storage_tier').default('Hot').notNull(),
    isEncrypted: boolean('is_encrypted').default(true).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    // NORMAL index (not unique) → one user can have many files
    userIndex: index('files_user_id_idx').on(table.userId),
    parentIndex: index('files_parent_id_idx').on(table.parentId),
  }),
);

/**
 * File Embeddings Table
 */
export const fileEmbeddings = pgTable('file_embeddings', {
  fileId: uuid('file_id')
    .notNull()
    .references(() => files.id, { onDelete: 'cascade' })
    .unique(),

  vectorData: text('vector_data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Relations
 */
export const fileRelations = relations(files, ({ one }) => ({
  embedding: one(fileEmbeddings, {
    fields: [files.id],
    references: [fileEmbeddings.fileId],
  }),
}));

/**
 * Shared Files Table
 */
export const sharedFiles = pgTable(
  'shared_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fileId: uuid('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    sharedByUserId: uuid('shared_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sharedWithUserId: uuid('shared_with_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    sharedWithIndex: index('shared_files_shared_with_idx').on(
      table.sharedWithUserId,
    ),
    fileIndex: index('shared_files_file_id_idx').on(table.fileId),
  }),
);
