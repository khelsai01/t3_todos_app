/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createOrganizationInput = z.object({
  email: z.string(),
});

const joinOrganizationInput = z.object({
  organizationCode: z.string(),
});

export const organizationRouter = createTRPCRouter({
  createOrganization: publicProcedure.input(createOrganizationInput).mutation(async (opts) => {
    const { email } = opts.input;

    try {
      // Check if the user with the provided email exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create a new organization
      const organization = await prisma.organization.create({
        data: {
          name: 'New Organization', // You can set the name dynamically
          userId: user.id,
          plan: 'FREE', // Set the plan based on your logic
          organizationCode: (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000).toString(), // Generate a random code
        },
      });

      // Assign the user as ADMIN of the organization
      await prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'ADMIN',
        },
      });

      return { organizationCode: organization.organizationCode };
    } catch (error) {
      throw new Error('Failed to create organization');
    }
  }),


  joinOrganization: publicProcedure.input(joinOrganizationInput).mutation(async ({ ctx, input }) => {
    const { organizationCode } = input;
    const userId = ctx.session?.user.id;
  
    if (!userId) {
      throw new Error('User not authenticated');
    }
  
    try {
      // Check if the organization with the provided code exists
      const organization = await prisma.organization.findUnique({
        where: { organizationCode },
      });
  
      if (!organization) {
        throw new Error('Organization not found');
      }
  
      // Verify that the provided organization code matches the expected code for the organization
      if (organization.organizationCode !== organizationCode) {
        throw new Error('Invalid organization code');
      }
  
      // Check if the user is already a member of the organization
      const isMember = await prisma.membership.findFirst({
        where: { userId, organizationId: organization.id },
      });
  
      if (isMember) {
        throw new Error('User is already a member of the organization');
      }
  
      // Create a new membership record for the user in the organization with role 'MEMBER'
      await prisma.membership.create({
        data: {
          userId,
          organizationId: organization.id,
          role: 'MEMBER',
        },
      });
  
      // Add the user's userId to the joinedUsers array in the organization
      await prisma.organization.update({
        where: { id: organization.id },
        data: { joinedUsers: { push: userId } },
      });
  
      // Return a success message
      return { message: 'Successfully joined organization' };
    } catch (error) {
      // Return specific error messages based on the error encountered
      if ((error as Error).message === 'User not authenticated') {
        throw new Error('User not authenticated');
      } else if ((error as Error).message === 'Organization not found') {
        throw new Error('Organization not found');
      } else if ((error as Error).message === 'User is already a member of the organization') {
        throw new Error('User is already a member of the organization');
      } else if ((error as Error).message === 'Invalid organization code') {
        throw new Error('Invalid organization code');
      } else {
        throw new Error('Failed to join organization');
      }
    }
  }),
  



});