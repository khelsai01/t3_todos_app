// 'use Client'

// // import React from 'react';
// import { ArrowRight } from 'lucide-react';
// import { Button } from '@mui/material';
// import { trpc } from '@/pages/_trpc/client';
// // import { api } from '@/utils/api';

// const UpgradeButton = () => {
//   const { mutate: createStripeSession } = trpc.todo.createStripeSession.useMutation({
//     onSuccess: ({url}) => {
//       window.location.href = url ?? "/dashboard/billing"
//     }
//   });

//   return (
//     <Button onClick={() => createStripeSession()} className='w-full '>
//       Upgrade now <ArrowRight className='h-5 w-5 ml-1.5' />
//     </Button>
//   );
// };

// export default UpgradeButton;
