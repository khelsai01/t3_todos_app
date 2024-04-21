import { db } from "@/server/db";
import { Button } from "@mui/material";
import { signOut } from "next-auth/react";
// import type { GetServerSideProps } from "next";
import Link from "next/link";


export const GetServerSideProps = async (ctx: any) => {
    const userId  = ctx.session.user.id
  
    if (userId) {
      const user = await db.user.findFirst({
        where: {
          id: userId,
        },
      });

    if (user?.stripStatus === "INACTIVE") {
      return {
        redirect: {
          destination: "/packages",
        },
      };
    }
  }

  return { props: {} };
};

const SuccessPage = () => {
  return (
    <section className="mt-10 flex flex-col gap-8">
      <header className="flex w-full flex-col gap-3">
        <h1 className="text-center text-4xl font-extrabold tracking-tight">
          Thanks for Joining
        </h1>
        <div className="mx-auto flex w-1/2 flex-row justify-between">
          <Link href="/" className="w-full text-center font-bold">
            Home
          </Link>
          <>
            <button onClick={()=>void signOut()} className="w-full text-center font-bold">Sign Out</button>
          </>
        </div>
      </header>
    </section>
  );
};

export default SuccessPage;
