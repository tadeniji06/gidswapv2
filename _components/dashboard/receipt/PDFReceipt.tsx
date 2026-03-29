"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Line,
  Svg,
} from "@react-pdf/renderer";
import { FileDown } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import dynamic from "next/dynamic";

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
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function formatNetwork(network: string) {
  return network
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const c = {
  // Brand palette
  brand:      "#4f8ef7",
  brandLight: "#e8f0fd",
  bg:         "#0d0f14",
  surface:    "#13161e",
  surface2:   "#1a1d27",
  border:     "#252836",
  white:      "#ffffff",
  muted:      "#8892a4",
  success:    "#22c55e",
  successBg:  "#0d2818",
  gold:       "#f59e0b",
  danger:     "#ef4444",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: c.bg,
    color: c.white,
    fontFamily: "Helvetica",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  // ── Top colour bar ──────────────────────────────────────────
  topBar: {
    height: 5,
    backgroundColor: c.brand,
  },

  // ── Hero header ────────────────────────────────────────────
  header: {
    backgroundColor: c.surface,
    paddingHorizontal: 40,
    paddingTop: 36,
    paddingBottom: 32,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  brandBlock: {},
  brandName: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: c.brand,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  brandTagline: {
    fontSize: 9,
    color: c.muted,
    marginTop: 3,
    letterSpacing: 0.5,
  },
  badgeBlock: {
    alignItems: "flex-end",
  },
  badge: {
    backgroundColor: c.success,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: c.white,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  receiptLabel: {
    fontSize: 8,
    color: c.muted,
    marginTop: 6,
    textAlign: "right",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── Body ────────────────────────────────────────────────────
  body: {
    paddingHorizontal: 40,
    paddingTop: 32,
    paddingBottom: 40,
  },

  // ── Amount hero ─────────────────────────────────────────────
  amountHero: {
    backgroundColor: c.surface2,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: c.border,
  },
  amountLabel: {
    fontSize: 9,
    color: c.muted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 40,
    fontFamily: "Helvetica-Bold",
    color: c.white,
  },
  amountToken: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: c.brand,
    marginLeft: 6,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  networkPill: {
    marginTop: 10,
    backgroundColor: c.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: c.border,
  },
  networkPillText: {
    fontSize: 9,
    color: c.muted,
    letterSpacing: 0.5,
  },

  // ── Details grid ────────────────────────────────────────────
  sectionLabel: {
    fontSize: 8,
    color: c.muted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  detailCard: {
    backgroundColor: c.surface2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: 16,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  detailRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  detailKey: {
    fontSize: 10,
    color: c.muted,
  },
  detailValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.white,
    maxWidth: 240,
    textAlign: "right",
  },
  detailValueMono: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: c.white,
    maxWidth: 300,
    textAlign: "right",
  },
  successValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.success,
  },
  goldValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.gold,
  },
  brandValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.brand,
  },

  // ── Divider ─────────────────────────────────────────────────
  divider: {
    marginVertical: 20,
  },

  // ── Address block ───────────────────────────────────────────
  addressCard: {
    backgroundColor: c.surface2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.border,
    padding: 16,
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 8,
    color: c.muted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  addressValue: {
    fontSize: 8,
    color: c.brand,
    fontFamily: "Helvetica",
    lineHeight: 1.6,
    wordBreak: "break-all",
  },

  // ── Warning ─────────────────────────────────────────────────
  warning: {
    backgroundColor: "#1a1200",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7c4b00",
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 8,
    color: c.gold,
    lineHeight: 1.6,
  },

  // ── Thank you banner ────────────────────────────────────────
  thankYou: {
    backgroundColor: c.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.brand,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  thankYouTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: c.brand,
    marginBottom: 6,
  },
  thankYouSub: {
    fontSize: 9,
    color: c.muted,
    textAlign: "center",
    lineHeight: 1.6,
  },
  thankYouPaddy: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: c.white,
    marginTop: 4,
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: c.surface,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerBrand: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.brand,
    letterSpacing: 2,
  },
  footerSep: {
    fontSize: 10,
    color: c.border,
  },
  footerUrl: {
    fontSize: 8,
    color: c.muted,
  },
  footerDate: {
    fontSize: 8,
    color: c.muted,
    textAlign: "right",
  },

  // ── Bottom bar ──────────────────────────────────────────────
  bottomBar: {
    height: 3,
    backgroundColor: c.brand,
    opacity: 0.4,
  },
});

// ─────────────────────────────────────────────────────────────
// PDF Document
// ─────────────────────────────────────────────────────────────
function ReceiptDocument({ data }: { data: ReceiptData }) {
  const details = [
    { key: "Status",          value: data.status.toUpperCase(),           style: "success" },
    { key: "Network",         value: formatNetwork(data.network),          style: "normal" },
    { key: "Date",            value: data.date,                            style: "normal" },
    ...(data.completionTime
      ? [{ key: "Completed In", value: `⚡ ${data.completionTime}`,        style: "gold" }]
      : []),
  ];

  const ids = [
    { key: "Order ID",   value: data.orderId,   mono: true },
    { key: "Reference",  value: data.reference,  mono: true },
  ];

  return (
    <Document
      title={`GidSwap Receipt · ${data.reference}`}
      author="GidSwap"
      subject="Crypto to Fiat Transaction Receipt"
    >
      <Page size="A4" style={styles.page}>
        {/* Top colour bar */}
        <View style={styles.topBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>GidSwap</Text>
            <Text style={styles.brandTagline}>Your Trusted Crypto Paddy · gidswap.com</Text>
          </View>
          <View style={styles.badgeBlock}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓  Payment Successful</Text>
            </View>
            <Text style={styles.receiptLabel}>Official Receipt</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>

          {/* Amount hero */}
          <View style={styles.amountHero}>
            <Text style={styles.amountLabel}>Amount Sent</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountValue}>{data.amount}</Text>
              <Text style={styles.amountToken}>{data.token}</Text>
            </View>
            <View style={styles.networkPill}>
              <Text style={styles.networkPillText}>{formatNetwork(data.network)}</Text>
            </View>
          </View>

          {/* Transaction details */}
          <Text style={styles.sectionLabel}>Transaction Details</Text>
          <View style={styles.detailCard}>
            {details.map((row, i) => {
              const isLast = i === details.length - 1;
              const rowStyle = isLast ? styles.detailRowLast : styles.detailRow;
              const valStyle =
                row.style === "success" ? styles.successValue
                : row.style === "gold" ? styles.goldValue
                : styles.detailValue;
              return (
                <View key={row.key} style={rowStyle}>
                  <Text style={styles.detailKey}>{row.key}</Text>
                  <Text style={valStyle}>{row.value}</Text>
                </View>
              );
            })}
          </View>

          {/* Transaction IDs */}
          <Text style={[styles.sectionLabel, { marginTop: 4 }]}>Identifiers</Text>
          <View style={styles.detailCard}>
            {ids.map((row, i) => {
              const isLast = i === ids.length - 1;
              return (
                <View key={row.key} style={isLast ? styles.detailRowLast : styles.detailRow}>
                  <Text style={styles.detailKey}>{row.key}</Text>
                  <Text style={styles.detailValueMono}>{row.value}</Text>
                </View>
              );
            })}
          </View>

          {/* Deposit address */}
          <View style={styles.addressCard}>
            <Text style={styles.addressLabel}>Deposit Address</Text>
            <Text style={styles.addressValue}>{data.receiveAddress}</Text>
          </View>

          {/* Warning */}
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠  This receipt is for reference only. Always verify your transaction on-chain for full
              confirmation. GidSwap is not liable for funds sent to incorrect addresses.
            </Text>
          </View>

          {/* Thank you banner */}
          <View style={styles.thankYou}>
            <Text style={styles.thankYouTitle}>Thank You for Using GidSwap 🎉</Text>
            <Text style={styles.thankYouPaddy}>Your Trusted Crypto Paddy</Text>
            <Text style={styles.thankYouSub}>
              We appreciate your trust. Your transaction has been processed successfully.{"\n"}
              Share your experience and invite friends — we&apos;re growing together.
            </Text>
          </View>

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerBrand}>GIDSWAP</Text>
            <Text style={styles.footerSep}>  ·  </Text>
            <Text style={styles.footerUrl}>gidswap.com</Text>
          </View>
          <Text style={styles.footerDate}>
            Generated: {new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
          </Text>
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBar} />
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────
// Download Button (used in success modal)
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
          className={
            className ||
            "w-full bg-[#1a1d27] hover:bg-[#252836] text-white border border-[#252836] hover:border-[#4f8ef7]/40 font-semibold transition-all"
          }
          disabled={loading}
        >
          <FileDown className="w-4 h-4 mr-2 text-[#4f8ef7]" />
          {loading ? "Preparing Receipt…" : "Download Receipt PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
