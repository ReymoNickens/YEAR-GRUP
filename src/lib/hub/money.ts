/** Integer pesewas only. The screen never invents a posting — it asks for one of these plans. */

export type LedgerLine = {
  txn: "pay" | "fee" | "settle" | "refund" | "payout";
  account: "clearing" | "fund" | "fees_expense" | "fees_recovered" | "org_bank" | "expense_paid";
  direction: "debit" | "credit";
  amount: number;
};

export type CollectionPlan = {
  gift: number;
  charge: number;
  gatewayFee: number;
  platformFee: number;
  lines: LedgerLine[];
};

function assertPesewas(amount: number, label: string) {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(`${label} must be whole pesewas.`);
  }
}

export function splitFees(gift: number, gatewayBps: number, platformBps: number) {
  assertPesewas(gift, "Gift");
  if (!Number.isInteger(gatewayBps) || !Number.isInteger(platformBps) || gatewayBps < 0 || platformBps < 0) {
    throw new Error("Fee rates are not valid.");
  }
  const gatewayFee = Math.round((gift * gatewayBps) / 10000);
  const platformFee = Math.round((gift * platformBps) / 10000);
  return { gatewayFee, platformFee, fees: gatewayFee + platformFee };
}

/**
 * Section 8 postings.
 * G is what the member pays. When they do not cover fees, the fund is credited G
 * and fees leave clearing. When they cover fees, G is the gift plus fees, and the
 * fund is credited only the gift. Test mode settles in the same plan so clearing
 * nets to zero. A live gateway would leave settlement for the payout.
 * Platform fee is not reversed here — that flag is still unconfirmed.
 */
export function planCollection(opts: {
  gift: number;
  gatewayBps: number;
  platformBps: number;
  coverFees: boolean;
  /** The test gateway settles at once. A live gateway settles later, through planSettlement. */
  settleNow?: boolean;
}): CollectionPlan {
  assertPesewas(opts.gift, "Gift");
  if (opts.gift <= 0) throw new Error("Enter an amount.");
  const { gatewayFee, platformFee, fees } = splitFees(opts.gift, opts.gatewayBps, opts.platformBps);
  const charge = opts.coverFees ? opts.gift + fees : opts.gift;
  const lines: LedgerLine[] = [];

  if (opts.coverFees) {
    lines.push({ txn: "pay", account: "clearing", direction: "debit", amount: charge });
    lines.push({ txn: "pay", account: "fund", direction: "credit", amount: opts.gift });
    if (fees > 0) {
      lines.push({ txn: "pay", account: "fees_recovered", direction: "credit", amount: fees });
    }
  } else {
    lines.push({ txn: "pay", account: "clearing", direction: "debit", amount: charge });
    lines.push({ txn: "pay", account: "fund", direction: "credit", amount: charge });
  }

  if (fees > 0) {
    lines.push({ txn: "fee", account: "fees_expense", direction: "debit", amount: fees });
    lines.push({ txn: "fee", account: "clearing", direction: "credit", amount: fees });
  }

  if (opts.settleNow !== false) lines.push(...planSettlement(charge - fees));

  return { gift: opts.gift, charge, gatewayFee, platformFee, lines };
}

/** The gateway pays the organisation's bank: clearing empties into the bank account. */
export function planSettlement(net: number): LedgerLine[] {
  assertPesewas(net, "Settlement");
  if (net <= 0) return [];
  return [
    { txn: "settle", account: "org_bank", direction: "debit", amount: net },
    { txn: "settle", account: "clearing", direction: "credit", amount: net },
  ];
}

/** An approved expense paid out of the organisation's bank account. */
export function planExpensePayout(amount: number): LedgerLine[] {
  assertPesewas(amount, "Payout");
  if (amount <= 0) throw new Error("Payout amount is empty.");
  return [
    { txn: "payout", account: "expense_paid", direction: "debit", amount },
    { txn: "payout", account: "org_bank", direction: "credit", amount },
  ];
}

/**
 * A refund reverses the fund for the refunded amount. Gateway fees stay. The
 * platform fee on the refunded share comes back only when the organisation's
 * setting says so (pass platformFeeShare), as a reversal against fees expense.
 */
export function planRefund(amount: number, platformFeeShare = 0): LedgerLine[] {
  assertPesewas(amount, "Refund");
  assertPesewas(platformFeeShare, "Platform fee share");
  if (amount <= 0) throw new Error("Refund amount is empty.");
  const lines: LedgerLine[] = [
    { txn: "refund", account: "fund", direction: "debit", amount },
    { txn: "refund", account: "clearing", direction: "credit", amount },
  ];
  if (platformFeeShare > 0) {
    lines.push({ txn: "refund", account: "clearing", direction: "debit", amount: platformFeeShare });
    lines.push({ txn: "refund", account: "fees_expense", direction: "credit", amount: platformFeeShare });
  }
  return lines;
}

/** Share of a fee that belongs to a refunded slice of the charge, in whole pesewas. */
export function proportionalFee(fee: number, refunded: number, charge: number): number {
  if (charge <= 0) return 0;
  return Math.min(fee, Math.round((fee * refunded) / charge));
}

export function signed(line: LedgerLine) {
  return line.direction === "debit" ? line.amount : -line.amount;
}

export function balancesByTxn(lines: LedgerLine[]) {
  const map = new Map<string, number>();
  for (const line of lines) map.set(line.txn, (map.get(line.txn) ?? 0) + signed(line));
  return map;
}

export function accountNet(lines: LedgerLine[], account: LedgerLine["account"]) {
  return lines.filter((l) => l.account === account).reduce((sum, line) => sum + signed(line), 0);
}

export function formatGhs(pesewas: number) {
  const cedis = (Number.isFinite(pesewas) ? pesewas : 0) / 100;
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cedis);
}

export function parseCedisToPesewas(input: string) {
  const cleaned = input.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const [whole, frac = ""] = cleaned.split(".");
  if (frac.length > 2) return null;
  const pesewas = Number(whole || "0") * 100 + Number((frac + "00").slice(0, 2));
  if (!Number.isInteger(pesewas) || pesewas <= 0) return null;
  return pesewas;
}
