// /* eslint-disable @typescript-eslint/no-unused-vars */

// import { db } from "@/server/db";
// import { api } from "@/utils/api";
// import { PrismaClient } from "@prisma/client";


// import type { GetServerSideProps } from "next";
// import { useSession } from "next-auth/react";

// const prisma = new PrismaClient()
// // @ts-expect-error leave this alone
// export const getServerSideProps: GetServerSideProps = async (ctx) => {
//     const { data: session } = useSession();

//     const userId = session?.user?.id;
      
    
    
//       if (userId) {
//         const account = await db.accounts.findFirst({
//           where: {
//             userId: userId,
//           },
//         });
    
//         if (account?.stripStatus === "INACTIVE") {
//           return {
//             redirect: {
//               destination: "/pricing",
//             },
//           };
//         }
//       }
    
//       return { props: {} };
//     };

// export default async function Home() {
    
//     const { data: session } = useSession();
//     const user = session?.user;


//   const  isSignedIn = user? true : false;
//   const { data: userdata } = api.account.getAccount.useQuery(void {}, {
//     enabled: isSignedIn,
//   });

//   const { mutate: cancelSubscriptionMutation } =
//     api.stripe.cancelSubscription.useMutation({
//       onSuccess: async () => {
//         window.location.reload();
//       },
//     });

//   const { mutate: resumeSubscriptionMutation } =
//     api.stripe.resumeSubscription.useMutation({
//       onSuccess: async () => {
//         window.location.reload();
//       },
//     });

//   const handleCancelSubscription = async () => {
//     cancelSubscriptionMutation({
//       stripeCustomerId: userdata!.stripeCustomerId!,
//     });
//   };

//   const handleResumeSubscription = async () => {
//     resumeSubscriptionMutation({
//       stripeCustomerId: userdata!.stripeCustomerId!,
//     });
//   };
//   return (
//     <section className="mt-10 flex flex-col gap-8">
//       <h1 className="text-center font-sans text-5xl font-extrabold tracking-tight">
//         Your Super Cool SaaS Application
//       </h1>
//       {isSignedIn ? (
//         <div className="flex flex-col gap-5">
//           {userdata?.package === "MONTHLY_SUBSCRIPTION" &&
//             userdata.stripStatus === "ACTIVE" && (
//               <button
//                 onClick={handleCancelSubscription}
//                 className="mx-auto w-min whitespace-nowrap font-bold"
//               >
//                 Cancel Subscription
//               </button>
//             )}
//           {userdata?.package === "MONTHLY_SUBSCRIPTION" &&
//              userdata.stripStatus === "CANCELLED" && (
//               <button
//                 onClick={handleResumeSubscription}
//                 className="mx-auto w-min whitespace-nowrap font-bold"
//               >
//                 Resume Subscription
//               </button>
//             )}
         
//             <button className="mx-auto w-min whitespace-nowrap border border-rose-900 bg-gradient-to-br from-rose-500 to-rose-700 px-10 py-2 text-2xl tracking-wide text-neutral-100 shadow-md">
//               Sign Out
//             </button>
          
//         </div>
//       ) : (
//         <div className="mx-auto flex flex-col gap-4">
          
//             <button className="mx-auto w-min whitespace-nowrap border border-indigo-900 bg-gradient-to-br from-indigo-500 to-indigo-700 px-10 py-2 text-2xl tracking-wide text-neutral-100 shadow-md">
//               Sign Up
//             </button>
         
//          {/*<SignInButton redirectUrl="/">*/}
//             <button className="text-center text-lg font-bold text-indigo-900">
//               Or Login
//             </button>
//                       {/*</SignInButton>*/}  
//         </div>
//       )}
//     </section>
//   );
// }
