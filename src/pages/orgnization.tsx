import { api } from '@/utils/api';
import { z } from 'zod';


const addMemberInputSchema = z.object({
  email: z.string().email(),
  organizationId: z.string(),
  role: z.enum(['ADMIN', 'MEMBER']),
});


export default function AddMemberForm() {
  const ctx = api.useUtils();

  const { data: user } = api.organization.whoami.useQuery();

  console.log(user?.name)
  const { mutate } = api.organization.addMember.useMutation({
    onSuccess: () => {
      console.log("Member added successfully");
   
      void ctx.organization.whoami.invalidate();
    },
    onError: (error) => {
      console.error("Error adding member:", error);
      
    },
  });

  const handleSubmit =  (email: string, organizationId: string, role: 'ADMIN' | 'MEMBER') => {
    try {
 
      const input = addMemberInputSchema.parse({ email, organizationId, role });

  
       mutate(input);

    } catch (error) {
      console.error("Error validating input or calling mutation:", error);
     
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email') as string;
        const organizationId = formData.get('organizationId') as string;
        const role = formData.get('role') as 'ADMIN' | 'MEMBER'; 
        await handleSubmit(email, organizationId, role);
      }}
    >
      <input type="email" name="email" placeholder="Email" required />
      <input type="text" name="organizationId" placeholder="Organization ID" required />
      <select name="role" required defaultValue="MEMBER">
        <option value="ADMIN">Admin</option>
        <option value="MEMBER">Member</option>
      </select>
      <button type="submit">Add Member</button>
    </form>
  );
}
