"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { apiService } from "@/lib/api-service";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, Star, Eye, Calendar, User, Grid, List } from "lucide-react";
import Link from "next/link";

interface Hub {
  id: string;
  title: string;
  description: string;
  tags: string[];
  ownerId: string;
  visibility: "public" | "private";
  previewImage: string;
  stars: number;
  starredBy: string[];
  createdAt: string;
  updatedAt: string;
}

interface UserType {
  id: string;
  name: string;
  avatarURL: string;
  institution: string;
}

export default function ExplorePage() {
  const { user } = useAuth();
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [activeTab, setActiveTab] = useState<"hubs" | "users">("hubs");

  const popularTags = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Engineering",
    "Biology",
    "Data Science",
    "AI/ML",
    "Web Development",
    "Mobile App",
  ];

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedTags, sortBy, activeTab]);

  const loadContent = async () => {
    try {
      setLoading(true);

      if (activeTab === "hubs") {
        const response = await apiService.getHubs({
          search: searchQuery || undefined,
          tags: selectedTags.length > 0 ? selectedTags.join(",") : undefined,
          limit: 20,
        });

        if (response.success && response.data) {
          let hubsData = response.data as Hub[];

          // Sort hubs
          if (sortBy === "popular") {
            hubsData = hubsData.sort((a, b) => (b.stars || 0) - (a.stars || 0));
          } else {
            hubsData = hubsData.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
          }

          setHubs(hubsData);
        }
      } else {
        const response = await apiService.search(
          searchQuery || "a",
          "users",
          20
        );
        if (response.success && response.data) {
          setUsers((response.data as Record<string, UserType[]>).users || []);
        }
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleStarHub = async (hubId: string) => {
    if (!user) return;

    try {
      await apiService.starHub(hubId);
      // Refresh hubs to get updated star counts
      loadContent();
    } catch (error) {
      console.error("Error starring hub:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Explore ByteHub
          </h1>
          <p className="text-text-secondary">
            Discover amazing study materials and connect with learners worldwide
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hubs, users, or topics..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "hubs" ? "primary" : "outline"}
                onClick={() => setActiveTab("hubs")}
              >
                Study Hubs
              </Button>
              <Button
                variant={activeTab === "users" ? "primary" : "outline"}
                onClick={() => setActiveTab("users")}
              >
                Users
              </Button>
            </div>
          </div>

          {activeTab === "hubs" && (
            <>
              {/* Popular Tags */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        selectedTags.includes(tag) ? "primary" : "secondary"
                      }
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* View Controls */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === "recent" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("recent")}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Recent
                  </Button>
                  <Button
                    variant={sortBy === "popular" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("popular")}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Popular
                  </Button>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "grid" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-text-secondary">Loading...</p>
          </div>
        ) : (
          <div>
            {activeTab === "hubs" ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {hubs.map((hub) => (
                  <Card
                    key={hub.id}
                    className={`p-6 hover:shadow-lg transition-shadow ${
                      viewMode === "list" ? "flex gap-4" : ""
                    }`}
                  >
                    {viewMode === "list" && (
                      <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Eye className="h-8 w-8 text-primary" />
                      </div>
                    )}

                    <div className="flex-1">
                      {viewMode === "grid" && (
                        <div className="h-32 bg-primary/10 rounded-lg mb-4 flex items-center justify-center">
                          <Eye className="h-12 w-12 text-primary" />
                        </div>
                      )}

                      <Link href={`/hub/${hub.id}`} className="block">
                        <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                          {hub.title}
                        </h3>
                      </Link>

                      <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                        {hub.description}
                      </p>

                      {hub.tags && hub.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {hub.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {hub.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{hub.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <User className="h-3 w-3" />
                          <span>Owner • {formatDate(hub.createdAt)}</span>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStarHub(hub.id)}
                          disabled={!user}
                          className="flex items-center gap-1"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              user && hub.starredBy?.includes(user.uid)
                                ? "fill-yellow-400 text-yellow-400"
                                : ""
                            }`}
                          />
                          <span>{hub.stars || 0}</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((userItem) => (
                  <Card
                    key={userItem.id}
                    className="p-6 text-center hover:shadow-lg transition-shadow"
                  >
                    <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <Link href={`/profile/${userItem.id}`}>
                      <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                        {userItem.name}
                      </h3>
                    </Link>
                    <p className="text-text-secondary text-sm mb-3">
                      {userItem.institution || "ByteHub Member"}
                    </p>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Card>
                ))}
              </div>
            )}

            {((activeTab === "hubs" && hubs.length === 0) ||
              (activeTab === "users" && users.length === 0)) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-text-secondary">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
