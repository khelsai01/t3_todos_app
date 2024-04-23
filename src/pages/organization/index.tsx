import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { LoadingSpine } from "@/components/Loading";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import Todos from "../todos";
import { Header } from "@/components/header";

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
    <div className="flex flex-col items-center justify-center">
    {loading && <LoadingSpine />}
    <Header />
    <div className="my-8">
      <h1 className="text-2xl font-bold mb-4">Create Organization</h1>
      <button
        onClick={handleCreateOrganization}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Create Organization
      </button>
    </div>
  
    <div className="my-8 center">
      <h1 className="text-2xl font-bold mb-4">Join Organization</h1>
      <input
        type="text"
        placeholder="Enter Organization Code to Join"
        value={organizationCode}
        onChange={(e) => setOrganizationCode(e.target.value)}
        className="border border-gray-300 rounded-md p-2 mr-2 focus:outline-none focus:border-blue-500"
        />
        <br />
        <br />

      <input
        type="text"
        placeholder="Enter Manager Code (Optional)"
        value={managerCode}
        onChange={(e) => setManagerCode(e.target.value)}
        className="border border-gray-300 rounded-md p-2 mr-2 focus:outline-none focus:border-blue-500"
        />
        <br />
        <br />
        
        
      <button
        onClick={handleJoinOrganization}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Join Organization
      </button>
    </div>
  
    <div className="my-8">
      <h1 className="text-2xl font-bold mb-4">Delete Organization</h1>
      <form>
        <input
          type="text"
          value={organizationToDelete}
          placeholder="Enter organization ID to delete"
          onChange={(e) => setOrganizationToDelete(e.target.value)}
          className="border border-gray-300 rounded-md p-2 mr-2 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleDeleteOrganization}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Delete Organization
        </button>
      </form>
    </div>
  
    <div className="my-8">
      <h1 className="text-2xl font-bold mb-4">Assign Role</h1>
      <form onSubmit={handleAssignRole} className="flex items-center">
        <input
          type="text"
          name="assignId"
          placeholder="Enter organization ID"
          value={assignData.assignId}
          onChange={handlechangeRole}
          className="border border-gray-300 rounded-md p-2 mr-2 focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          name="role"
          placeholder="Enter role (ADMIN/MEMBER)"
          value={assignData.role}
          onChange={handlechangeRole}
          className="border border-gray-300 rounded-md p-2 mr-2 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Assign Role
        </button>
      </form>
    </div>
  </div>
  
  );
}

export default Organization;