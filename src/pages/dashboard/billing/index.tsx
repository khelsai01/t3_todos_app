// import BillingForm from "@/components/BillingForm"
// import { getUserSubscriptionPlan } from "@/lib/stripe";


// const Billing =  async() => {
//     const subscriptionPlan = await getUserSubscriptionPlan()

//     return <BillingForm subscriptionPlan={subscriptionPlan} />
// }
// export default Billing;


// import React, { useState, useEffect } from 'react';
// import BillingForm from "@/components/BillingForm";
// import { getUserSubscriptionPlan } from "@/lib/stripe";

// const Billing = () => {
//   const [subscriptionPlan, setSubscriptionPlan] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchSubscriptionPlan = async () => {
//       try {
//         const plan = await getUserSubscriptionPlan();

//         // Validate the plan object before setting state
//           if (plan && typeof plan === 'object') {
//               setSubscriptionPlan(plan);
//               setLoading(false);
//           }
//       } catch (error) {
//         console.error('Error fetching subscription plan:', error);
//         setLoading(false); // Set loading to false in case of error
//       }
//     };

//     fetchSubscriptionPlan();
//   }, []); // Empty dependency array ensures useEffect runs only once on component mount

//   // Render loading indicator while data is being fetched
//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   // Handle case where subscription plan is not available
//   if (!subscriptionPlan) {
//     return <p>Failed to load subscription plan.</p>;
//   }

//   // Render BillingForm component with fetched subscription plan
//   return <BillingForm subscriptionPlan={subscriptionPlan} />;
// };

// export default Billing;
