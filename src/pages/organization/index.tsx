

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { LoadingSpine } from "@/components/Loading";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import Landing from "@/components/Home";

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

        toast.success(`Successfully joined organization as ${role}`, {
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
    <div className="container mx-auto px-4 py-8">
    {!session ? (
      <Landing />
    ) : (
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Create Organization</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full mb-4"
          onClick={handleCreateOrganization}
          disabled={loading}
        >
          Create Organization
        </button>

        <h1 className="text-3xl font-bold mb-8 text-center">Join Organization</h1>
        <input
          type="text"
          placeholder="Enter Organization Code to Join"
          value={organizationCode}
          onChange={(e) => setOrganizationCode(e.target.value)}
          className="border border-gray-300 rounded py-2 px-4 w-full mb-4"
        />
        <input
          type="text"
          placeholder="Enter Manager Code "
          value={managerCode}
          onChange={(e) => setManagerCode(e.target.value)}
          className="border border-gray-300 rounded py-2 px-4 w-full mb-4"
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full mb-8"
          onClick={handleJoinOrganization}
          disabled={loading}
        >
          Join Organization
        </button>

        <h1 className="text-3xl font-bold mb-8 text-center">Delete Organization</h1>
        <div className="mb-4">
          <input
            type="text"
            value={organizationToDelete}
            placeholder="Enter organization ID to delete"
            onChange={(e) => setOrganizationToDelete(e.target.value)}
            className="border border-gray-300 rounded py-2 px-4 w-full mb-2"
          />
        </div>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full"
          onClick={handleDeleteOrganization}
          disabled={loading}
        >
          Delete Organization
        </button>
      </div>
    )}
  </div>
  );
}

export default Organization;