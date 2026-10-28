import { getSql, getSystemSql, withScope } from "@/lib/db";
import { authorisedJob, runDigests, runOutbox, runReconciliation } from "@/lib/hub/jobs";
import { verifyTransaction } from "@/lib/hub/paystack";
import { createSmsProvider } from "@/lib/hub/sms";

/** /api/cron/outbox, /api/cron/digest, /api/cron/reconcile. Vercel Cron calls these with CRON_SECRET. */
export async function GET(request: Request, { params }: { params: Promise<{ job: string }> }) {
  if (!authorisedJob(request.headers.get("authorization"), process.env.CRON_SECRET?.trim() || null)) {
    return new Response("Not allowed.", { status: 401 });
  }
  const { job } = await params;
  const system = await getSystemSql();
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim() || null;
  let result: unknown;
  if (job === "outbox") result = await runOutbox(system, createSmsProvider());
  else if (job === "digest") result = await runDigests(system);
  else if (job === "reconcile") {
    result = await runReconciliation(
      system,
      (orgId, fn) => withScope({ userId: null, orgId }, async () => fn(await getSql())),
      secret ? (ref) => verifyTransaction(secret, ref) : undefined,
    );
  } else return new Response("No such job.", { status: 404 });
  return Response.json(result);
}
