"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { apiService } from "@/lib/api-service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Upload, X, File, Plus, Globe, Lock } from "lucide-react";

interface HubFormData {
  title: string;
  description: string;
  tags: string[];
  visibility: "public" | "private";
  previewImage: string;
}

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<HubFormData>({
    title: "",
    description: "",
    tags: [],
    visibility: "public",
    previewImage: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title || !formData.description) return;

    setIsUploading(true);

    try {
      // Create hub first
      const hubResponse = await apiService.createHub(formData);

      if (!hubResponse.success || !hubResponse.data) {
        throw new Error(hubResponse.error || "Failed to create hub");
      }

      const hubId = (hubResponse.data as { id: string }).id;

      // Upload files if any
      if (files.length > 0) {
        const uploadPromises = files.map((file) =>
          apiService.uploadFile(file, hubId)
        );

        await Promise.all(uploadPromises);
      }

      router.push(`/hub/${hubId}`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to create hub. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    router.push("/auth");
    return null;
  }

  return (
    <ProtectedRoute>
      <Layout
        user={
          user
            ? {
                name: user.displayName || "User",
                username: user.email?.split("@")[0] || "user",
                avatar: user.photoURL || undefined,
              }
            : null
        }
      >
        <div className="container mx-auto px-4 max-w-4xl py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Create Study Hub
            </h1>
            <p className="text-text-secondary">
              Share your knowledge with the ByteHub community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Hub Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Hub Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Hub Title *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Data Structures & Algorithms"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what this hub contains..."
                    rows={4}
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
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
                          className="ml-1 text-xs hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Visibility
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          visibility: "public",
                        }))
                      }
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
                        formData.visibility === "public"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-surface"
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          visibility: "private",
                        }))
                      }
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
                        formData.visibility === "private"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-surface"
                      }`}
                    >
                      <Lock className="h-4 w-4" />
                      Private
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* File Upload */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Files (Optional)</h2>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-text-secondary" />
                <p className="text-lg mb-2">Drag & drop files here</p>
                <p className="text-text-secondary mb-4">or click to browse</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.txt,.md"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">
                    Selected Files ({files.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-surface rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-text-secondary" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-text-secondary">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={
                  isUploading || !formData.title || !formData.description
                }
                className="flex-1"
              >
                {isUploading ? "Creating Hub..." : "Create Hub"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
