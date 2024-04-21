// api.ts

import { createReactQueryHooks } from '@trpc/react';
import { createFetch } from '@trpc/client';
import superjson from 'superjson';

import { appRouter } from '@/server/api/trpc'; // Import your tRPC router

const fetcher = createFetch({
  baseUrl: '/api/trpc', // Your tRPC API endpoint
  fetch,
  transformResponse: superjson.deserialize,
});

export const trpc = createReactQueryHooks({ fetcher });

export const { useQuery } = trpc;

// Export the appRouter for usage in components
export const { createStripeSession } = appRouter.mutation('createStripeSession');
