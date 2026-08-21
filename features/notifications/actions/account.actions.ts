"use server";

import { revalidatePath } from "next/cache";
import { requireAccount } from "@/features/account/server/accounts";
import { getServerLanguage } from "@/lib/i18n/server";
import {
  claimComplimentaryGala,
  markNotificationViewed,
  startSpecialOfferCheckout,
} from "@/features/notifications/server/notifications";

function revalidateAccountNotifications(role: "APPLICANT" | "JURY") {
  const root = role === "JURY" ? "/account/jury" : "/account/applicant";
  revalidatePath(root);
  revalidatePath(`${root}/notifications`);
  revalidatePath(`${root}/tickets`);
}

export async function markNotificationViewedAction(notificationId: string) {
  const account = await requireAccount();
  await markNotificationViewed(account.id, notificationId);
  revalidateAccountNotifications(account.role);
  return { ok: true };
}

export async function claimJuryGalaAction(notificationId: string, consent: boolean) {
  const account = await requireAccount("JURY");
  if (account.role !== "JURY") return { ok: false, message: "A jury account is required." };
  if (!consent) return { ok: false, message: "Please confirm that you would like the ticket." };
  try {
    const result = await claimComplimentaryGala({ accountId: account.id, notificationId });
    revalidateAccountNotifications(account.role);
    return { ok: true, ...result };
  } catch (error) {
    console.error("Gala notification acceptance failed.", error);
    return { ok: false, message: "We could not issue the Gala Dinner ticket. Please try again." };
  }
}

export async function startSpecialOfferCheckoutAction(notificationId: string) {
  const account = await requireAccount("JURY");
  if (account.role !== "JURY") {
    return { ok: false, message: "A jury account is required." };
  }
  try {
    const result = await startSpecialOfferCheckout({
      accountId: account.id,
      notificationId,
      locale: await getServerLanguage(),
    });
    revalidateAccountNotifications(account.role);
    if (result.alreadyPurchased) {
      return { ok: true, alreadyPurchased: true, message: "This offer has already been purchased." };
    }
    return { ok: true, checkoutUrl: result.checkoutUrl };
  } catch (error) {
    console.error("Special-offer Checkout creation failed.", error);
    return { ok: false, message: "Checkout is not available right now. Please try again later." };
  }
}
