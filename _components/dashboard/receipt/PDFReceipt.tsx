"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  pdf,
} from "@react-pdf/renderer";
import {
  FileDown,
  Share2,
  MessageCircle,
  Send,
  Twitter,
  Copy,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface ReceiptData {
  orderId: string;
  reference: string;
  amount: string;
  token: string;
  network: string;
  status: string;
  receiveAddress: string;
  completionTime?: string;
  date: string;
  // Recipient bank details
  recipientAccount?: string;
  recipientName?: string;
  bankName?: string;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function fmtNetwork(n: string) {
  return n.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function buildShareText(data: ReceiptData): string {
  return [
    `✅ GidSwap Transaction Receipt`,
    ``,
    `💰 Amount:  ${data.amount} ${data.token}`,
    `🌐 Network: ${fmtNetwork(data.network)}`,
    `📅 Date:    ${data.date}`,
    ...(data.completionTime ? [`⚡ Done in: ${data.completionTime}`] : []),
    ``,
    `🔖 Ref: ${data.reference}`,
    ``,
    `Powered by GidSwap — Your Trusted Crypto Paddy 🚀`,
    `gidswap.com`,
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────
// Compact PDF Styles  (A4, single page)
// ─────────────────────────────────────────────────────────────
const C = {
  brand: "#4f8ef7",
  bg: "#0d0f14",
  surf: "#13161e",
  surf2: "#1a1d27",
  border: "#252836",
  white: "#ffffff",
  muted: "#8892a4",
  success: "#22c55e",
  gold: "#f59e0b",
};

const S = StyleSheet.create({
  page:       { backgroundColor: C.bg, fontFamily: "Helvetica", paddingHorizontal: 0, paddingBottom: 0 },
  topBar:     { height: 4, backgroundColor: C.brand },
  /* header */
  header:     { backgroundColor: C.surf, paddingHorizontal: 36, paddingVertical: 22, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  brandName:  { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.brand, letterSpacing: 3 },
  tagline:    { fontSize: 8, color: C.muted, marginTop: 2 },
  badge:      { backgroundColor: C.success, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTxt:   { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white, letterSpacing: 0.8 },
  receiptLbl: { fontSize: 7, color: C.muted, marginTop: 4, textAlign: "right", letterSpacing: 0.8 },
  /* body */
  body:       { paddingHorizontal: 36, paddingTop: 22, paddingBottom: 0 },
  /* amount hero */
  hero:       { backgroundColor: C.surf2, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingVertical: 22, paddingHorizontal: 24, alignItems: "center", marginBottom: 18 },
  heroLbl:    { fontSize: 8, color: C.muted, letterSpacing: 1.2, marginBottom: 6 },
  heroRow:    { flexDirection: "row", alignItems: "flex-end" },
  heroAmt:    { fontSize: 34, fontFamily: "Helvetica-Bold", color: C.white },
  heroToken:  { fontSize: 15, fontFamily: "Helvetica-Bold", color: C.brand, marginLeft: 5 },
  pill:       { marginTop: 8, backgroundColor: C.surf, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: C.border },
  pillTxt:    { fontSize: 8, color: C.muted },
  /* detail card */
  secLbl:     { fontSize: 7, color: C.muted, letterSpacing: 1.2, marginBottom: 7 },
  card:       { backgroundColor: C.surf2, borderRadius: 9, borderWidth: 1, borderColor: C.border, marginBottom: 14, overflow: "hidden" },
  row:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.border },
  rowLast:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15, paddingVertical: 9 },
  rKey:       { fontSize: 9, color: C.muted },
  rVal:       { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.white, maxWidth: 230, textAlign: "right" },
  rValGreen:  { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.success },
  rValGold:   { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.gold },
  rValBrand:  { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.brand },
  rValMono:   { fontSize: 7, color: C.white, maxWidth: 260, textAlign: "right" },
  /* address */
  addrCard:   { backgroundColor: C.surf2, borderRadius: 9, borderWidth: 1, borderColor: C.border, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 14 },
  addrLbl:    { fontSize: 7, color: C.muted, letterSpacing: 1.2, marginBottom: 5 },
  addrVal:    { fontSize: 7, color: C.brand, lineHeight: 1.5 },
  /* thank you */
  thanks:     { backgroundColor: C.surf2, borderRadius: 10, borderWidth: 1, borderColor: C.brand, paddingVertical: 14, paddingHorizontal: 18, alignItems: "center", marginBottom: 18 },
  thanksH:    { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.brand, marginBottom: 3 },
  thanksSub:  { fontSize: 8, color: C.muted, textAlign: "center", lineHeight: 1.5 },
  /* footer */
  footer:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.surf, paddingHorizontal: 36, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.border },
  ftBrand:    { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.brand, letterSpacing: 2 },
  ftUrl:      { fontSize: 7, color: C.muted },
  ftDate:     { fontSize: 7, color: C.muted },
  botBar:     { height: 3, backgroundColor: C.brand, opacity: 0.4 },
});

// ─────────────────────────────────────────────────────────────
// PDF Document  (compact single-page)
// ─────────────────────────────────────────────────────────────
function ReceiptDocument({ data }: { data: ReceiptData }) {
  const txRows = [
    { k: "Status",        v: data.status.toUpperCase(),  s: "green" },
    { k: "Network",       v: fmtNetwork(data.network),   s: "normal" },
    { k: "Date",          v: data.date,                  s: "normal" },
    ...(data.completionTime ? [{ k: "Completed In", v: `⚡ ${data.completionTime}`, s: "gold" }] : []),
    ...(data.bankName        ? [{ k: "Bank",         v: data.bankName,             s: "normal" }] : []),
    ...(data.recipientName   ? [{ k: "Account Name", v: data.recipientName,        s: "normal" }] : []),
    ...(data.recipientAccount? [{ k: "Account No.",  v: data.recipientAccount,     s: "brand" }] : []),
  ];

  const idRows = [
    { k: "Order ID",  v: data.orderId,   mono: true },
    { k: "Reference", v: data.reference, mono: true },
  ];

  return (
    <Document title={`GidSwap · ${data.reference}`} author="GidSwap">
      <Page size="A4" style={S.page}>
        <View style={S.topBar} />

        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.brandName}>GIDSWAP</Text>
            <Text style={S.tagline}>Your Trusted Crypto Paddy · gidswap.com</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={S.badge}><Text style={S.badgeTxt}>✓  Payment Successful</Text></View>
            <Text style={S.receiptLbl}>Official Receipt</Text>
          </View>
        </View>

        {/* Body */}
        <View style={S.body}>

          {/* Amount hero */}
          <View style={S.hero}>
            <Text style={S.heroLbl}>AMOUNT SENT</Text>
            <View style={S.heroRow}>
              <Text style={S.heroAmt}>{data.amount}</Text>
              <Text style={S.heroToken}>{data.token}</Text>
            </View>
            <View style={S.pill}><Text style={S.pillTxt}>{fmtNetwork(data.network)}</Text></View>
          </View>

          {/* Transaction details */}
          <Text style={S.secLbl}>TRANSACTION DETAILS</Text>
          <View style={S.card}>
            {txRows.map((r, i) => (
              <View key={r.k} style={i === txRows.length - 1 ? S.rowLast : S.row}>
                <Text style={S.rKey}>{r.k}</Text>
                <Text style={
                  r.s === "green" ? S.rValGreen
                  : r.s === "gold"  ? S.rValGold
                  : r.s === "brand" ? S.rValBrand
                  : S.rVal
                }>
                  {r.v}
                </Text>
              </View>
            ))}
          </View>

          {/* IDs */}
          <Text style={S.secLbl}>IDENTIFIERS</Text>
          <View style={S.card}>
            {idRows.map((r, i) => (
              <View key={r.k} style={i === idRows.length - 1 ? S.rowLast : S.row}>
                <Text style={S.rKey}>{r.k}</Text>
                <Text style={S.rValMono}>{r.v}</Text>
              </View>
            ))}
          </View>

          {/* Deposit Address */}
          <View style={S.addrCard}>
            <Text style={S.addrLbl}>DEPOSIT ADDRESS</Text>
            <Text style={S.addrVal}>{data.receiveAddress}</Text>
          </View>

          {/* Thank you */}
          <View style={S.thanks}>
            <Text style={S.thanksH}>Thank You for Using GidSwap 🎉</Text>
            <Text style={S.thanksSub}>
              Your Trusted Crypto Paddy — every swap, we've got you.{"\n"}
              Share your experience and grow with the community.
            </Text>
          </View>

        </View>

        {/* Footer */}
        <View style={S.footer}>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Text style={S.ftBrand}>GIDSWAP</Text>
            <Text style={S.ftUrl}>· gidswap.com</Text>
          </View>
          <Text style={S.ftDate}>
            {new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
          </Text>
        </View>
        <View style={S.botBar} />
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers — generate & optionally download the PDF blob
// ─────────────────────────────────────────────────────────────
async function generatePDFBlob(data: ReceiptData): Promise<File> {
  const instance = pdf(<ReceiptDocument data={data} />);
  const blob = await instance.toBlob();
  return new File(
    [blob],
    `gidswap-receipt-${data.reference || data.orderId}.pdf`,
    { type: "application/pdf" }
  );
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────
// Share Panel Component
// ─────────────────────────────────────────────────────────────
interface SharePanelProps {
  data: ReceiptData;
  onClose: () => void;
}

function SharePanel({ data, onClose }: SharePanelProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);

  // Generates the PDF and shares it via Web Share API (file) on mobile.
  // On desktop: auto-downloads the PDF then opens the web app.
  const sharePDF = async (appId: "whatsapp" | "telegram" | "more") => {
    setLoadingId(appId);
    try {
      const file = await generatePDFBlob(data);
      const canShareFile =
        typeof navigator !== "undefined" &&
        navigator.share != null &&
        navigator.canShare?.({ files: [file] });

      if (canShareFile) {
        // ✅ Mobile — OS share sheet, user picks WhatsApp / Telegram etc.
        await navigator.share({
          files: [file],
          title: "GidSwap Receipt",
          text: `My GidSwap receipt — ${data.amount} ${data.token}`,
        });
      } else {
        // 🖥️ Desktop — download PDF, then open web app
        downloadFile(file);
        const fallback: Record<string, string> = {
          whatsapp: "https://web.whatsapp.com/",
          telegram: "https://web.telegram.org/",
        };
        if (fallback[appId]) {
          setTimeout(
            () => window.open(fallback[appId], "_blank", "noopener,noreferrer"),
            700
          );
        }
      }
    } catch {
      // cancelled silently
    } finally {
      setLoadingId(null);
    }
  };

  const handleCopyAndDownload = async () => {
    setLoadingId("copy");
    try {
      const file = await generatePDFBlob(data);
      downloadFile(file);
      await navigator.clipboard.writeText(buildShareText(data));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } finally {
      setLoadingId(null);
    }
  };

  const apps = [
    { id: "whatsapp" as const, label: "WhatsApp", icon: <MessageCircle className="w-5 h-5" />, bg: "bg-[#25D366] hover:bg-[#20bd5a]" },
    { id: "telegram" as const, label: "Telegram",  icon: <Send className="w-5 h-5" />,           bg: "bg-[#229ED9] hover:bg-[#1a87bb]" },
    { id: "more"     as const, label: "More Apps", icon: <Share2 className="w-5 h-5" />,          bg: "bg-gray-700 hover:bg-gray-600" },
  ];

  const busy = loadingId !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-x-0 bottom-0 bg-[#1a1b24] border border-gray-700 rounded-2xl p-4 shadow-2xl z-10 mx-1 mb-1"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-white">Share PDF Receipt</p>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-4">Shares the actual PDF file — not just text.</p>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {apps.map((app) => {
          const isLoading = loadingId === app.id;
          return (
            <button
              key={app.id}
              onClick={() => sharePDF(app.id)}
              disabled={busy}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-white text-xs font-medium transition-all active:scale-95 disabled:opacity-60 ${app.bg}`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : app.icon}
              {isLoading ? "Preparing…" : app.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleCopyAndDownload}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm text-gray-200 font-medium transition-all active:scale-95 disabled:opacity-60"
      >
        {loadingId === "copy" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Downloading…</>
        ) : copied ? (
          <><Check className="w-4 h-4 text-green-400" /> Copied &amp; PDF saved!</>
        ) : (
          <><Copy className="w-4 h-4" /> Copy summary + download PDF</>
        )}
      </button>

      <p className="text-xs text-gray-600 text-center mt-3">
        Desktop: PDF saves automatically — then attach it in the app.
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Download Button
// ─────────────────────────────────────────────────────────────
interface PDFReceiptButtonProps {
  data: ReceiptData;
  className?: string;
}

export function PDFReceiptButton({ data, className }: PDFReceiptButtonProps) {
  const filename = `gidswap-receipt-${data.reference || data.orderId}.pdf`;
  return (
    <PDFDownloadLink document={<ReceiptDocument data={data} />} fileName={filename}>
      {({ loading }) => (
        <Button
          className={className || "w-full bg-[#1a1d27] hover:bg-[#252836] text-white border border-[#252836] hover:border-[#4f8ef7]/40 font-semibold transition-all"}
          disabled={loading}
        >
          <FileDown className="w-4 h-4 mr-2 text-[#4f8ef7]" />
          {loading ? "Preparing…" : "Download Receipt PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}

// ─────────────────────────────────────────────────────────────
// Share Button (opens the share panel)
// ─────────────────────────────────────────────────────────────
interface ShareReceiptButtonProps {
  data: ReceiptData;
  className?: string;
}

export function ShareReceiptButton({ data, className }: ShareReceiptButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <AnimatePresence>
        {open && <SharePanel data={data} onClose={() => setOpen(false)} />}
      </AnimatePresence>

      <Button
        onClick={() => setOpen(!open)}
        className={className || "w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold transition-all"}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Receipt
      </Button>
    </div>
  );
}
