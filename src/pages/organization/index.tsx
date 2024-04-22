import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { LoadingSpine } from "@/components/Loading";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import Todos from "../todos";

function Organization() {
  const { data: session } = useSession();
  const [organizationCode, setOrganizationCode] = useState("");
  const [managerCode, setManagerCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState("");
  const [assignData, setAssignData] = useState({ assignId: "", role: "" });
  const router = useRouter();

  const { mutate: assignRole } = api.organization.assignRole.useMutation({
    onSuccess: () => {
      setAssignData({ assignId: "", role: "" });
      setLoading(false);
      toast.success("Role assigned successfully", { icon: "🤝" });
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message ?? "Failed to assign role");
    },
  });
  const handlechangeRole = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAssignData({ ...assignData, [name]: value });
  };
  const handleAssignRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(assignData);
    assignRole({
      ...assignData,
      organizationCode: assignData.assignId,
      role: assignData.role,
    });
  };
  const { mutate: createOrganizationMutation } =
    api.organization.createOrganization.useMutation({
      onSuccess: ({ organization }) => {
        setOrganizationCode(organization.organizationCode);
        setManagerCode(organization.managerCode ?? ""); // Fix: Use nullish coalescing operator to provide a default value
        setLoading(false);
        toast.success(
          'Organization created successfully. Organization Code: ' + organization.organizationCode + ', Manager Code: ' + organization.managerCode,
          { icon: "🚀" },
        );
      },
      onError: (error) => {
        setLoading(false);
        toast.error(error.message ?? "Failed to create organization");
      },
    });

  const { mutate: joinOrganizationMutation } =
    api.organization.joinOrganization.useMutation({
      onSuccess: ({ role }) => {
            setLoading(false);

            toast.success("Successfully joined organization as " + role, {
              icon: "🤝",
            });

             // Assuming you want to pass organizationCode and managerCode as props
        const queryParams = {
          organizationCode: organizationCode,
          managerCode: managerCode,
        };
  
    // Navigate to "/todos" with query parameters
    void router.push({
      pathname: "/todos",
      query: queryParams,
    });
      },
      onError: (error) => {
        setLoading(false);
        toast.error(error.message ?? "Failed to join organization");
      },
    });

  const { mutate: deleteOrganizationMutation } =
    api.organization.deleteOrganization.useMutation({
      onSuccess: () => {
        setLoading(false);
        toast.success("Organization deleted successfully", { icon: "🗑" });
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
    return <Todos organizationCode={organizationCode} managerCode={managerCode}  />;
  };

  const handleDeleteOrganization = () => {
    setLoading(true);
    try {
      if (organizationToDelete) {
        deleteOrganizationMutation({ organizationCode: organizationToDelete });
      } else {
        setLoading(false);
      }
    } catch (error: unknown) {
      setLoading(false);
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

      <br />
      <br />
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

      <br />
      <br />
          <div>
            <h1>Delete Organization</h1>
            <form>
              <input
                type="text"
                value={organizationToDelete}
                placeholder="enter organization id number which you want to delete"
                onChange={(e) => setOrganizationToDelete(e.target.value)}
              />
              <button onClick={handleDeleteOrganization} disabled={loading}>
                Delete Organization
              </button>
            </form>
          </div>
        
      <br />
      <br />

      <div>
        <form onSubmit={handleAssignRole}>
          <input
            type="text"
            name="assignId"
            placeholder="enter organizationId"
            value={assignData.assignId}
            onChange={handlechangeRole}
          />
          <input
            type="text"
            name="role"
            placeholder="enter role in Uppercase ADMIN MEMBER"
            value={assignData.role}
            onChange={handlechangeRole}
          />
          <button type="submit" disabled={loading}>
            Assign Role
          </button>
        </form>
      </div>
    </div>
  );
}

export default Organization;