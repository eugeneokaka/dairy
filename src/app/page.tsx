"use client";

import {
  useConvexConnectionState,
  useMutation,
  useQuery,
} from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

const UNITS = ["kg", "litres", "pieces"] as const;

export default function InventoryPage() {
  const items = useQuery(api.items.list);
  const addItem = useMutation(api.items.add);
  const adjust = useMutation(api.items.adjust);
  const remove = useMutation(api.items.remove);
  const connection = useConvexConnectionState();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<string>("kg");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const qty = Number(quantity);
    if (!name.trim()) return setError("Enter an item name.");
    if (!Number.isFinite(qty) || qty <= 0) return setError("Enter a valid quantity.");

    setBusy(true);
    try {
      await addItem({ name, quantity: qty, unit });
      setName("");
      setQuantity("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add stock here. Adding an existing item name increases its quantity.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">Item</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Beef"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </label>
          <label className="flex w-28 flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">Quantity</span>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </label>
          <label className="flex w-28 flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">Unit</span>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {busy ? "Adding..." : "Add"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      <section>
        {items === undefined ? (
          <p className="text-sm text-zinc-500">
            {connection.isWebSocketConnected
              ? "Loading inventory..."
              : "Connecting to server..."}
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-500">No items yet. Add your first item above.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {items.map((item) => (
              <li
                key={item._id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                    {item.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() =>
                      adjust({ id: item._id, amount: -1 }).catch((err) =>
                        setError(err instanceof Error ? err.message : "Failed."),
                      )
                    }
                    className="h-8 w-8 rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    aria-label="Decrease by 1"
                  >
                    −
                  </button>
                  <button
                    onClick={() =>
                      adjust({ id: item._id, amount: 1 }).catch((err) =>
                        setError(err instanceof Error ? err.message : "Failed."),
                      )
                    }
                    className="h-8 w-8 rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    aria-label="Increase by 1"
                  >
                    +
                  </button>
                  <button
                    onClick={() => remove({ id: item._id })}
                    className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
