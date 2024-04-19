import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { LoadingSpine } from "@/components/Loading";
import { toast } from "react-hot-toast";

function Organization() {
  const { data: session } = useSession();
  const [organizationCode, setOrganizationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const { mutate: createOrganization } = api.organization.createOrganization.useMutation({
    onSuccess: (data: { organizationCode: string }) => {
      setOrganizationCode(data.organizationCode);
      setLoading(false);
      toast.success("Organization created successfully", { icon: "🚀" });
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message ?? "Failed to create organization");
    },
  });

  const { mutate: joinOrganizationMutation } = api.organization.joinOrganization.useMutation({
    onSuccess: () => {
      setLoading(false);
      toast.success("Successfully joined organization", { icon: "🚀" });
    },
    onError: (error) => {
      setLoading(false);
      if (error.message === "Invalid organization code") {
        toast.error("Invalid organization code. Please check and try again.");
      } else {
        toast.error(error.message ?? "Failed to join organization");
      }
    },
  });
  
  const handleJoinOrganization = () => {
    if (!organizationCode) {
      toast.error("Organization code is required.");
      return;
    }
  
    setLoading(true);
    joinOrganizationMutation({ organizationCode });
  };
  
  const handleCreateOrganization = () => {
    setLoading(true);
    createOrganization({ email: session?.user.email ?? "" });
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
        placeholder="Enter Organization Code"
        value={organizationCode}
        onChange={(e) => setOrganizationCode(e.target.value)}
      />
      <button onClick={handleJoinOrganization} disabled={loading}>
        Join Organization
      </button>
    </div>
  );
}

export default Organization;