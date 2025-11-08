"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button, Input, Badge } from "@/components/ui";
import {
  ArrowLeft,
  Users,
  Mail,
  UserPlus,
  Shield,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Clock,
  Check,
  X,
  AlertCircle,
} from "lucide-react";

interface CollaborationRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  message: string;
  requestedRole: "read" | "write" | "admin";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "admin" | "write" | "read";
  joinedAt: string;
  lastActive?: string;
}

interface HubData {
  id: string;
  title: string;
  ownerId: string;
  visibility: "public" | "private";
}

export default function CollaboratePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const hubId = params.hubId as string;

  const [hub, setHub] = useState<HubData | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"read" | "write" | "admin">(
    "read"
  );
  const [inviteMessage, setInviteMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hub details
      const hubResponse = await fetch(`/api/hubs/${hubId}`);
      const hubResult = await hubResponse.json();

      if (!hubResult.success) {
        setError(hubResult.message || "Hub not found");
        return;
      }

      const hubData = hubResult.data as HubData;

      // Check if user is owner or has admin rights
      if (hubData.ownerId !== user?.uid) {
        setError(
          "You do not have permission to manage collaborators for this hub"
        );
        return;
      }

      setHub(hubData);

      // Mock data for now - replace with actual API calls
      setCollaborators([
        {
          id: hubData.ownerId,
          name: "Owner",
          email: user?.email || "owner@example.com",
          role: "owner",
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        },
      ]);

      setRequests([
        {
          id: "1",
          requesterId: "user1",
          requesterName: "John Doe",
          requesterEmail: "john@example.com",
          message:
            "I would like to contribute to this hub. I have experience with similar projects.",
          requestedRole: "write",
          status: "pending",
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: "2",
          requesterId: "user2",
          requesterName: "Jane Smith",
          requesterEmail: "jane@example.com",
          message: "Looking to collaborate on this interesting project!",
          requestedRole: "read",
          status: "approved",
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          reviewedAt: new Date(Date.now() - 86400000).toISOString(),
          reviewedBy: user?.uid,
        },
      ]);
    } catch (error) {
      console.error("Error fetching collaboration data:", error);
      setError("Failed to load collaboration data");
    } finally {
      setLoading(false);
    }
  }, [hubId, user]);

  useEffect(() => {
    if (!hubId || !user) return;
    fetchData();
  }, [hubId, user, fetchData]);

  const handleInviteCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || sending) return;

    setSending(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(
        `Invitation sent to ${inviteEmail} with ${inviteRole} permissions!`
      );
      setInviteEmail("");
      setInviteMessage("");
    } catch (error) {
      console.error("Failed to send invitation:", error);
      alert("Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  const handleRequestAction = async (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    try {
      // Mock API call - replace with actual implementation
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: action === "approve" ? "approved" : "rejected",
                reviewedAt: new Date().toISOString(),
                reviewedBy: user?.uid,
              }
            : req
        )
      );

      if (action === "approve") {
        // Add to collaborators list
        const request = requests.find((r) => r.id === requestId);
        if (request) {
          setCollaborators((prev) => [
            ...prev,
            {
              id: request.requesterId,
              name: request.requesterName,
              email: request.requesterEmail,
              role: request.requestedRole,
              joinedAt: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to update request:", error);
      alert("Failed to update request");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-red-100 text-red-800";
      case "write":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Hub Not Found"}
          </h1>
          <Button onClick={() => router.push(`/hub/${hubId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hub
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/hub/${hubId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Hub
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Collaboration
                </h1>
                <p className="text-gray-600">{hub.title}</p>
              </div>
            </div>

            <Button
              onClick={() =>
                navigator.clipboard.writeText(window.location.href)
              }
            >
              <Copy className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Collaborators */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold">
                  Collaborators ({collaborators.length})
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {collaborator.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {collaborator.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {collaborator.email}
                      </p>
                      {collaborator.lastActive && (
                        <p className="text-xs text-gray-400">
                          Last active:{" "}
                          {new Date(
                            collaborator.lastActive
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(collaborator.role)}>
                      {collaborator.role}
                    </Badge>
                    {collaborator.role !== "owner" && (
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Invite Collaborators */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <UserPlus className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Invite Collaborators</h2>
            </div>

            <form onSubmit={handleInviteCollaborator} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "read" | "write" | "admin")
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="read">Read - Can view files</option>
                  <option value="write">
                    Write - Can view and upload files
                  </option>
                  <option value="admin">
                    Admin - Full access except deletion
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button type="submit" disabled={sending} className="w-full">
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </form>

            {/* Role Permissions Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">
                Permission Levels
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-gray-500" />
                  <span>
                    <strong>Read:</strong> View files and hub details
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Edit className="h-3 w-3 text-blue-500" />
                  <span>
                    <strong>Write:</strong> Read permissions + upload/edit files
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-red-500" />
                  <span>
                    <strong>Admin:</strong> Write permissions + manage
                    collaborators
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Collaboration Requests */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Collaboration Requests</h2>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No collaboration requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {request.requesterName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {request.requesterName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {request.requesterEmail}
                          </p>
                        </div>
                        <Badge className={getRoleColor(request.requestedRole)}>
                          {request.requestedRole}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">
                        {request.message}
                      </p>

                      <p className="text-xs text-gray-500">
                        Requested{" "}
                        {new Date(request.createdAt).toLocaleDateString()}
                        {request.reviewedAt && (
                          <>
                            {" "}
                            • Reviewed{" "}
                            {new Date(request.reviewedAt).toLocaleDateString()}
                          </>
                        )}
                      </p>
                    </div>

                    {request.status === "pending" && (
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleRequestAction(request.id, "approve")
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleRequestAction(request.id, "reject")
                          }
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Public Collaboration Link */}
        {hub.visibility === "public" && (
          <Card className="p-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Public Collaboration</h2>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Anyone can request to collaborate on this public hub using the
              link below:
            </p>

            <div className="flex items-center gap-2">
              <Input
                value={`${window.location.origin}/hub/${hubId}/request-collaboration`}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${window.location.origin}/hub/${hubId}/request-collaboration`
                  )
                }
                variant="outline"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
