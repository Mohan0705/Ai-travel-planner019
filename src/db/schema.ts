import { pgTable, serial, text, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull(),
  username: text("username"),
  bio: text("bio"),
  role: text("role").default("user").notNull(), // 'user' or 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for Users
export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
  notifications: many(notifications),
}));

// 2. Trips Table
export const trips = pgTable("trips", {
  id: text("id").primaryKey(), // Using string ID to match frontend's existing IDs
  userId: text("user_id").references(() => users.uid, { onDelete: "cascade" }), // Can be null for shared/guest presets
  destination: text("destination").notNull(),
  country: text("country"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  travelers: integer("travelers").default(1).notNull(),
  children: integer("children").default(0).notNull(),
  budget: integer("budget").notNull(),
  currency: text("currency").default("USD").notNull(),
  travelStyle: text("travel_style"),
  foodPreference: text("food_preference"),
  hotelPreference: text("hotel_preference"),
  transport: text("transport"),
  interests: jsonb("interests").$type<string[]>(), // Array of interests e.g. ["Temples", "Gardens"]
  isSaved: boolean("is_saved").default(true).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // High-fidelity generated details stored as JSONB
  hotels: jsonb("hotels"),
  restaurants: jsonb("restaurants"),
  itinerary: jsonb("itinerary"),
});

// Relations for Trips
export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.uid],
  }),
  expenses: many(expenses),
}));

// 3. Expenses Table
export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .references(() => trips.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  amount: doublePrecision("amount").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(),
  description: text("description"),
});

// Relations for Expenses
export const expensesRelations = relations(expenses, ({ one }) => ({
  trip: one(trips, {
    fields: [expenses.tripId],
    references: [trips.id],
  }),
}));

// 4. Notifications Table
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.uid, { onDelete: "cascade" }), // can be null for system-wide notices
  type: text("type").notNull(), // 'weather' | 'reminder' | 'flight'
  title: text("title").notNull(),
  message: text("message").notNull(),
  date: text("date").notNull(),
  read: boolean("read").default(false).notNull(),
});

// Relations for Notifications
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.uid],
  }),
}));
