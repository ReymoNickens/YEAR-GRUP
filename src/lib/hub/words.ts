/**
 * Plain words for the codes the database stores, so no member or officer
 * ever reads an internal name on screen.
 */
const MESSAGE_TITLES: Record<string, string> = {
  announcement: "Announcement",
  claim_link: "Your place is waiting",
  claim_update: "Update on your place",
  payment_failed: "A payment did not go through",
  payment_receipt: "Receipt for your gift",
  refund_processed: "Refund sent",
  weekly_digest: "This week in your circles",
  receipt: "Receipt",
};

const CHANNELS: Record<string, string> = { sms: "Text message", in_app: "In the app", email: "Email", push: "Notification" };

const DELIVERY: Record<string, string> = {
  queued: "Waiting to send",
  processing: "Sending",
  delivered: "Delivered",
  failed: "Trying again",
  dead_letter: "Could not be sent",
  held_no_provider: "Held: text messages are not connected yet",
  held_budget: "Held: this month's text budget is used",
};

const ACCOUNTS: Record<string, string> = {
  org_bank: "In the bank",
  fund: "Given (all gifts)",
  clearing: "Waiting to settle",
  fees_expense: "Fees paid",
  fees_recovered: "Fees covered by givers",
  expense_paid: "Spent on expenses",
  platform_fee: "Platform fee",
};

const AREAS: Record<string, string> = {
  people: "People",
  money: "Money",
  community: "Community",
  communication: "Messages",
  governance: "Governance",
  events: "Events",
  reports: "Reports",
};

const fallback = (code: string) => code.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase());

export const messageTitle = (code: string) => MESSAGE_TITLES[code] ?? fallback(code);
export const channelName = (code: string) => CHANNELS[code] ?? fallback(code);
export const deliveryState = (code: string) => DELIVERY[code] ?? fallback(code);
export const accountName = (code: string) => ACCOUNTS[code] ?? fallback(code);
export const areaName = (code: string) => AREAS[code] ?? fallback(code);

const MEMBER_STATES: Record<string, string> = {
  verified: "Confirmed member",
  claimed: "Waiting on confirmation",
  approved: "On the list, not yet joined",
  invited: "Invited",
};
export const memberState = (code: string) => MEMBER_STATES[code] ?? fallback(code);

const EXPENSE_STATES: Record<string, string> = {
  submitted: "Waiting for approval",
  partially_approved: "One signature, needs a second",
  approved: "Approved, not yet paid",
  paid: "Paid",
  rejected: "Turned down",
};
export const expenseState = (code: string) => EXPENSE_STATES[code] ?? fallback(code);

const REFUND_STATES: Record<string, string> = {
  awaiting_approval: "Waiting for a second person",
  approved: "Refunded",
  rejected: "Declined",
};
export const refundState = (code: string) => REFUND_STATES[code] ?? fallback(code);
