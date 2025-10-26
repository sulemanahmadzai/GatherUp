"use server";

import { redirect } from "next/navigation";
// STRIPE IMPORTS COMMENTED OUT - TO BE ENABLED LATER
// import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { withUser } from "@/lib/auth/middleware";

export const checkoutAction = withUser(async (formData, user) => {
  // STRIPE CHECKOUT COMMENTED OUT - REDIRECT TO MESSAGE PAGE
  // const priceId = formData.get('priceId') as string;
  // await createCheckoutSession({ user: user, priceId });
  redirect("/pricing?message=stripe_disabled");
});

export const customerPortalAction = withUser(async (_, user) => {
  // STRIPE CUSTOMER PORTAL COMMENTED OUT - REDIRECT TO MESSAGE PAGE
  // const portalSession = await createCustomerPortalSession(user);
  // redirect(portalSession.url);
  redirect("/dashboard?message=stripe_disabled");
});
