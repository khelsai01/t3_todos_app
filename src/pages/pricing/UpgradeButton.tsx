import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@mui/material';
import { trpc } from '@/pages/_trpc/client';

const UpgradeButton = () => {
  const { mutate: createStripeSession } = trpc.todo.createStripeSession.useMutation({
    onSuccess: () => {
      window.location.href = "/billing";
    },
  });

  return (
    <Button onClick={() => createStripeSession()} className='w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white'>
      Upgrade now <ArrowRight className='h-5 w-5 ml-1.5' />
    </Button>
  );
};

export default UpgradeButton;
