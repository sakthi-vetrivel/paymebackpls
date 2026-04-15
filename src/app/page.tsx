"use client";

import { useState, useRef, useEffect } from "react";
import { Receipt, ReceiptItem, formatCurrency } from "@/lib/receipt";

type Step = "upload" | "review" | "share";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [payerName, setPayerName] = useState("");
  const [payerVenmo, setPayerVenmo] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [printReveal, setPrintReveal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileDataRef = useRef<File | null>(null);

  // Clear printer reveal after animation finishes
  useEffect(() => {
    if (printReveal && items.length > 0) {
      const timeout = setTimeout(() => setPrintReveal(false), items.length * 120 + 800);
      return () => clearTimeout(timeout);
    }
  }, [printReveal, items.length]);

  const itemsSum = items.reduce((s, i) => s + i.price, 0);
  const reconciliationDiff = Math.abs(itemsSum - subtotal);
  const showReconciliationWarning = reconciliationDiff > 0.5 && subtotal > 0;

  async function handleScan() {
    if (!payerName.trim() || !fileDataRef.current) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", fileDataRef.current);
    formData.append("payerName", payerName.trim());
    formData.append("payerVenmo", payerVenmo.trim());

    try {
      const res = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");

      const r = data.receipt as Receipt;
      setReceipt(r);
      setItems(r.items);
      setTax(r.tax);
      setTip(r.tip);
      setSubtotal(r.subtotal);
      setPrintReveal(true);
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    fileDataRef.current = file;
    setPreview(URL.createObjectURL(file));
  }

  function updateItem(id: number, field: "name" | "price", value: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "price" ? Math.max(0, parseFloat(value) || 0) : value,
            }
          : item
      )
    );
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function addItem() {
    const maxId = items.length > 0 ? Math.max(...items.map((i) => i.id)) : -1;
    setItems((prev) => [
      ...prev,
      { id: maxId + 1, name: "", price: 0, claims: [] },
    ]);
  }

  async function handleGenerateLink() {
    if (items.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/receipt/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerName: payerName.trim(),
          payerVenmo: payerVenmo.trim(),
          items: items.map((item, idx) => ({
            id: idx,
            name: item.name,
            price: item.price,
            claims: [],
          })),
          tax,
          tip,
          subtotal: items.reduce((s, i) => s + i.price, 0),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create link");

      const url = `${window.location.origin}/s/${data.receipt.id}`;
      setShareUrl(url);
      setStep("share");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setStep("upload");
    setReceipt(null);
    setItems([]);
    setTax(0);
    setTip(0);
    setSubtotal(0);
    setError("");
    setShareUrl("");
    setPreview(null);
    fileDataRef.current = null;
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-instrument-serif)] text-[22px] font-normal text-[var(--text)]">
            pay<span className="font-bold underline">{payerName || "me"}</span>backpls
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
            Split the bill, keep the friendship.
          </p>
        </div>

        {error && (
          <div className="text-[var(--danger)] text-[13px] py-3 px-4 mb-4 border border-[var(--danger)]/20 rounded bg-red-50/50">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-2">
                Your name
              </label>
              <input
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="Alex"
                className="w-full py-3.5 border-b border-[var(--border)] bg-transparent text-[16px] focus:outline-none focus:border-[var(--text)] transition-colors placeholder:text-[var(--text-tertiary)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-2">
                Venmo
              </label>
              <input
                type="text"
                value={payerVenmo}
                onChange={(e) => setPayerVenmo(e.target.value)}
                placeholder="@alex-smith"
                className="w-full py-3.5 border-b border-[var(--border)] bg-transparent text-[16px] focus:outline-none focus:border-[var(--text)] transition-colors placeholder:text-[var(--text-tertiary)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-2">
                Receipt
              </label>
              {!preview ? (
                <label className="block border border-[var(--border)] rounded-lg p-8 text-center cursor-pointer bg-white hover:border-[var(--text)] transition-colors">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="text-[var(--text-secondary)] text-[14px]">
                    Upload or take a photo
                  </div>
                  <div className="text-[var(--text-tertiary)] text-[12px] mt-1">
                    JPEG, PNG, or WebP up to 10MB
                  </div>
                </label>
              ) : (
                <div className="relative inline-flex w-full justify-center">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="rounded-lg max-h-40 object-contain"
                  />
                  {!loading && (
                    <button
                      onClick={() => {
                        setPreview(null);
                        fileDataRef.current = null;
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[var(--text)] text-white text-[14px] flex items-center justify-center hover:opacity-80 transition-opacity"
                      aria-label="Remove image"
                    >
                      &times;
                    </button>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <p className="text-[14px] text-[var(--text-secondary)] text-center py-4">Scanning receipt&hellip;</p>
            ) : (
              <button
                onClick={handleScan}
                disabled={!payerName.trim() || !fileDataRef.current}
                className="w-full py-4 rounded bg-[var(--text)] text-white font-medium text-[15px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.99]"
              >
                Scan Receipt
              </button>
            )}

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-[12px] text-[var(--text-tertiary)] uppercase tracking-[0.06em]">or</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            <button
              onClick={() => {
                if (!payerName.trim()) {
                  setError("Please enter your name first.");
                  return;
                }
                setError("");
                setItems([{ id: 0, name: "", price: 0, claims: [] }]);
                setTax(0);
                setTip(0);
                setSubtotal(0);
                setStep("review");
              }}
              className="w-full py-4 rounded border border-[var(--border)] text-[var(--text)] font-medium text-[15px] hover:border-[var(--text)] transition-colors active:scale-[0.99]"
            >
              Enter items manually
            </button>
          </div>
        )}

        {/* Step 2: Review & Edit */}
        {step === "review" && (
          <div className="space-y-5">
            <div className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.1em]">
              Items
            </div>

            {showReconciliationWarning && (
              <div className="text-[13px] text-[#92600A] py-3 px-4 border border-[#92600A]/20 rounded bg-amber-50/50">
                Items total ({formatCurrency(itemsSum)}) differs from receipt subtotal ({formatCurrency(subtotal)}) by {formatCurrency(reconciliationDiff)}.
              </div>
            )}

            <div>
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 py-3 border-b border-[var(--border-light)]${printReveal ? " print-item" : ""}`}
                  style={printReveal ? { animationDelay: `${idx * 120}ms` } : undefined}
                >
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, "name", e.target.value)}
                    placeholder="Item name"
                    className="flex-1 min-w-0 bg-transparent text-[15px] focus:outline-none placeholder:text-[var(--text-tertiary)]"
                  />
                  <div className="flex items-center flex-shrink-0">
                    <span className="text-[var(--text-tertiary)] text-[14px] mr-0.5">$</span>
                    <input
                      type="number"
                      value={item.price || ""}
                      onChange={(e) => updateItem(item.id, "price", e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-[70px] text-right bg-transparent text-[15px] font-medium tabular-nums focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[var(--text-tertiary)] hover:text-[var(--danger)] text-[18px] leading-none transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                onClick={addItem}
                className="w-full py-3 border-b border-dashed border-[var(--border)] text-left text-[13px] text-[var(--text-tertiary)] hover:text-[var(--text)] transition-colors"
              >
                + Add item
              </button>
            </div>

            <div
              className={`grid grid-cols-2 border-t border-[var(--border-light)]${printReveal ? " print-item" : ""}`}
              style={printReveal ? { animationDelay: `${items.length * 120 + 100}ms` } : undefined}
            >
              <div className="py-3 pr-4 border-r border-[var(--border-light)]">
                <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-1">Tax</label>
                <div className="flex items-center">
                  <span className="text-[var(--text-tertiary)] text-[14px] mr-0.5">$</span>
                  <input
                    type="number"
                    value={tax || ""}
                    onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))}
                    step="0.01"
                    min="0"
                    className="w-full bg-transparent text-[16px] font-medium tabular-nums focus:outline-none"
                  />
                </div>
              </div>
              <div className="py-3 pl-4">
                <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-1">Tip</label>
                <div className="flex items-center">
                  <span className="text-[var(--text-tertiary)] text-[14px] mr-0.5">$</span>
                  <input
                    type="number"
                    value={tip || ""}
                    onChange={(e) => setTip(Math.max(0, parseFloat(e.target.value) || 0))}
                    step="0.01"
                    min="0"
                    className="w-full bg-transparent text-[16px] font-medium tabular-nums focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[var(--border-light)]">
              <div
                className={`flex justify-between text-[14px] text-[var(--text-secondary)]${printReveal ? " print-item" : ""}`}
                style={printReveal ? { animationDelay: `${items.length * 120 + 220}ms` } : undefined}
              >
                <span>Subtotal</span>
                <span className="font-medium text-[var(--text)] tabular-nums">{formatCurrency(itemsSum)}</span>
              </div>
              <div
                className={`flex justify-between text-[14px] text-[var(--text-secondary)]${printReveal ? " print-item" : ""}`}
                style={printReveal ? { animationDelay: `${items.length * 120 + 340}ms` } : undefined}
              >
                <span>Tax</span>
                <span className="font-medium text-[var(--text)] tabular-nums">{formatCurrency(tax)}</span>
              </div>
              <div
                className={`flex justify-between text-[14px] text-[var(--text-secondary)]${printReveal ? " print-item" : ""}`}
                style={printReveal ? { animationDelay: `${items.length * 120 + 460}ms` } : undefined}
              >
                <span>Tip</span>
                <span className="font-medium text-[var(--text)] tabular-nums">{formatCurrency(tip)}</span>
              </div>
              <div
                className={`flex justify-between text-[16px] font-semibold pt-2.5 mt-2 border-t border-[var(--text)]${printReveal ? " print-item" : ""}`}
                style={printReveal ? { animationDelay: `${items.length * 120 + 580}ms` } : undefined}
              >
                <span>Total</span>
                <span className="text-[18px] tabular-nums">{formatCurrency(itemsSum + tax + tip)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("upload")}
                className="flex-1 py-4 rounded border border-[var(--border)] text-[var(--text)] font-medium text-[14px] hover:border-[var(--text)] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleGenerateLink}
                disabled={loading || items.length === 0 || items.some((i) => !i.name.trim())}
                className="flex-[2] py-4 rounded bg-[var(--text)] text-white font-medium text-[15px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.99]"
              >
                {loading ? "Creating link..." : "Generate Link"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Share */}
        {step === "share" && (
          <div className="text-center pt-12 space-y-5">
            <div className="w-12 h-12 rounded-full bg-[var(--text)] text-white flex items-center justify-center mx-auto text-[24px]">
              &#10003;
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-instrument-serif)] text-[24px] font-normal">
                Share with your friends
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                They&apos;ll select their items and pay you directly.
              </p>
            </div>

            <div className="flex items-center border border-[var(--border)] rounded bg-white p-1 pl-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 min-w-0 text-[14px] bg-transparent outline-none truncate"
              />
              <button
                onClick={copyLink}
                className="shrink-0 px-5 py-2.5 bg-[var(--text)] text-white text-[13px] font-medium rounded transition-opacity hover:opacity-90"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {typeof navigator !== "undefined" && navigator.share && (
              <button
                onClick={() => navigator.share({ title: "paymebackpls", url: shareUrl })}
                className="w-full py-4 rounded bg-[var(--text)] text-white font-medium text-[15px] hover:opacity-90 transition-opacity"
              >
                Share Link
              </button>
            )}

            <button
              onClick={reset}
              className="w-full py-3 text-[var(--text-secondary)] font-medium text-[13px] hover:text-[var(--text)] transition-colors"
            >
              Split another bill
            </button>
          </div>
        )}
      </div>

      {/* Full-page copier scan overlay */}
      {loading && step === "upload" && (
        <div className="copier-overlay-fullpage">
          <div className="copier-bar" />
        </div>
      )}
    </div>
  );
}
