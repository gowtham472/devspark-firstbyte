"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui";

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
}

export default function HubPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const hubId = params.hubId as string;

  const [hub, setHub] = useState<HubData | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hubId) return;

    fetchHubData();
  }, [hubId]);

  const fetchHubData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hub details
      const hubResponse = await fetch(`/api/hubs/${hubId}`);
      const hubResult = await hubResponse.json();

      if (!hubResult.success) {
        setError(hubResult.message || "Failed to fetch hub");
        return;
      }

      setHub(hubResult.data);

      // Fetch hub files
      const filesResponse = await fetch(`/api/files?hubId=${hubId}`);
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hub Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {hub.title}
              </h1>
              <p className="text-gray-600 mb-4">{hub.description}</p>

              {/* Tags */}
              {hub.tags && hub.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {hub.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Hub Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>⭐ {hub.stars} stars</span>
                <span>📁 {files.length} files</span>
                <span>👁️ {hub.visibility}</span>
                <span>📅 {new Date(hub.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Hub Actions */}
            <div className="flex items-center gap-3">
              {user && !isOwner && (
                <button
                  onClick={handleStarHub}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    isStarred
                      ? "bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {isStarred ? "⭐ Starred" : "☆ Star"}
                </button>
              )}

              {isOwner && (
                <button
                  onClick={() => router.push(`/hub/${hubId}/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Hub
                </button>
              )}
            </div>
          </div>

          {/* Preview Image */}
          {hub.previewImage && (
            <div className="mt-4">
              <img
                src={hub.previewImage}
                alt={hub.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Files Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Files</h2>
            {isOwner && (
              <button
                onClick={() => router.push(`/upload?hubId=${hubId}`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Upload File
              </button>
            )}
          </div>

          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No files uploaded yet.</p>
              {isOwner && (
                <button
                  onClick={() => router.push(`/upload?hubId=${hubId}`)}
                  className="mt-2 text-blue-600 hover:text-blue-700"
                >
                  Upload the first file
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {file.fileType?.slice(0, 3).toUpperCase() || "FILE"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {file.fileName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {(file.fileSize / 1024).toFixed(1)} KB •{" "}
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Download
                    </a>
                    <a
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
