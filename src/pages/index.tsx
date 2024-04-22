import React, { useState } from 'react';
import Organization from './organization';
import { Header } from '@/components/header';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const Home = () => {

  const { data: session } = useSession();
  const user = session?.user;
  return (
    <div>
      <Header />
      <h1>Kuch Data ..</h1>
      <Link href={"/organization"}>Show Organization</Link>
    </div>
  );
};

export default Home;

