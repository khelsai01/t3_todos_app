import { buffer } from "micro";
import Stripe from "stripe";

import { db } from "@/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "@/env/env";

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    const requestBuffer = await buffer(request);
    const sig = request.headers["stripe-signature"]!;

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10",
    });

    const event = stripe.webhooks.constructEvent(
      requestBuffer.toString(),
      sig,
      webhookSecret,
    );

    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object;

        await db.accounts.update({
          where: {
            userId: subscription.metadata.userId,
          },
          data: {
            stripStatus: "ACTIVE",
            package: "MONTHLY_SUBSCRIPTION",
            stripeCustomerId: subscription.customer as string,
          },
        });
        break;
      }

    }
    response.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    response.status(500).end();
  }
}
