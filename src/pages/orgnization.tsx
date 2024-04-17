import { api } from '@/utils/api';
import { useState } from 'react';
import { z } from 'zod';


const addMemberInputSchema = z.object({
  email: z.string().email(),
  organizationId: z.string(),
  role: z.enum(['ADMIN', 'MEMBER']),
});


export const AddMemberForm = () =>{
  const ctx = api.useUtils();
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [email , setEmail] = useState<string>('');
  const [organizationId , setOrganizationId] = useState<string>('');
  


  const { data: user } = api.organization.getUserDetails.useQuery();


  const { mutate } = api.organization.addMember.useMutation({
    onSuccess: () => {
      console.log("Member added successfully");
   
      void ctx.organization.getUserDetails.invalidate();
    },
    onError: (error) => {
      console.error("Error adding member:", error);
      
    },
  });

  const handleSubmit =  (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const input = addMemberInputSchema.parse({ email, organizationId, role });
      mutate(input);
    } catch (error) {
      console.error("Error validating input or calling mutation:", error);
    }
  };


  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={email}
        placeholder="Email"
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        name="organizationId"
        value={organizationId}
        onChange={(e) => setOrganizationId(e.target.value)}
        placeholder="Organization ID"
        required
      />
      <select
        name="role"
        required
        defaultValue="MEMBER"
        value={role}
        onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
      >
        <option value="ADMIN">Admin</option>
        <option value="MEMBER">Member</option>
      </select>
      <button type="submit">Add Member</button>
    </form>
  );
}
