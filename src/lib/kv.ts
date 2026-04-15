import { Receipt } from "./receipt";
import { createServerClient } from "./supabase";

interface ReceiptRow {
  id: string;
  creator_id: string | null;
  payer_name: string;
  payer_venmo: string;
  items: Receipt["items"];
  tax: number;
  tip: number;
  subtotal: number;
  total: number;
  created_at: string;
  expires_at: string;
}

function rowToReceipt(row: ReceiptRow): Receipt {
  return {
    id: row.id,
    payerName: row.payer_name,
    payerVenmo: row.payer_venmo,
    items: row.items,
    tax: Number(row.tax),
    tip: Number(row.tip),
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    createdAt: row.created_at,
  };
}

export async function getReceipt(id: string): Promise<Receipt | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("id", id)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) return null;
  return rowToReceipt(data as ReceiptRow);
}

export async function setReceipt(receipt: Receipt): Promise<void> {
  const supabase = createServerClient();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("receipts").upsert({
    id: receipt.id,
    payer_name: receipt.payerName,
    payer_venmo: receipt.payerVenmo,
    items: receipt.items,
    tax: receipt.tax,
    tip: receipt.tip,
    subtotal: receipt.subtotal,
    total: receipt.total,
    created_at: receipt.createdAt,
    expires_at: expiresAt,
  });

  if (error) throw new Error(`Failed to save receipt: ${error.message}`);
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

export async function linkReceiptToUser(
  receiptId: string,
  userId: string
): Promise<boolean> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("receipts")
    .update({ creator_id: userId })
    .eq("id", receiptId)
    .is("creator_id", null);

  return !error;
}

export async function getReceiptsByUser(userId: string): Promise<Receipt[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("creator_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as ReceiptRow[]).map(rowToReceipt);
}
