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
  role: text("role", { enum: ["user", "superAdmin"] })
    .notNull()
    .default("user"),
  emailVerified: integer("email_verified").notNull().default(0),
  verificationToken: text("verification_token"),
  verificationTokenExpiresAt: integer("verification_token_expires_at", {
    mode: "timestamp",
  }),
  resetToken: text("reset_token"),
  resetTokenExpiresAt: integer("reset_token_expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
