"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button } from "@/components/ui";
import {
  ArrowLeft,
  Users,
  Send,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Shield,
} from "lucide-react";

interface HubData {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  ownerName?: string;
  visibility: "public" | "private";
  tags: string[];
}

export default function RequestCollaborationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const hubId = params.hubId as string;

  const [hub, setHub] = useState<HubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [requestedRole, setRequestedRole] = useState<
    "read" | "write" | "admin"
  >("read");
  const [message, setMessage] = useState("");

  const fetchHubData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/hubs/${hubId}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.message || "Hub not found");
        return;
      }

      const hubData = result.data as HubData;

      // Check if hub is public or if user is already owner
      if (hubData.visibility === "private") {
        setError(
          "This hub is private and does not accept collaboration requests"
        );
        return;
      }

      if (user && hubData.ownerId === user.uid) {
        setError("You are already the owner of this hub");
        return;
      }

      setHub(hubData);
    } catch (error) {
      console.error("Error fetching hub data:", error);
      setError("Failed to load hub data");
    } finally {
      setLoading(false);
    }
  }, [hubId, user]);

  useEffect(() => {
    if (!hubId) return;
    fetchHubData();
  }, [hubId, fetchHubData]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hub || !user) return;

    setSubmitting(true);
    try {
      // Mock API call - replace with actual implementation
      const requestData = {
        hubId: hub.id,
        requestedRole,
        message: message.trim(),
        requesterName: user.displayName || "Anonymous User",
        requesterEmail: user.email,
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Collaboration request:", requestData);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting request:", error);
      setError("Failed to submit collaboration request");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "read":
        return "View files and hub details";
      case "write":
        return "View files, upload new files, and edit existing ones";
      case "admin":
        return "Full access including managing other collaborators";
      default:
        return "";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "read":
        return <Eye className="h-4 w-4" />;
      case "write":
        return <Edit className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return null;
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
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            {error || "Hub Not Found"}
          </h1>
          <Button onClick={() => router.push("/explore")}>Browse Hubs</Button>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Request Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Your collaboration request has been sent to the hub owner.
            You&apos;ll be notified when they review your request.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push(`/hub/${hubId}`)}
              className="w-full"
            >
              View Hub
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/explore")}
              className="w-full"
            >
              Browse More Hubs
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-6">
            You need to sign in to request collaboration access to this hub.
          </p>
          <Button onClick={() => router.push("/auth")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/hub/${hubId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hub
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Request Collaboration
              </h1>
              <p className="text-gray-600">{hub.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Collaboration Request</h2>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    What level of access are you requesting?
                  </label>
                  <div className="space-y-3">
                    {(["read", "write", "admin"] as const).map((role) => (
                      <label
                        key={role}
                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          requestedRole === role
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={requestedRole === role}
                          onChange={(e) =>
                            setRequestedRole(e.target.value as typeof role)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getRoleIcon(role)}
                            <span className="font-medium capitalize">
                              {role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {getRoleDescription(role)}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tell the owner why you want to collaborate
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Explain your background, interest in the project, or how you can contribute..."
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This message will be sent to the hub owner along with your
                    request.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Collaboration Request
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hub Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3">About this Hub</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{hub.title}</h4>
                  <p className="text-sm text-gray-600">{hub.description}</p>
                </div>

                {hub.tags && hub.tags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      TOPICS
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {hub.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    OWNER
                  </p>
                  <p className="text-sm text-gray-900">
                    {hub.ownerName || "Hub Owner"}
                  </p>
                </div>
              </div>
            </Card>

            {/* What happens next */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3">What happens next?</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    1
                  </div>
                  <p>Your request will be sent to the hub owner</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    2
                  </div>
                  <p>The owner will review your request and message</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    3
                  </div>
                  <p>You&apos;ll receive a notification with their decision</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    4
                  </div>
                  <p>
                    If approved, you&apos;ll gain the requested access level
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
