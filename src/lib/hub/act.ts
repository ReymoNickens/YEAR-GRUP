import { hubAct as serverAct } from "@/lib/hub/api";
import { QUEUEABLE, sendOrQueue } from "@/lib/offline-queue";

type Args = { data: Record<string, unknown> };

/**
 * The one way screens call hubAct. Safe-to-delay actions wait on the device when
 * offline; everything else goes straight to the server and fails loudly if it cannot.
 */
export async function hubAct(args: Args): Promise<unknown> {
  const type = String(args.data.type ?? "");
  if (!QUEUEABLE.has(type)) return serverAct({ data: args.data as never });
  return sendOrQueue((payload) => serverAct({ data: payload as never }), args.data);
}
