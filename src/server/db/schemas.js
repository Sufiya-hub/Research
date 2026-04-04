import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  boolean,
  index,
  uuid,
  jsonb,
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
  friends: jsonb('friends').default([]),
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
    lastAccessedAt: timestamp('last_accessed_at').defaultNow().notNull(),
    isFavorite: boolean('is_favorite').default(false).notNull(),
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

/**
 * Organizations
 */
export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    orgKey: text('org_key').notNull().unique(),
    isPublic: boolean('is_public').default(true).notNull(),
    createdByUserId: uuid('created_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orgKeyIndex: index('organizations_org_key_idx').on(table.orgKey),
    creatorIndex: index('organizations_created_by_idx').on(
      table.createdByUserId,
    ),
  }),
);

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'), // 'admin' | 'member'
    accessLevel: text('access_level').notNull().default('view_only'), // 'view_only' | 'share_only'
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orgUserIndex: index('organization_members_org_user_idx').on(
      table.organizationId,
      table.userId,
    ),
  }),
);

export const organizationFiles = pgTable(
  'organization_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    fileId: uuid('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    addedByUserId: uuid('added_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIndex: index('organization_files_org_idx').on(table.organizationId),
    fileIndex: index('organization_files_file_idx').on(table.fileId),
  }),
);

export const organizationInvites = pgTable(
  'organization_invites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    invitedByUserId: uuid('invited_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessLevel: text('access_level').notNull().default('view_only'),
    status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'rejected' | 'expired'
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orgEmailIndex: index('organization_invites_org_email_idx').on(
      table.organizationId,
      table.email,
    ),
  }),
);

export const organizationJoinRequests = pgTable(
  'organization_join_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orgUserIdx: index('organization_join_requests_org_user_idx').on(
      table.organizationId,
      table.userId,
    ),
  }),
);

/**
 * Summarization History Table
 */
export const summarizationHistory = pgTable(
  'summarization_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    query: text('query').notNull(),
    response: text('response').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIndex: index('summarization_history_user_idx').on(table.userId),
    createdAtIndex: index('summarization_history_created_at_idx').on(
      table.createdAt,
    ),
  }),
);
