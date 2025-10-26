import { checkoutAction } from "@/lib/payments/actions";
import { Check } from "lucide-react";
// STRIPE IMPORTS COMMENTED OUT - TO BE ENABLED LATER
// import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from "./submit-button";

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  // STRIPE FUNCTIONALITY COMMENTED OUT - USING MOCK DATA FOR NOW
  /*
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);
  */

  // Mock data while Stripe is disabled
  const basePlan = { name: "Base", id: "base_plan" };
  const plusPlan = { name: "Plus", id: "plus_plan" };
  const basePrice = {
    unitAmount: 800,
    interval: "month",
    trialPeriodDays: 7,
    id: "price_base",
  };
  const plusPrice = {
    unitAmount: 1200,
    interval: "month",
    trialPeriodDays: 7,
    id: "price_plus",
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Payment System Temporarily Disabled
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Stripe payments are currently disabled for development. The
                pricing plans below are for demonstration purposes. Payment
                functionality will be enabled when ready for production.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-xl mx-auto">
        <PricingCard
          name={basePlan?.name || "Base"}
          price={basePrice?.unitAmount || 800}
          interval={basePrice?.interval || "month"}
          trialDays={basePrice?.trialPeriodDays || 7}
          features={[
            "Unlimited Usage",
            "Unlimited Workspace Members",
            "Email Support",
          ]}
          priceId={basePrice?.id}
        />
        <PricingCard
          name={plusPlan?.name || "Plus"}
          price={plusPrice?.unitAmount || 1200}
          interval={plusPrice?.interval || "month"}
          trialDays={plusPrice?.trialPeriodDays || 7}
          features={[
            "Everything in Base, and:",
            "Early Access to New Features",
            "24/7 Support + Slack Access",
          ]}
          priceId={plusPrice?.id}
        />
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
}) {
  return (
    <div className="pt-6">
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        with {trialDays} day free trial
      </p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        ${price / 100}{" "}
        <span className="text-xl font-normal text-gray-600">
          per user / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>
    </div>
  );
}
