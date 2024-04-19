/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { LoadingSpine } from "@/components/Loading";
import { toast } from "react-hot-toast";

function Organization() {
  const { data: session } = useSession();
  const [organizationCode, setOrganizationCode] = useState("");
  const [managerCode, setManagerCode] = useState("");
  const [memberId, setMemberId] = useState("");
  const [newManagerRoleId, setNewManagerRoleId] = useState("");
  const [loading, setLoading] = useState(false);

  const { mutate: createOrganizationMutation } = api.organization.createOrganization.useMutation({
    onSuccess: ({ organization }) => {
      setOrganizationCode(organization.organizationCode);
      setManagerCode(organization.managerCode ?? "");
      setLoading(false);
      toast.success(`Organization created successfully. Organization Code: ${organization.organizationCode}, Manager Code: ${organization.managerCode}`, { icon: "🚀" });
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message ?? "Failed to create organization");
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

  const { mutate: editOrganizationMutation } = api.organization.editOrganization.useMutation({
    onSuccess: () => {
      setLoading(false);
      toast.success("Organization edited successfully", { icon: "✏️" });
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message ?? "Failed to edit organization");
    },
  });

  const handleCreateOrganization = () => {
    setLoading(true);
    createOrganizationMutation({ email: session?.user.email ?? "" });
  };

  const handleDeleteOrganization = () => {
    if (!organizationCode) {
      toast.error("Please enter the organization code");
      return;
    }
    setLoading(true);
    deleteOrganizationMutation(organizationCode); // Fix: Pass organizationCode as a string
  };

  const handleEditOrganization = () => {
    if (!organizationCode || !memberId || !newManagerRoleId) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    editOrganizationMutation({ organizationId: organizationCode, memberId, newManagerRoleId: newManagerRoleId as "MANAGER" | "MEMBER" });
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

      <h1>Delete Organization</h1>
      <input
        type="text"
        placeholder="Enter Organization Code to Delete"
        value={organizationCode}
        onChange={(e) => setOrganizationCode(e.target.value)}
      />
      <button onClick={handleDeleteOrganization} disabled={loading}>
        Delete Organization
      </button>

      <h1>Edit Organization</h1>
      <input
        type="text"
        placeholder="Enter Organization Code to Edit"
        value={organizationCode}
        onChange={(e) => setOrganizationCode(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Member ID"
        value={memberId}
        onChange={(e) => setMemberId(e.target.value)}
      />
      <select value={newManagerRoleId} onChange={(e) => setNewManagerRoleId(e.target.value)}>
        <option value="">Select Role</option>
        <option value="ADMIN">Admin</option>
        <option value="MANAGER">Manager</option>
        <option value="MEMBER">Member</option>
      </select>
      <button onClick={handleEditOrganization} disabled={loading}>
        Edit Organization
      </button>
    </div>
  );
}

export default Organization;
