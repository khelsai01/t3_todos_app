/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

const deleteOrganizationInput = z.object({
  organizationCode: z.string(),
});

export const organizationRouter = createTRPCRouter({

  getOrganizations: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const organizations = await prisma.organization.findMany({
      where: {
        organizationCode: input
      }
    })
   
    return organizations;
  }),

  assignRole: publicProcedure.input(z.object({
    organizationCode: z.string(),
    managerCode: z.string().optional(),
    role: z.string(),
    
  })).mutation(async ({ ctx, input }) => {
    const { organizationCode, managerCode, role } = input;
  
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
  
      // Check if the user is a manager of the organization
      // const isManager = await prisma.membership.findFirst({
      //   where: { userId, organizationId: organization.id, role: 'MANAGER' },
      // });
  
      // if (!isManager) {
      //   throw new Error('User is not a manager of the organization');
      // }
  
      // Check if the manager code is correct
      // if (managerCode !== organization.managerCode) {
      //   throw new Error('Invalid manager code');
      // }
  
      // Check if the role is valid
      if (!['ADMIN', 'MANAGER', 'MEMBER'].includes(role)) {
        throw new Error('Invalid role');
      }

      // Update the user's role in the organization
      await prisma.user.update({
        where: { id:ctx.session?.user?.id},
        data: { role: role as Role },
      });
  console.log("updated",await prisma.user.findFirst({where: {id: ctx.session?.user?.id}}))
      // Return a success message
      return { message: 'Role assigned successfully' };
    } catch (error) {
      // Return specific error messages based on the error encountered
      if ((error as Error).message === 'Organization not found') {
        throw new Error('Organization not found');
      } else if ((error as Error).message === 'Invalid organization code') {
        throw new Error('Invalid organization code');
      } else if ((error as Error).message === 'User is not a manager of the organization') {
        throw new Error('User is not a manager of the organization');
      } else if ((error as Error).message === 'Invalid manager code') {
        throw new Error('Invalid manager code');
      } else if ((error as Error).message === 'Invalid role') {
        throw new Error('Invalid role');
      } else {
        throw new Error('Failed to assign role');
      }
    }
  }),

  createOrganization: publicProcedure.input(createOrganizationInput).mutation(async ({ctx,input}) => {
    const { email } = input;
    const userId = ctx.session?.user.id;
  
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
          joinedUsers: { set: [user.id] }, // Connect the user as admin
        },
      });
  
      // Create a membership record with admin role for the user
      await prisma.membership.create({
        data: {
          userId: userId!,
          organizationId: organization.id,
          role: 'ADMIN',
        },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'ADMIN',
        },
      });
       
     console.log("created",await prisma.user.findFirst({where: {id: user.id}}))
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
      const membership = await prisma.membership.findFirst({
        where: { userId, organizationId: organization.id },
      });
  
      if (membership) {
        // User is already a member, return their role
        return { message: 'User is already a member of the organization', role: membership.role };
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
  
      // Return a success message and the user's role
      return { message: 'Successfully joined organization', role };
    } catch (error) {
      console.error('Error joining organization:', error); // Log the specific error for debugging
      throw new Error('Failed to join organization'); // Throw a generic error message
    }
  }),
  
  
  deleteOrganization: publicProcedure.input(deleteOrganizationInput).mutation(async ({ ctx, input }) => {
    const { organizationCode } = input;
    const userId = ctx.session?.user.id;

    // if (!userId) {
    //   throw new Error('User not authenticated');
    // }

    try {
    //   // Check if the user is an ADMIN
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      console.log(user)
      if (!user || user.role !== 'ADMIN') {
        throw new Error('User is not authorized to delete organizations');
      }

      // Check if the organization with the provided code exists
      const organization = await prisma.organization.findUnique({
        where: { organizationCode },
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      // Delete the organization
      await prisma.organization.delete({
        where: { id: organization.id },
      });

      // Return a success message
      return { message: 'Organization deleted successfully' };
    } catch (error) {
      // Return specific error messages based on the error encountered
      if ((error as Error).message === 'User not authenticated') {
        throw new Error('User not authenticated');
      } else if ((error as Error).message === 'Organization not found') {
        throw new Error('Organization not found');
      } else if ((error as Error).message === 'User is not authorized to delete organizations') {
        throw new Error('User is not authorized to delete organizations');
      } else {
        throw new Error('Failed to delete organization');
      }
    }
  }),



});