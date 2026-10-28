import { getSql, getSystemSql, withScope } from "@/lib/db";
import { verifyTransaction } from "@/lib/hub/paystack";
import { handlePaystackWebhook } from "@/lib/hub/webhook";

/** Paystack calls this. The signature covers the exact bytes, so the body is read as text. */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim() || null;
  const out = await handlePaystackWebhook({
    rawBody,
    signature: request.headers.get("x-paystack-signature"),
    secret,
    system: await getSystemSql(),
    scoped: (orgId, fn) => withScope({ userId: null, orgId }, async () => fn(await getSql())),
    confirm: secret ? (reference) => verifyTransaction(secret, reference) : undefined,
  });
  return new Response(out.body, { status: out.status });
}
