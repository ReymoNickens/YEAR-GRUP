/**
 * What the screens import. Each function calls its server action and turns an
 * error envelope back into a thrown Error with the member-facing message.
 */
import * as actions from "./actions";
import { unwrap } from "./envelope-client";

export const abandonIntent = unwrap(actions.abandonIntent);
export const aiAssist = unwrap(actions.aiAssist);
export const circleDetail = unwrap(actions.circleDetail);
export const circleList = unwrap(actions.circleList);
export const controlData = unwrap(actions.controlData);
export const duesData = unwrap(actions.duesData);
export const feedData = unwrap(actions.feedData);
export const homeData = unwrap(actions.homeData);
export const hubAct = unwrap(actions.hubAct);
export const intentState = unwrap(actions.intentState);
export const listOrgs = unwrap(actions.listOrgs);
export const myReceipts = unwrap(actions.myReceipts);
export const orgEntry = unwrap(actions.orgEntry);
export const peersWaiting = unwrap(actions.peersWaiting);
export const peoplePage = unwrap(actions.peoplePage);
export const personDetail = unwrap(actions.personDetail);
export const phoneStart = unwrap(actions.phoneStart);
export const phoneStatus = unwrap(actions.phoneStatus);
export const phoneVerify = unwrap(actions.phoneVerify);
export const platformOverview = unwrap(actions.platformOverview);
export const publicReceipt = unwrap(actions.publicReceipt);
export const purposeDetail = unwrap(actions.purposeDetail);
export const purposeList = unwrap(actions.purposeList);
export const readModule = unwrap(actions.readModule);
export const registerMember = unwrap(actions.registerMember);
export const startPayment = unwrap(actions.startPayment);
export const stepUpConfirm = unwrap(actions.stepUpConfirm);
export const stepUpStart = unwrap(actions.stepUpStart);
export const structure = unwrap(actions.structure);
export const testGateway = unwrap(actions.testGateway);
export const verifyIntent = unwrap(actions.verifyIntent);
