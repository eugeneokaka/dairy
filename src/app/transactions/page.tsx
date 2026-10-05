"use client";

import {
  useConvexConnectionState,
  useMutation,
  useQuery,
} from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export default function TransactionsPage() {
  const items = useQuery(api.items.list);
  const transactions = useQuery(api.transactions.list);
  const record = useMutation(api.transactions.record);
  const connection = useConvexConnectionState();

  const [itemId, setItemId] = useState<Id<"items"> | "">("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!itemId) return setError("Select an item.");
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return setError("Enter a valid quantity.");

    const item = items?.find((i) => i._id === itemId);
    setBusy(true);
    try {
      await record({ itemId, quantity: qty, note });
      setSuccess(`Recorded ${qty} ${item?.unit ?? ""} of ${item?.name ?? "item"}.`);
      setQuantity("");
      setNote("");
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
          Record Transaction
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Recording a transaction deducts the quantity from inventory.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <label className="flex min-w-40 flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">Item</span>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value as Id<"items"> | "")}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="">Select an item</option>
              {items?.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} ({item.quantity} {item.unit})
                </option>
              ))}
            </select>
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
          <label className="flex min-w-40 flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">Note (optional)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Customer name"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !items || items.length === 0}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {busy ? "Recording..." : "Record"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Recent transactions
        </h2>
        {transactions === undefined ? (
          <p className="text-sm text-zinc-500">
            {connection.isWebSocketConnected
              ? "Loading transactions..."
              : "Connecting to server..."}
          </p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-zinc-500">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {transactions.map((t) => (
              <li
                key={t._id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                    {t.itemName}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {new Date(t._creationTime).toLocaleString()}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium text-red-600">
                  −{t.quantity} {t.unit}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
