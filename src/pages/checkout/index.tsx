/* eslint-disable  @typescript-eslint/consistent-type-imports */

import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { ParsedUrlQuery } from 'querystring';
import { db } from '@/server/db';

interface Props {
  isAuthenticated: boolean;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context: GetServerSidePropsContext<ParsedUrlQuery>
) => {
  const session = await getSession(context);

  if (!session?.user?.id) {
  
    return {
      redirect: {
        destination: '/singIn',
        permanent: false,
      },
    };
  }

  const userId = session.user.id;

  const account = await db.accounts.findFirst({
    where: {
      userId: userId,
    },
  });

  if (account?.stripStatus === 'INACTIVE') {
    // Redirect to pricing page if account is inactive
    return {
      redirect: {
        destination: '/pricing',
        permanent: false,
      },
    };
  }

  return {
    props: {
      isAuthenticated: true,
    },
  };
};

const SuccessPage = ({ isAuthenticated }: Props) => {
  if (!isAuthenticated) {
    // Handle case where user is not authenticated (should not reach this page)
    return <div>Redirecting...</div>;
  }

  return (
    <section className="mt-10 flex flex-col gap-8">
      <header className="flex w-full flex-col gap-3">
        <h1 className="text-center text-4xl font-extrabold tracking-tight">
          Thanks for Joining
        </h1>
        <div className="mx-auto flex w-1/2 flex-row justify-between">
          <Link href="/" passHref>
            <a className="w-full text-center font-bold">Home</a>
          </Link>
          <button onClick={() => signOut()} className="w-full text-center font-bold">
            Sign Out
          </button>
        </div>
      </header>
    </section>
  );
};

export default SuccessPage;
