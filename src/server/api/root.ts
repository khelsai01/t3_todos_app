/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { todoRouter } from "@/server/api/routers/todo";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { organizationRouter } from "./routers/organization";
import { stripeRouter } from "./routers/stripe";
import { accountRouter } from "./routers/account";



/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  todo: todoRouter,
  organization: organizationRouter,
  stripe: stripeRouter,
  account: accountRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;


/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
