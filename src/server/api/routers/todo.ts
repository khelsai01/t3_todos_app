import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "@/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { TRPCError } from "@trpc/server";
import { PLANS } from "@/pages/pricing/stripe";
import Stripe from "stripe";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan } from "@/lib/stripe";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-04-10",
  typescript: true,
});

const addTodoInput = z.object({
  userId: z.string(),
  title: z.string(),
  details: z.string(),
  done: z.boolean(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
  category: z.enum(["WORK", "PERSONAL", "FITNESS"]).optional(),
});

const setDoneInput = z.object({
  id: z.string(),
  done: z.boolean(),
});

const setEditInput = z.object({
  id: z.string(),
  title: z.string(),
  details: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
  category: z.enum(["WORK", "PERSONAL", "FITNESS"]).optional(),
});

export const todoRouter = createTRPCRouter({
  getTodosByUser: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const todos = await ctx.db.todo.findMany({
        where: {
          userId: input,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return todos;
    }),

  createTodo: publicProcedure
    .input(addTodoInput)
    .mutation(async ({ ctx, input }) => {
      const rateuserId = ctx.session?.user.id;

      if (!rateuserId) throw new Error("User ID is undefined");

      const { success } = await ratelimit.limit(rateuserId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const todo = await ctx.db.todo.create({
        data: {
          userId: input.userId,
          title: input.title,
          details: input.details,
          done: input.done,
          priority: input.priority,
          dueDate: input.dueDate,
          dueTime: input.dueTime,
          category: input.category,
        },
      });

      return todo;
    }),

  deleteTodo: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.todo.delete({
        where: {
          id: input,
        },
      });
    }),

  setDone: publicProcedure
    .input(setDoneInput)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.todo.update({
        where: {
          id: input.id,
        },
        data: {
          done: input.done,
        },
      });
    }),

  editTodo: publicProcedure
    .input(setEditInput)
    .mutation(async ({ ctx, input }) => {
      const updatedTodo = await ctx.db.todo.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          details: input.details,
          priority: input.priority,
          dueDate: input.dueDate,
          dueTime: input.dueTime,
          category: input.category,
        },
      });

      return updatedTodo;
    }),

  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session?.user.id;
    
    const billingUrl = absoluteUrl("/billing");

    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await ctx.db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!dbUser || !dbUser.stripeCustomerId)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    const subscriptionPlan = await getUserSubscriptionPlan();

    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      });

      return { url: stripeSession.url };
    }
 
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Business")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
    });
    console.log("success prizing")
    return { url: stripeSession.url };
  }),
});

export type TodoRouter = typeof todoRouter;