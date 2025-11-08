"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button, Input, Badge } from "@/components/ui";
import {
  ArrowLeft,
  Settings,
  FileText,
  History,
  Users,
  Star,
  Eye,
  EyeOff,
  Save,
  X,
  Plus,
  Globe,
  Lock,
  Upload,
  Download,
  Trash2,
  Calendar,
  User,
  FileIcon,
} from "lucide-react";

interface HubData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  ownerId: string;
  ownerName?: string;
  visibility: "public" | "private";
  previewImage: string;
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
  version: number;
  versions?: FileVersion[];
}

interface FileVersion {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  uploaderName?: string;
  changeNote?: string;
}

type TabType = "overview" | "files" | "settings" | "history";

export default function HubEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const hubId = params.hubId as string;

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [hub, setHub] = useState<HubData | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    visibility: "public" as "public" | "private",
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!hubId || !user) return;
    fetchHubData();
  }, [hubId, user]);

  const fetchHubData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [hubResponse, filesResponse] = await Promise.all([
        fetch(`/api/hubs/${hubId}`),
        fetch(`/api/files?hubId=${hubId}`),
      ]);

      const hubResult = await hubResponse.json();
      if (!hubResult.success) {
        setError(hubResult.message || "Failed to fetch hub");
        return;
      }

      const hubData = hubResult.data as HubData;

      // Check if user is the owner
      if (hubData.ownerId !== user?.uid) {
        setError("You are not authorized to edit this hub");
        return;
      }

      setHub(hubData);
      setFormData({
        title: hubData.title,
        description: hubData.description,
        tags: hubData.tags || [],
        visibility: hubData.visibility,
      });

      const filesResult = await filesResponse.json();
      if (filesResult.success) {
        setFiles(filesResult.data || []);
      }
    } catch (error) {
      console.error("Error fetching hub data:", error);
      setError("An error occurred while loading the hub");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hub) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/hubs/${hubId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setHub((prev) => (prev ? { ...prev, ...formData } : null));
        alert("Hub updated successfully!");
      } else {
        alert(result.message || "Failed to update hub");
      }
    } catch (error) {
      console.error("Error updating hub:", error);
      alert("Error updating hub");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Hub Not Found"}
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
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
              <button
                onClick={() => router.push(`/hub/${hubId}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Hub
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {hub.title}
                </h1>
                <p className="text-gray-600">Hub Settings & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: Settings },
              { id: "files", label: "Files", icon: FileText },
              { id: "history", label: "Version History", icon: History },
              { id: "settings", label: "Settings", icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Hub Title
                    </label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter hub title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your hub"
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add tags..."
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Visibility Settings
                </h2>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, visibility: "public" }))
                    }
                    className={`w-full flex items-center gap-3 p-4 border rounded-lg text-left ${
                      formData.visibility === "public"
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Globe className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Public</div>
                      <div className="text-sm text-gray-600">
                        Anyone can view this hub
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        visibility: "private",
                      }))
                    }
                    className={`w-full flex items-center gap-3 p-4 border rounded-lg text-left ${
                      formData.visibility === "private"
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Lock className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Private</div>
                      <div className="text-sm text-gray-600">
                        Only you can view this hub
                      </div>
                    </div>
                  </button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Hub Statistics</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Files</span>
                    <span className="font-medium">{files.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Stars</span>
                    <span className="font-medium">{hub.stars}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium">
                      {formatDate(hub.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Updated</span>
                    <span className="font-medium">
                      {formatDate(hub.updatedAt)}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push(`/upload?hubId=${hubId}`)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                  <Button
                    onClick={() => router.push(`/hub/${hubId}`)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Hub
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Files Management</h2>
              <Button onClick={() => router.push(`/upload?hubId=${hubId}`)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No files uploaded yet</p>
                <Button
                  onClick={() => router.push(`/upload?hubId=${hubId}`)}
                  className="mt-4"
                >
                  Upload First File
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {file.fileName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.fileSize)} •{" "}
                          {formatDate(file.uploadedAt)}
                          {file.uploaderName && ` • by ${file.uploaderName}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === "history" && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Version History</h2>
            <div className="space-y-4">
              {/* Mock version history - you can replace with actual data */}
              <div className="border-l-2 border-gray-200 pl-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full -ml-6 mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Hub updated</h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(hub.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Updated hub description and tags
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{user?.displayName || "You"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full -ml-6 mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Hub created</h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(hub.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Initial hub creation
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{user?.displayName || "You"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-red-600">
                Danger Zone
              </h2>
              <div className="border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">
                  Delete this hub
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete a hub, there is no going back. This will
                  permanently delete the hub and all its files.
                </p>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete Hub
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
