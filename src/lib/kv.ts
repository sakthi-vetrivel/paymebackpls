import { Receipt } from "./receipt";

// In-memory store for development (replace with Vercel KV in production)
const store = new Map<string, { data: Receipt; expiresAt: number }>();
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function getReceipt(id: string): Promise<Receipt | null> {
  const key = `receipt:${id}`;

  // Check in-memory store
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export async function setReceipt(receipt: Receipt): Promise<void> {
  const key = `receipt:${receipt.id}`;
  store.set(key, {
    data: receipt,
    expiresAt: Date.now() + SEVEN_DAYS_MS,
  });
}

export async function updateReceipt(
  id: string,
  updater: (receipt: Receipt) => Receipt
): Promise<Receipt | null> {
  const receipt = await getReceipt(id);
  if (!receipt) return null;
  const updated = updater(receipt);
  await setReceipt(updated);
  return updated;
}
