import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  image: text("image"),
  password: text("password").notNull(), // Almacenaremos el hash de la contraseña
  status: text("status", { enum: ["active", "inactive", "banned", "deleted"] })
    .notNull()
    .default("active"),
  role: text("role", { enum: ["user", "moderator", "advisor", "admin", "superAdmin"] })
    .notNull()
    .default("user"),
  userType: text("user_type", {
    enum: ["citizen", "politician", "organization", "nonprofit", "student", "other"],
  }).default("citizen"),
  office: text("office"),
  // Bussiness/Organization field
  organization: text("organization"),
  // Nonprofit
  nonprofit: text("nonprofit"), // Nonprofit new field
  institution: text("institution"),
  otherRole: text("other_role"),
  emailVerified: integer("email_verified").notNull().default(0),
  verificationToken: text("verification_token"),
  verificationTokenExpiresAt: integer("verification_token_expires_at", {
    mode: "timestamp",
  }),
  resetToken: text("reset_token"),
  resetTokenExpiresAt: integer("reset_token_expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  // Optional badge helper for notifications
  lastSeenNotificationsAt: integer("last_seen_notifications_at", {
    mode: "timestamp",
  }),
  notifyInapp: integer("notify_inapp").notNull().default(1),
  notifyEmail: integer("notify_email").notNull().default(1),
});
