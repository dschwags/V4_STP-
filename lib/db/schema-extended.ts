/**
 * Extended Database Schema for Scholarship Tracker Pro
 * Supports comprehensive scholarship and user relationship tracking
 */

import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  date,
  json,
  unique
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ===================================================================
// CORE USER TABLES
// ===================================================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('student'), // student, parent, counselor, admin
  
  // Profile Information
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: date('date_of_birth'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 10 }),
  
  // Educational Context
  educationLevel: varchar('education_level', { length: 50 }),
  school: varchar('school', { length: 200 }),
  gpa: decimal('gpa', { precision: 3, scale: 2 }),
  graduationYear: integer('graduation_year'),
  major: varchar('major', { length: 200 }),
  
  // System Fields
  isActive: boolean('is_active').notNull().default(true),
  emailVerified: boolean('email_verified').notNull().default(true),
  preferences: json('preferences').$type<{
    theme: 'light' | 'dark' | 'system';
    notifications: {
      deadlineReminders: boolean;
      statusUpdates: boolean;
      newScholarships: boolean;
    };
    dashboard: {
      defaultView: 'overview' | 'scholarships' | 'financial';
      compactMode: boolean;
    };
  }>(),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ===================================================================
// USER RELATIONSHIPS
// ===================================================================

export const userConnections = pgTable('user_connections', {
  id: serial('id').primaryKey(),
  parentUserId: integer('parent_user_id').notNull().references(() => users.id),
  childUserId: integer('child_user_id').notNull().references(() => users.id),
  connectionType: varchar('connection_type', { length: 20 }).notNull(), // parent, counselor
  isActive: boolean('is_active').notNull().default(true),
  permissions: json('permissions').$type<{
    canViewApplications: boolean;
    canViewFinancialGoals: boolean;
    canViewProgress: boolean;
    canCreateScholarships: boolean;
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueConnection: unique().on(table.parentUserId, table.childUserId, table.connectionType),
}));

// ===================================================================
// SCHOLARSHIP TABLES
// ===================================================================

export const scholarships = pgTable('scholarships', {
  id: serial('id').primaryKey(),
  externalId: varchar('external_id', { length: 50 }).unique(), // For import compatibility
  userId: integer('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 300 }).notNull(),
  provider: varchar('provider', { length: 200 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  deadline: date('deadline').notNull(),
  status: varchar('status', { length: 30 }).notNull(), // not_started, draft, in_progress, etc.
  category: varchar('category', { length: 50 }).notNull(),
  
  // Optional Details
  applicationUrl: text('application_url'),
  description: text('description'),
  notes: text('notes'),
  tags: json('tags').$type<string[]>(),
  
  // Progress Tracking
  completion: integer('completion').notNull().default(0), // 0-100
  completionText: varchar('completion_text', { length: 100 }),
  
  // BugX Integration
  bugxValidated: boolean('bugx_validated').notNull().default(false),
  lastValidation: timestamp('last_validation'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ===================================================================
// REQUIREMENT TRACKING
// ===================================================================

export const scholarshipRequirements = pgTable('scholarship_requirements', {
  id: serial('id').primaryKey(),
  scholarshipId: integer('scholarship_id').notNull().references(() => scholarships.id, { onDelete: 'cascade' }),
  externalId: varchar('external_id', { length: 50 }), // For import compatibility
  label: varchar('label', { length: 300 }).notNull(),
  type: varchar('type', { length: 30 }).notNull(), // document, academic, activity, financial, process
  isRequired: boolean('is_required').notNull().default(true),
  isCompleted: boolean('is_completed').notNull().default(false),
  completedDate: timestamp('completed_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ===================================================================
// FINANCIAL TRACKING
// ===================================================================

export const financialGoals = pgTable('financial_goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  academicYear: integer('academic_year').notNull(),
  
  // Cost Planning
  totalEducationCost: decimal('total_education_cost', { precision: 10, scale: 2 }).notNull().default('0'),
  currentSavings: decimal('current_savings', { precision: 10, scale: 2 }).notNull().default('0'),
  expectedFamilyContribution: decimal('expected_family_contribution', { precision: 10, scale: 2 }).notNull().default('0'),
  scholarshipsAwarded: decimal('scholarships_awarded', { precision: 10, scale: 2 }).notNull().default('0'),
  scholarshipsPending: decimal('scholarships_pending', { precision: 10, scale: 2 }).notNull().default('0'),
  
  // Detailed Expenses
  expenses: json('expenses').$type<{
    tuition: number;
    housing: number;
    meals: number;
    books: number;
    transportation: number;
    personal: number;
    other?: number;
  }>(),
  
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ===================================================================
// ACTIVITY LOGS
// ===================================================================

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  metadata: json('metadata'), // Additional context data
});

// ===================================================================
// RELATIONS
// ===================================================================

export const usersRelations = relations(users, ({ many }) => ({
  scholarships: many(scholarships),
  requirements: many(scholarshipRequirements),
  financialGoals: many(financialGoals),
  activityLogs: many(activityLogs),
  parentConnections: many(userConnections, { relationName: "parent" }),
  childConnections: many(userConnections, { relationName: "child" }),
}));

export const scholarshipsRelations = relations(scholarships, ({ one, many }) => ({
  user: one(users, {
    fields: [scholarships.userId],
    references: [users.id],
  }),
  requirements: many(scholarshipRequirements),
}));

export const requirementsRelations = relations(scholarshipRequirements, ({ one }) => ({
  scholarship: one(scholarships, {
    fields: [scholarshipRequirements.scholarshipId],
    references: [scholarships.id],
  }),
}));

export const userConnectionsRelations = relations(userConnections, ({ one }) => ({
  parent: one(users, {
    fields: [userConnections.parentUserId],
    references: [users.id],
    relationName: "parent"
  }),
  child: one(users, {
    fields: [userConnections.childUserId],
    references: [users.id],
    relationName: "child"
  }),
}));

export const financialGoalsRelations = relations(financialGoals, ({ one }) => ({
  user: one(users, {
    fields: [financialGoals.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// ===================================================================
// TYPE EXPORTS
// ===================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Scholarship = typeof scholarships.$inferSelect;
export type NewScholarship = typeof scholarships.$inferInsert;
export type ScholarshipRequirement = typeof scholarshipRequirements.$inferSelect;
export type NewScholarshipRequirement = typeof scholarshipRequirements.$inferInsert;
export type UserConnection = typeof userConnections.$inferSelect;
export type NewUserConnection = typeof userConnections.$inferInsert;
export type FinancialGoal = typeof financialGoals.$inferSelect;
export type NewFinancialGoal = typeof financialGoals.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;