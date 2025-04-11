import { mysqlTable, serial, text, timestamp, boolean, float, int } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const emergencyContacts = mysqlTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  phoneNumber: text("phone_number").notNull(),
  buttonColor: text("button_color").default("bg-blue-500"),
});

export const incidents = mysqlTable("incidents", {
  id: serial("id").primaryKey(),
  incidentId: text("incident_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").notNull(), // Calculated severity
  source: text("source").notNull(),
  location: text("location").notNull(),
  coordinates: text("coordinates").notNull(),
  estimatedTime: text("estimated_time"),
  nearestHospital: text("nearest_hospital"),
  optimizedRoute: text("optimized_route"),
  status: text("status").default("active").notNull(),
  hasSnapshot: boolean("has_snapshot").default(false),
  snapshotUrl: text("snapshot_url"),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  probability: float('probability'), // Use MySQL float for probability
});

export const systemStatus = mysqlTable("system_status", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  status: text("status").notNull(),
  value: int("value"),
  percentage: int("percentage"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).pick({
  name: true,
  department: true,
  phoneNumber: true,
  buttonColor: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
});

export const insertSystemStatusSchema = createInsertSchema(systemStatus).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type SystemStatus = typeof systemStatus.$inferSelect;
export type InsertSystemStatus = z.infer<typeof insertSystemStatusSchema>;

// Enums
export const SeverityType = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export const IncidentStatusType = {
  ACTIVE: "active",
  DISPATCHED: "dispatched",
  RESOLVED: "resolved",
  CANCELED: "canceled",
} as const;
