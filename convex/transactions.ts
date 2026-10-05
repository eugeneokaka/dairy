import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("transactions").order("desc").take(100);
  },
});

export const record = mutation({
  args: {
    itemId: v.id("items"),
    quantity: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!Number.isFinite(args.quantity) || args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const item = await ctx.db.get("items", args.itemId);
    if (!item) throw new Error("Item not found");

    if (item.quantity < args.quantity) {
      throw new Error(
        `Not enough ${item.name}. Only ${item.quantity} ${item.unit} left`,
      );
    }

    await ctx.db.patch("items", args.itemId, {
      quantity: item.quantity - args.quantity,
    });

    await ctx.db.insert("transactions", {
      itemId: args.itemId,
      itemName: item.name,
      quantity: args.quantity,
      unit: item.unit,
      note: args.note?.trim() || undefined,
    });
  },
});
