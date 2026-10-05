import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("items").withIndex("by_name").take(200);
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const unit = args.unit.trim() || "unit";

    if (!name) throw new Error("Item name is required");
    if (!Number.isFinite(args.quantity) || args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const existing = await ctx.db
      .query("items")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (existing) {
      await ctx.db.patch("items", existing._id, {
        quantity: existing.quantity + args.quantity,
        unit,
      });
      return existing._id;
    }

    return await ctx.db.insert("items", { name, quantity: args.quantity, unit });
  },
});

export const adjust = mutation({
  args: {
    id: v.id("items"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get("items", args.id);
    if (!item) throw new Error("Item not found");
    if (!Number.isFinite(args.amount) || args.amount === 0) {
      throw new Error("Amount must be a non-zero number");
    }

    const quantity = item.quantity + args.amount;
    if (quantity < 0) throw new Error("Quantity cannot go below 0");

    await ctx.db.patch("items", args.id, { quantity });
  },
});

export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    await ctx.db.delete("items", args.id);
  },
});
