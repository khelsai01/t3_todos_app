/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { PrismaClient, type Role } from '@prisma/client';

const prisma = new PrismaClient();

const createOrganizationInput = z.object({
  email: z.string(),
});

const joinOrganizationInput = z.object({
  organizationCode: z.string(),
  managerCode: z.string().optional(), 
});

const deleteOrganizationInput = z.object({
  organizationCode: z.string(),
});

export const organizationRouter = createTRPCRouter({

  allOrganization: publicProcedure.query(async () => {
    const organizations = await prisma.organization.findMany();
    return organizations;
  }),
  

  getOrganizations: publicProcedure.input(z.string()).query(async (opts) => {
    const organizations = await prisma.organization.findMany({
      where: {
        organizationCode: opts.input
      }
    })
   
    return organizations;
  }),

  assignRole: publicProcedure.input(z.object({
    organizationCode: z.string(),
    managerCode: z.string().optional(),
    role: z.string(),
    
  })).mutation(async ({ ctx, input }) => {
    const { organizationCode,role } = input;
  
    try {
      const organization = await prisma.organization.findUnique({
        where: { organizationCode },
      });
  
      if (!organization) {
        throw new Error('Organization not found');
      }
  
      if (organization.organizationCode !== organizationCode) {
        throw new Error('Invalid organization code');
      }
  
      if (!['ADMIN', 'MANAGER', 'MEMBER'].includes(role)) {
        throw new Error('Invalid role');
      }

      await prisma.user.update({
        where: { id:ctx.session?.user?.id},
        data: { role: role as Role },
      });
  console.log("updated",await prisma.user.findFirst({where: {id: ctx.session?.user?.id}}))

      return { message: 'Role assigned successfully' };
    } catch (error) {
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
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        throw new Error('User not found');
      }
  
      const organizationCode = (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000).toString();
      const managerCode = (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000).toString();
  
      const organization = await prisma.organization.create({
        data: {
          name: 'New Organization', 
          userId: user.id,
          plan: 'FREE',
          organizationCode,
          managerCode,
          role: 'ADMIN',
          joinedUsers: { set: [user.id] },
        },
      });
  
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
      const organization = await prisma.organization.findUnique({
        where: { organizationCode },
      });
  
      if (!organization) {
        throw new Error('Organization not found');
      }
  
      if (organization.organizationCode !== organizationCode) {
        throw new Error('Invalid organization code');
      }
  
      const membership = await prisma.membership.findFirst({
        where: { userId, organizationId: organization.id },
      });
  
      if (membership) {
        return { message: 'User is already a member of the organization', role: membership.role };
      }
  
      let role: 'ADMIN' | 'MANAGER' | 'MEMBER' = 'MEMBER'; // Default role is MEMBER
  
      if (managerCode && managerCode === organization.managerCode) {
        role = 'MANAGER';
      }
  
      await prisma.membership.create({
        data: {
          userId,
          organizationId: organization.id,
          role,
        },
      });
  
      return { message: 'Successfully joined organization', role };
    } catch (error) {
      console.error('Error joining organization:', error); 
      throw new Error('Failed to join organization');
    }
  }),
  
  
  deleteOrganization: publicProcedure.input(deleteOrganizationInput).mutation(async ({ ctx, input }) => {
    const { organizationCode } = input;
    const userId = ctx.session?.user.id;

  

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      console.log(user)
      if (!user || user.role !== 'ADMIN') {
        throw new Error('User is not authorized to delete organizations');
      }

      const organization = await prisma.organization.findUnique({
        where: { organizationCode },
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      await prisma.organization.delete({
        where: { id: organization.id },
      });

      return { message: 'Organization deleted successfully' };
    } catch (error) {
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