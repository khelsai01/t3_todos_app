/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const createOrganizationInput = z.object({
  email: z.string(),
});

const joinOrganizationInput = z.object({
  organizationCode: z.string(),
  managerCode: z.string().optional(), // Manager code is optional for joining
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

      // Generate organization and manager codes
      const organizationCode = (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000).toString();
      const managerCode = (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000).toString();

      // Create a new organization
      const organization = await prisma.organization.create({
        data: {
          name: 'New Organization', // You can set the name dynamically
          userId: user.id,
          plan: 'FREE', // Set the plan based on your logic
          organizationCode,
          managerCode,
          role: 'ADMIN', // Assigning the role as ADMIN by default
        },
      });

      // Return success message or data as needed
      return { message: 'Organization created successfully', organization };
    } catch (error) {
      throw new Error('Failed to create organization');
    }
  }),

  joinOrganization: publicProcedure.input(joinOrganizationInput).mutation(async ({ ctx, input }) => {
    const { organizationCode, managerCode } = input;
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

      let role: 'ADMIN' | 'MANAGER' | 'MEMBER' = 'MEMBER'; // Default role is MEMBER

      // Check if the manager code is correct (if provided)
      if (managerCode && managerCode === organization.managerCode) {
        role = 'MANAGER';
      }

      // Create a new membership record for the user in the organization with the determined role
      await prisma.membership.create({
        data: {
          userId,
          organizationId: organization.id,
          role,
        },
      });

      // Update roles for all users in the organization
      const memberships = await prisma.membership.findMany({
        where: { organizationId: organization.id },
      });

      for (const membership of memberships) {
        const userRole = membership.role;
        const user = await prisma.user.findUnique({
          where: { id: membership.userId },
        });

        if (user && userRole === 'ADMIN') {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' },
          });
        } else if (user && userRole === 'MANAGER') {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'MANAGER' },
          });
        } else if (user && userRole === 'MEMBER') {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'MEMBER' },
          });
        }
      }

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
      } else if ((error as Error).message === 'Invalid manager code') {
        throw new Error('Invalid manager code');
      } else {
        throw new Error('Failed to join organization');
      }
    }
  }),

  deleteOrganization: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const organizationCode = input;
    const userId = ctx.session?.user.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if the user is an ADMIN of the organization with the provided code
      const organization = await prisma.organization.findFirst({
        where: { organizationCode },
        include: { members: true }, // Include members to check roles
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      // Find the user's role in the organization
      const userRole = organization.members.find(member => member.userId === userId)?.role;

      if (!userRole || userRole !== 'ADMIN') {
        throw new Error('User is not authorized to delete the organization');
      }

      // Delete the organization
      await prisma.organization.delete({
        where: { id: organization.id },
      });

      return { message: 'Organization deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete organization');
    }
  }),

  editOrganization: publicProcedure.input(z.object({
    organizationId: z.string(),
    memberId: z.string(),
    newManagerRoleId: z.nativeEnum(Role), // Assuming Role enum includes 'ADMIN', 'MANAGER', 'MEMBER'
  })).mutation(async ({ ctx, input }) => {
    const { organizationId, memberId, newManagerRoleId } = input;
    const userId = ctx.session?.user.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if the user is an ADMIN of the organization with the provided ID
      const organization = await prisma.organization.findFirst({
        where: { id: organizationId },
        include: { members: true }, // Include members to check roles
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      // Find the user's role in the organization
      const userRole = organization.members.find(member => member.userId === userId)?.role;

      if (!userRole || userRole !== 'ADMIN') {
        throw new Error('User is not authorized to edit the organization');
      }

      // Update the role of the specified member
      await prisma.membership.update({
        where: { id: memberId },
        data: { role: newManagerRoleId },
      });

      return { message: 'Organization edited successfully' };
    } catch (error) {
      throw new Error('Failed to edit organization');
    }
  }),

});


