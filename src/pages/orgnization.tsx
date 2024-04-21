import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { LoadingSpine } from "@/components/Loading";
import { toast } from "react-hot-toast";

function Organization() {
  const { data: session } = useSession();
  const [organizationCode, setOrganizationCode] = useState("");
  const [managerCode, setManagerCode] = useState("");
  const [loading, setLoading] = useState(false);

  const { mutate: createOrganizationMutation } = api.organization.createOrganization.useMutation({
    onSuccess: ({ organization }) => {
      setLoading(false);
      toast.success(`Organization created successfully. Organization Code: ${organization.organizationCode}, Manager Code: ${organization.managerCode}`, { icon: "🚀" });
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message ?? "Failed to create organization");
    },
  });

  const { mutate: joinOrganizationMutation } = api.organization.joinOrganization.useMutation({
    onSuccess: ({ role }) => {
      setLoading(false);
      toast.success(`Successfully joined organization as ${role}`, { icon: "🤝" });
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message ?? "Failed to join organization");
    },
  });

  const { mutate: deleteOrganizationMutation } = api.organization.deleteOrganization.useMutation({
    onSuccess: () => {
      setLoading(false);
      toast.success("Organization deleted successfully", { icon: "🗑️" });
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message ?? "Failed to delete organization");
    },
  });

  const handleCreateOrganization = () => {
    setLoading(true);
    if (session?.user.email) {
      createOrganizationMutation({ email: session.user.email });
    } else {
      setLoading(false);
      toast.error("User session not available. Please sign in again.");
    }
  };

  const handleJoinOrganization = () => {
    if (!organizationCode) {
      toast.error("Please enter the organization code");
      return;
    }
    setLoading(true);
    joinOrganizationMutation({ organizationCode, managerCode });
  };

  const handleDeleteOrganization =  () => {
    setLoading(true);
    try {
      const organizationToDelete = prompt("Enter the organization code to delete");
      if (organizationToDelete) {
        deleteOrganizationMutation({ organizationCode: organizationToDelete });
        toast.success("Organization deleted successfully", { icon: "🗑️" });
      } else {
        setLoading(false);
        toast.error("Invalid organization code for deletion");
      }
    } catch (error: unknown) {
      setLoading(false);
      toast.error((error as Error).message ?? "Failed to delete organization");
    }
  };

  if (!session) {
    return <p>Please sign in to access organizations</p>;
  }

  return (
    <div>
      {loading && <LoadingSpine />}
      <h1>Create Organization</h1>
      <button onClick={handleCreateOrganization} disabled={loading}>
        Create Organization
      </button>

      <h1>Join Organization</h1>
      <input
        type="text"
        placeholder="Enter Organization Code to Join"
        value={organizationCode}
        onChange={(e) => setOrganizationCode(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Manager Code (Optional)"
        value={managerCode}
        onChange={(e) => setManagerCode(e.target.value)}
      />
      <button onClick={handleJoinOrganization} disabled={loading}>
        Join Organization
      </button>

      {session && session.user.role === 'ADMIN' && ( // Show delete button only for ADMIN users
        <div>
          <h1>Delete Organization</h1>
          <button onClick={handleDeleteOrganization} disabled={loading}>
            Delete Organization
          </button>
        </div>
      )}
    </div>
  );
}

export default Organization;
