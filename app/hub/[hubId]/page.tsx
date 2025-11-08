"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button, Badge } from "@/components/ui";
import {
  Star,
  GitFork,
  Eye,
  Settings,
  Download,
  Upload,
  Users,
  History,
  FileText,
  Lock,
  Globe,
  User,
  FileIcon,
  MoreHorizontal,
  Edit3,
} from "lucide-react";

interface HubData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  ownerId: string;
  visibility: "public" | "private";
  previewImage: string;
  files: FileData[];
  stars: number;
  starredBy: string[];
  createdAt: string;
  updatedAt: string;
}

interface FileData {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  uploaderName?: string;
  version?: number;
}

interface ActivityItem {
  id: string;
  type:
    | "hub_created"
    | "hub_updated"
    | "file_uploaded"
    | "file_deleted"
    | "file_updated";
  message: string;
  userId: string;
  userName?: string;
  timestamp: string;
  metadata?: { fileName?: string; [key: string]: unknown };
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "admin" | "write" | "read";
  joinedAt: string;
}

type TabType = "files" | "history" | "collaborators" | "settings";

export default function HubPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const hubId = params.hubId as string;

  const [hub, setHub] = useState<HubData | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [history, setHistory] = useState<ActivityItem[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("files");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hubId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [hubResponse, filesResponse, historyResponse] = await Promise.all(
          [
            fetch(`/api/hubs/${hubId}`),
            fetch(`/api/files?hubId=${hubId}`),
            fetch(`/api/hubs/${hubId}/history`),
          ]
        );

        const hubResult = await hubResponse.json();
        if (!hubResult.success) {
          setError(hubResult.message || "Failed to fetch hub");
          return;
        }

        setHub(hubResult.data);

        const filesResult = await filesResponse.json();
        if (filesResult.success) {
          setFiles(filesResult.data || []);
        }

        const historyResult = await historyResponse.json();
        if (historyResult.success) {
          setHistory(historyResult.data || []);
        }

        // Mock collaborators for now
        setCollaborators([
          {
            id: hubResult.data.ownerId,
            name: hubResult.data.ownerName || "Owner",
            email: "owner@example.com",
            role: "owner",
            joinedAt: hubResult.data.createdAt,
          },
        ]);
      } catch (error) {
        console.error("Error fetching hub data:", error);
        setError("An error occurred while loading the hub");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [hubId]);

  const handleStarHub = async () => {
    if (!user || !hub) return;

    try {
      const response = await fetch("/api/stars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hubId }),
      });

      const result = await response.json();
      if (result.success) {
        setHub((prev) =>
          prev
            ? {
                ...prev,
                stars: result.data.starred ? prev.stars + 1 : prev.stars - 1,
                starredBy: result.data.starred
                  ? [...prev.starredBy, user.uid]
                  : prev.starredBy.filter((id) => id !== user.uid),
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error starring hub:", error);
    }
  };

  const isOwner = user && hub && hub.ownerId === user.uid;
  const isStarred = user && hub && hub.starredBy?.includes(user.uid);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Hub Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error
              ? "Please try again later."
              : "The hub you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => router.push("/explore")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Hubs
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {hub.title}
                </h1>
                <Badge
                  variant={
                    hub.visibility === "public" ? "primary" : "secondary"
                  }
                >
                  {hub.visibility === "public" ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
              </div>

              <p className="text-gray-600 mb-4">{hub.description}</p>

              {/* Tags */}
              {hub.tags && hub.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {hub.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>{hub.stars}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>Watching</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="h-4 w-4" />
                  <span>Fork</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {user && !isOwner && (
                <Button
                  onClick={handleStarHub}
                  variant="outline"
                  size="sm"
                  className={
                    isStarred
                      ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                      : ""
                  }
                >
                  <Star
                    className={`h-4 w-4 mr-1 ${
                      isStarred ? "fill-current" : ""
                    }`}
                  />
                  {isStarred ? "Starred" : "Star"}
                </Button>
              )}

              <Button variant="outline" size="sm">
                <GitFork className="h-4 w-4 mr-1" />
                Fork
              </Button>

              {isOwner && (
                <Button
                  onClick={() => router.push(`/hub/${hubId}/edit`)}
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8" role="tablist">
            {[
              {
                id: "files",
                label: "Files",
                icon: FileText,
                count: files.length,
              },
              {
                id: "history",
                label: "History",
                icon: History,
                count: history.length,
              },
              {
                id: "collaborators",
                label: "Collaborators",
                icon: Users,
                count: collaborators.length,
              },
              ...(isOwner
                ? [
                    {
                      id: "settings" as const,
                      label: "Settings",
                      icon: Settings,
                    },
                  ]
                : []),
            ].map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === (id as TabType)
                    ? "border-orange-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {count !== undefined && (
                  <span className="bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full text-xs">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "files" && (
          <div className="bg-white rounded-lg border">
            {/* Files Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{files.length} files</span>
              </div>
              {isOwner && (
                <Button
                  onClick={() => router.push(`/upload?hubId=${hubId}`)}
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload files
                </Button>
              )}
            </div>

            {/* Files List */}
            {files.length === 0 ? (
              <div className="text-center py-12">
                <FileIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No files yet
                </h3>
                <p className="text-gray-500 mb-4">
                  {isOwner
                    ? "Upload your first file to get started"
                    : "This hub doesn't have any files yet"}
                </p>
                {isOwner && (
                  <Button onClick={() => router.push(`/upload?hubId=${hubId}`)}>
                    <Upload className="h-4 w-4 mr-1" />
                    Upload files
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {file.fileName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {(file.fileSize / 1024).toFixed(1)} KB • Updated{" "}
                            {new Date(file.uploadedAt).toLocaleDateString()} by{" "}
                            {file.uploaderName || "User"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Activity Timeline</span>
              </div>
            </div>

            <div className="p-6">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No activity history available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {history.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            activity.type === "hub_created"
                              ? "bg-green-500"
                              : activity.type === "hub_updated"
                              ? "bg-blue-500"
                              : activity.type === "file_uploaded"
                              ? "bg-purple-500"
                              : activity.type === "file_deleted"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}
                        />
                        {history.indexOf(activity) < history.length - 1 && (
                          <div className="w-0.5 h-6 bg-gray-200 mt-2" />
                        )}
                      </div>

                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.message}
                          </p>
                          <time className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </time>
                        </div>
                        <p className="text-sm text-gray-500">
                          by {activity.userName || "User"}
                        </p>
                        {activity.metadata && activity.metadata.fileName && (
                          <p className="text-xs text-gray-400 mt-1">
                            File: {activity.metadata.fileName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "collaborators" && (
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">
                    {collaborators.length} collaborators
                  </span>
                </div>
                {isOwner && (
                  <Button size="sm">
                    <User className="h-4 w-4 mr-1" />
                    Invite collaborators
                  </Button>
                )}
              </div>
            </div>

            <div className="divide-y">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {collaborator.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {collaborator.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        collaborator.role === "owner" ? "primary" : "secondary"
                      }
                    >
                      {collaborator.role}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && isOwner && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Hub Settings</h2>
              <div className="space-y-4">
                <Button
                  onClick={() => router.push(`/hub/${hubId}/edit`)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit hub details
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage collaborators
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced settings
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-red-200">
              <h2 className="text-lg font-semibold mb-4 text-red-600">
                Danger Zone
              </h2>
              <div className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-900 mb-2">
                    Delete this hub
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once deleted, all files and data will be permanently
                    removed.
                  </p>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Delete hub
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
