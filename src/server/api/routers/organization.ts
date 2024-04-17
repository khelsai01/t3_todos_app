/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import {
  TRPCError,
  type inferProcedureBuilderResolverOptions,
} from "@trpc/server";
import { protectedProcedure, t } from "../trpc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



// Procedure to check if the user is a member of the organization
export const organizationProcedure = protectedProcedure
  .input(z.object({ organizationId: z.string() }))
  .use(function isMemberOfOrganization(opts) {
    // Find the membership of the user for the specified organization
    // console.log(ctx, "ctx");
    
    const membership = prisma.membership.findFirst({
      where: { organizationId: opts.input.organizationId },
    });
    if (!membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User is not a member of this organization.",
      });
    }

    // Pass the organization details to the next step
    return opts.next({
      ctx: {
        Organization: {
          id: membership.organization,
          // name: membership.user.name ?? "", // Use optional chaining
        },
      },
    });
  });

// Router for organization-related procedures
export const organizationRouter = t.router({
  // Get current user details
  getUserDetails: protectedProcedure.query( (opts) => {
    const { ctx } = opts;
    return ctx.session.user;
  }),

  // Add a new member to an organization
  addMember: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        organizationId: z.string(),
        role: z.enum(["ADMIN", "MEMBER"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the current user
     
      const { email, organizationId, role } = input;

      // Create a new user and membership record
      const newUser = await ctx.db.user.create({
        data: {
          email,
          memberships: {
            create: {
              role,
              organizationId,
            },
          },
        },
        include: {
          memberships: true,
        },
      });

      return newUser;
    }),
});

// Helper function to get members of an organization
async function getMembersOfOrganization(
  opts: inferProcedureBuilderResolverOptions<typeof organizationProcedure>,
) {


  // Fetch members of the organization from the database
  return await prisma.user.findMany({
    where: {
      memberships: {
        // organizationId: ctx.Organization.id,
      },
    },
  });
}


export const memberRouter = t.router({
 
  listMembers: organizationProcedure.query(async (opts) => {
    const members = await getMembersOfOrganization(opts);
    return members;
  }),
});

// Export the routers and types for external use
// export { Organization, Membership, User };
