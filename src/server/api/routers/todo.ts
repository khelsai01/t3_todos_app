import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

const addTodoInput = z.object({
  userId: z.string(),
  title: z.string(),
  details: z.string(),
  done: z.boolean()
});

const setDoneInput = z.object({
  id: z.string(),
  done: z.boolean(),
})


const setEditInput = z.object({
  id: z.string(),
  title: z.string(),
  details: z.string(),
});

export const todoRouter = createTRPCRouter({
  getTodosByUser: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const todos = await ctx.db.todo.findMany({
      where: {
        userId: input
      },
      orderBy: {
        createdAt:"desc"
      }
    })
    return todos;
  }),
  createTodo: publicProcedure.input(addTodoInput).mutation(async ({ ctx, input }) => {
    const todo = await ctx.db.todo.create({
      data: {
        userId: input.userId,
        title: input.title,
        details: input.details,
        done: input.done
      }
    })
    return todo
  }),
  deleteTodo: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return await ctx.db.todo.delete({
      where: {
        id: input
      }
    })
  }),
  setDone: publicProcedure.input(setDoneInput).mutation(async ({ ctx, input }) => {
    await ctx.db.todo.update({
      where: {
        id: input.id
      },
      data: {
        done: input.done
      }
    })
  }),


  editTodo: publicProcedure.input(setEditInput).mutation(async ({ ctx, input }) => {
    const updatedTodo = await ctx.db.todo.update({
      where: {
        id: input.id
      },
      data: {        
        title: input.title,
        details: input.details,
      }
    });

    return updatedTodo;
  })

});

// import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
// import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters

// // Create a new ratelimiter, that allows 10 requests per 10 seconds
// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(10, "10 s"),
//   analytics: true,
//   /**
//    * Optional prefix for the keys used in redis. This is useful if you want to share a redis
//    * instance with other applications and want to avoid key collisions. The default prefix is
//    * "@upstash/ratelimit"
//    */
//   prefix: "@upstash/ratelimit",
// });