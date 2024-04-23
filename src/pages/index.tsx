/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-unsafe-member-access */
/* eslint-disable  @typescript-eslint/no-unused-vars */




import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowRight, Check, HelpCircle, Minus } from 'lucide-react';
import { Button } from '@mui/material';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { api } from '@/utils/api';
import { db } from '@/server/db';
import { buttonVariants } from './pricing/Button';
import { PLANS } from './pricing/stripe';
import MaxWidthWrapper from './pricing/MaxWidthWrapper';
import { Header } from '@/components/header';

// Define the plan quotas and features


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const userId = (ctx as any)?.session?.user?.id;

  if (userId) {
    const account = await db.accounts.findFirst({
      where: {
        userId: userId,
      },
    });

    if (account?.stripStatus === 'ACTIVE') {
      return {
        redirect: {
          destination: '/organization',
          permanent: false,
        },
      };
    }
  }

  return { props: {} };
};

const Page = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const isLoaded = !!user;

  const { data: subscriptionSessionData } = api.stripe.getSubscriptionCheckoutURL.useQuery(void 0, {
    enabled: isLoaded,
  });

  const handleGoToSubscriptionCheckoutSession = async () => {
    const redirectURL = subscriptionSessionData?.redirectURL;

    if (redirectURL) {
      window.location.assign(redirectURL);
    }
  };

  const pricingItems = [
    {
      plan: 'Free',
      tagline: 'For small side projects.',
      quota: PLANS.find((p) => p.slug === 'free')?.quota ?? 0,
      features: [
        {
          text: '2 Todos per User',
          footnote: 'The maximum amount of 2 todos per user.',
        },
        {
          text: 'File attach not allowed',
          footnote: 'Not allowed.',
        },
        {
          text: 'Mobile-friendly interface',
        },
        {
          text: 'Higher-quality responses',
          footnote: 'Better algorithmic responses for enhanced content quality',
          negative: true,
        },
        {
          text: 'Priority support',
          negative: true,
        },
      ],
    },
    {
      plan: 'Business',
      tagline: 'For larger projects with higher needs.',
      quota: PLANS.find((p) => p.slug === 'business')?.quota ?? 0,
      features: [
        {
          text: 'Unlimited todos per user',
          footnote: 'The unlimited amount of todos per user.',
        },
        {
          text: '16MB file size attached limit',
          footnote: 'The maximum file size of a single file.',
        },
        {
          text: 'Mobile-friendly interface',
        },
        {
          text: 'Higher-quality responses',
          footnote: 'Better algorithmic responses for enhanced content quality',
        },
        {
          text: 'Priority support',
        },
      ],
    },
  ];
  return (
    <>
      <Header />
      <MaxWidthWrapper className="mb-8 mt-24 max-w-5xl text-center">
        <div className="mx-auto mb-10 sm:max-w-lg">
          <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
          <p className="mt-5 text-gray-600 sm:text-lg">
            Whether you&apos;re just trying out our service or need more,
            we&apos;ve got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 pt-12 lg:grid-cols-2">
          <TooltipProvider>
            {pricingItems.map(({ plan, tagline, quota, features }) => {
              const price =
                PLANS.find((p) => p.slug === plan.toLowerCase())?.price
                  .amount ?? 0;

              return (
                <div
                  key={plan}
                  className={cn("relative rounded-2xl bg-white shadow-lg", {
                    "border-2 border-blue-600 shadow-blue-200":
                      plan === "Business",
                    "border border-gray-200": plan !== "Business",
                  })}
                >
                  {plan === "Business" && (
                    <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white">
                      Upgrade now
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="font-display my-3 text-center text-3xl font-bold">
                      {plan}
                    </h3>
                    <p className="text-gray-500">{tagline}</p>
                    <p className="font-display my-5 text-6xl font-semibold">
                      ${price}
                    </p>
                    <p className="text-gray-500">per month</p>
                  </div>

                  <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-1">
                      <p>{quota.toLocaleString()} Todo/user included</p>

                      <Tooltip delayDuration={300}>
                        <TooltipTrigger className="ml-1.5 cursor-default">
                          <HelpCircle className="h-4 w-4 text-zinc-500" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-2">
                          How many todos you can create per month.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <ul className="my-10 space-y-5 px-8">
                    {features.map(({ text, footnote, negative }) => (
                      <li key={text} className="flex space-x-5">
                        <div className="flex-shrink-0">
                          {negative ? (
                            <Minus className="h-6 w-6 text-gray-300" />
                          ) : (
                            <Check className="h-6 w-6 text-blue-500" />
                          )}
                        </div>
                        {footnote ? (
                          <div className="flex items-center space-x-1">
                            <p
                              className={cn("text-gray-600", {
                                "text-gray-400": negative,
                              })}
                            >
                              {text}
                            </p>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger className="ml-1.5 cursor-default">
                                <HelpCircle className="h-4 w-4 text-zinc-500" />
                              </TooltipTrigger>
                              <TooltipContent className="w-80 p-2">
                                {footnote}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <p
                            className={cn("text-gray-600", {
                              "text-gray-400": negative,
                            })}
                          >
                            {text}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-200" />
                  <div className="p-5">
                  {plan === 'Free' ? (
                        <Link
                          href={
                            user ? '/todos' : '/signIn'
                          }
                          className={buttonVariants({
                            className: 'w-full',
                            variant: 'secondary',
                          })}>
                          {user ? 'TRY FREE' : 'Sign in'}
                          <ArrowRight className='h-5 w-5 ml-1.5' />
                        </Link>
                      ) : user ? (
                        <Button
                        onClick={()=>handleGoToSubscriptionCheckoutSession()}
                        >Upgrade Now</Button>
                      ) : (
                        <Link
                          href={
                            user ? '/organization' : '/signIn'
                          }
                          className={buttonVariants({
                            className: 'w-full',
                          })}>
                          {user ? 'Upgrade now' : 'Sign In'}
                          <ArrowRight className='h-5 w-5 ml-1.5' />
                        </Link>
                      )}
                  
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  );
};

export default Page;
