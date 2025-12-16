import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Users Table
 * Must exist before files table because of FK reference
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),

  loginOtp: text('login_otp'),
  loginOtpExpires: timestamp('login_otp_expires'),

  fullName: text('full_name'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Files Table
 */
export const files = pgTable(
  'files',
  {
    id: serial('id').primaryKey(),

    // Owner of the file
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // File metadata
    fileName: text('file_name').notNull(),
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
  })
);

/**
 * File Embeddings Table
 */
export const fileEmbeddings = pgTable('file_embeddings', {
  fileId: integer('file_id')
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
