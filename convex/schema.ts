import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  items: defineTable({
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
  }).index("by_name", ["name"]),

  transactions: defineTable({
    itemId: v.optional(v.id("items")),
    itemName: v.string(),
    quantity: v.number(),
    unit: v.string(),
    note: v.optional(v.string()),
  }),
});
