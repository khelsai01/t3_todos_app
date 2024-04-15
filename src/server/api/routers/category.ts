// import { z } from "zod";
// import { createTRPCRouter, publicProcedure } from "../trpc";

// export const categoryRouter = createTRPCRouter({
//     getCategories: publicProcedure.query(async ({ ctx }) => {
//         const categories = await ctx.db.category.findMany();
//         return categories;
//     }),
//     createCategory: publicProcedure.input(z.object({
//         name: z.string(),
//     })).mutation(async ({ ctx, input }) => {
//         const category = await ctx.db.category.create({
//             data: {
//                 name: input.name,
//             },
//         });
//         return category;
//     }),
// });

// // export type CategoryRouter = typeof categoryRouter