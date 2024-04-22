import React, { useState } from 'react';
import Organization from './organization';
import { Header } from '@/components/header';

const Index = () => {
  const [showOrganization, setShowOrganization] = useState(false);

  return (
    <div>
      <Header />
      <h1>Kuch Data ..</h1>
      <button onClick={() => setShowOrganization(true)}>Show Organization</button>
      
      {showOrganization && <Organization />}
    </div>
  );
};

export default Index;

