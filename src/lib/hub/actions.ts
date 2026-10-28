"use server";

/**
 * The server actions the screens call. Each one runs a hub server function and
 * returns its result in an envelope, because Next.js hides thrown error messages
 * in production and members need to read why something did not go through.
 * Generated from the createServerFn exports; keep in step with them.
 */
import * as core from "./core";
import * as handlers from "./handlers";
import * as platform from "./platform";
import { envelope, type Envelope } from "./envelope";

type In = { data?: unknown } | undefined;

export async function abandonIntent(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.abandonIntent>>>> {
  return envelope(() => core.abandonIntent(input));
}

export async function aiAssist(input?: In): Promise<Envelope<Awaited<ReturnType<typeof handlers.aiAssist>>>> {
  return envelope(() => handlers.aiAssist(input));
}

export async function circleDetail(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.circleDetail>>>> {
  return envelope(() => core.circleDetail(input));
}

export async function circleList(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.circleList>>>> {
  return envelope(() => core.circleList(input));
}

export async function controlData(input?: In): Promise<Envelope<Awaited<ReturnType<typeof handlers.controlData>>>> {
  return envelope(() => handlers.controlData(input));
}

export async function feedData(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.feedData>>>> {
  return envelope(() => core.feedData(input));
}

export async function homeData(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.homeData>>>> {
  return envelope(() => core.homeData(input));
}

export async function hubAct(input?: In): Promise<Envelope<Awaited<ReturnType<typeof handlers.hubAct>>>> {
  return envelope(() => handlers.hubAct(input));
}

export async function intentState(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.intentState>>>> {
  return envelope(() => core.intentState(input));
}

export async function listOrgs(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.listOrgs>>>> {
  return envelope(() => core.listOrgs(input));
}

export async function myReceipts(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.myReceipts>>>> {
  return envelope(() => core.myReceipts(input));
}

export async function orgEntry(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.orgEntry>>>> {
  return envelope(() => core.orgEntry(input));
}

export async function peersWaiting(input?: In): Promise<Envelope<Awaited<ReturnType<typeof handlers.peersWaiting>>>> {
  return envelope(() => handlers.peersWaiting(input));
}

export async function peoplePage(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.peoplePage>>>> {
  return envelope(() => core.peoplePage(input));
}

export async function personDetail(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.personDetail>>>> {
  return envelope(() => core.personDetail(input));
}

export async function phoneStart(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.phoneStart>>>> {
  return envelope(() => core.phoneStart(input));
}

export async function phoneStatus(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.phoneStatus>>>> {
  return envelope(() => core.phoneStatus(input));
}

export async function phoneVerify(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.phoneVerify>>>> {
  return envelope(() => core.phoneVerify(input));
}

export async function platformOverview(input?: In): Promise<Envelope<Awaited<ReturnType<typeof platform.platformOverview>>>> {
  return envelope(() => platform.platformOverview(input));
}

export async function publicReceipt(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.publicReceipt>>>> {
  return envelope(() => core.publicReceipt(input));
}

export async function purposeDetail(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.purposeDetail>>>> {
  return envelope(() => core.purposeDetail(input));
}

export async function purposeList(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.purposeList>>>> {
  return envelope(() => core.purposeList(input));
}

export async function readModule(input?: In): Promise<Envelope<Awaited<ReturnType<typeof handlers.readModule>>>> {
  return envelope(() => handlers.readModule(input));
}

export async function registerMember(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.registerMember>>>> {
  return envelope(() => core.registerMember(input));
}

export async function startPayment(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.startPayment>>>> {
  return envelope(() => core.startPayment(input));
}

export async function stepUpConfirm(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.stepUpConfirm>>>> {
  return envelope(() => core.stepUpConfirm(input));
}

export async function stepUpStart(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.stepUpStart>>>> {
  return envelope(() => core.stepUpStart(input));
}

export async function structure(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.structure>>>> {
  return envelope(() => core.structure(input));
}

export async function testGateway(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.testGateway>>>> {
  return envelope(() => core.testGateway(input));
}

export async function verifyIntent(input?: In): Promise<Envelope<Awaited<ReturnType<typeof core.verifyIntent>>>> {
  return envelope(() => core.verifyIntent(input));
}
