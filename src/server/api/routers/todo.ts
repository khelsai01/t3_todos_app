import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { TRPCError } from "@trpc/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

const addTodoInput = z.object({
  userId: z.string(),
  title: z.string(),
  details: z.string(),
  done: z.boolean(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
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
});

export const todoRouter = createTRPCRouter({
  getTodosByUser: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
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


  createTodo: publicProcedure.input(addTodoInput).mutation(async ({ ctx, input }) => {
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
        dueTime: input.dueTime, // Add 'dueTime' property
      },
    });
    return todo;
  }),

  deleteTodo: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return await ctx.db.todo.delete({
      where: {
        id: input,
      },
    });
  }),

  setDone: publicProcedure.input(setDoneInput).mutation(async ({ ctx, input }) => {
    await ctx.db.todo.update({
      where: {
        id: input.id,
      },
      data: {
        done: input.done,
      },
    });
  }),

  editTodo: publicProcedure.input(setEditInput).mutation(async ({ ctx, input }) => {
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
      },
    });

    return updatedTodo;
  }),
});
