"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { apiService } from "@/lib/api-service";
import Link from "next/link";
import {
  BookOpen,
  Star,
  Users,
  GitBranch,
  Calendar,
  Plus,
  Search,
  MoreHorizontal,
  Clock,
  MessageSquare,
  Eye,
} from "lucide-react";

interface StudyHub {
  id: string;
  title: string;
  description: string;
  tags: string[];
  ownerId: string;
  visibility: "public" | "private";
  previewImage: string;
  files: unknown[];
  stars: number;
  starredBy: string[];
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  type: "created" | "starred" | "updated" | "commented";
  title: string;
  repository: string;
  time: string;
}

interface UserStats {
  totalHubs: number;
  publicHubs: number;
  privateHubs: number;
  totalStars: number;
  followers: number;
  following: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [studyHubs, setStudyHubs] = useState<StudyHub[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<UserStats>({
    totalHubs: 0,
    publicHubs: 0,
    privateHubs: 0,
    totalStars: 0,
    followers: 0,
    following: 0,
  });

  // Fetch user's hubs
  const fetchUserHubs = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getHubs({
        userId: user.uid,
        limit: 50,
      });

      if (response.success && response.data) {
        const hubsData = response.data as StudyHub[];
        setStudyHubs(hubsData);

        // Calculate stats
        const publicHubs = hubsData.filter(
          (h) => h.visibility === "public"
        ).length;
        const privateHubs = hubsData.filter(
          (h) => h.visibility === "private"
        ).length;
        const totalStars = hubsData.reduce((sum, h) => sum + (h.stars || 0), 0);

        setStats((prev) => ({
          ...prev,
          totalHubs: hubsData.length,
          publicHubs,
          privateHubs,
          totalStars,
        }));
      } else {
        setError(response.message || "Failed to fetch hubs");
      }
    } catch (err) {
      console.error("Error fetching user hubs:", err);
      setError("Failed to load your study hubs");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Fetch user stats (followers/following)
  const fetchUserStats = useCallback(async () => {
    if (!user?.uid) return;

    try {
      // Fetch followers
      const followersResponse = await apiService.getFollows(
        user.uid,
        "followers"
      );
      const followingResponse = await apiService.getFollows(
        user.uid,
        "following"
      );

      if (followersResponse.success && followingResponse.success) {
        setStats((prev) => ({
          ...prev,
          followers: Array.isArray(followersResponse.data)
            ? followersResponse.data.length
            : 0,
          following: Array.isArray(followingResponse.data)
            ? followingResponse.data.length
            : 0,
        }));
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  }, [user?.uid]);

  // Generate mock activity based on real hubs
  const generateActivity = useCallback((hubs: StudyHub[]) => {
    const activities: Activity[] = [];

    hubs.forEach((hub, index) => {
      // Add creation activity
      activities.push({
        id: `create_${hub.id}`,
        type: "created",
        title: "Created new study hub",
        repository: hub.title,
        time: formatRelativeTime(hub.createdAt),
      });

      // Add update activity if different from creation
      if (hub.updatedAt !== hub.createdAt) {
        activities.push({
          id: `update_${hub.id}`,
          type: "updated",
          title: "Updated study hub",
          repository: hub.title,
          time: formatRelativeTime(hub.updatedAt),
        });
      }

      // Add star activities for hubs with stars
      if (hub.stars > 0 && index < 3) {
        activities.push({
          id: `star_${hub.id}`,
          type: "starred",
          title: "Received stars",
          repository: hub.title,
          time: formatRelativeTime(hub.updatedAt),
        });
      }
    });

    // Sort by time (most recent first) and take top 8
    return activities
      .sort(
        (a, b) =>
          new Date(b.time.includes("ago") ? Date.now() : b.time).getTime() -
          new Date(a.time.includes("ago") ? Date.now() : a.time).getTime()
      )
      .slice(0, 8);
  }, []);

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchUserHubs();
    fetchUserStats();
  }, [fetchUserHubs, fetchUserStats]);

  useEffect(() => {
    if (studyHubs.length > 0) {
      setRecentActivity(generateActivity(studyHubs));
    }
  }, [studyHubs, generateActivity]);

  const filteredHubs = studyHubs.filter((hub) => {
    const matchesFilter = filter === "all" || hub.visibility === filter;
    const matchesSearch =
      hub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hub.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hub.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "created":
        return <Plus className="w-4 h-4 text-green-500" />;
      case "starred":
        return <Star className="w-4 h-4 text-yellow-500" />;
      case "updated":
        return <GitBranch className="w-4 h-4 text-blue-500" />;
      case "commented":
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPrimaryTag = (tags: string[]) => {
    if (!tags || tags.length === 0) return "Study Material";
    return tags[0];
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      "Computer Science": "bg-blue-500",
      Mathematics: "bg-green-500",
      Physics: "bg-purple-500",
      Chemistry: "bg-red-500",
      Engineering: "bg-orange-500",
      Biology: "bg-teal-500",
      "Data Science": "bg-indigo-500",
      "AI/ML": "bg-pink-500",
      "Web Development": "bg-yellow-500",
      "Mobile App": "bg-cyan-500",
    };
    return colors[tag] || "bg-gray-500";
  };

  const handleCreateHub = () => {
    // Navigate to create hub page
    window.location.href = "/upload";
  };

  const handleViewHub = (hubId: string) => {
    window.location.href = `/hub/${hubId}`;
  };

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
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-6 mb-8">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchUserHubs} variant="outline">
                  Try Again
                </Button>
              </div>
            </Card>
          )}

          {/* Header */}
          {!loading && !error && (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Sidebar - Profile */}
              <div className="lg:w-80 space-y-6">
                {/* Profile Card */}
                <Card className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full border-4 border-primary/20 mb-4 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                      {user?.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <h1 className="text-xl font-bold text-foreground mb-1">
                      {user?.displayName || "ByteHub User"}
                    </h1>
                    <p className="text-sm text-muted-foreground mb-4">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {stats.followers} followers
                      </span>
                      <span className="flex items-center gap-1">
                        {stats.following} following
                      </span>
                    </div>
                    <Button className="w-full" onClick={handleCreateHub}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Study Hub
                    </Button>
                  </div>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {stats.totalHubs}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Study Hubs
                    </div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-accent mb-1">
                      {stats.totalStars}
                    </div>
                    <div className="text-sm text-muted-foreground">Stars</div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-foreground">{activity.title}</p>
                          <p className="text-muted-foreground text-xs">
                            {activity.repository}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Main Content */}
              <div className="flex-1 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {stats.publicHubs}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Public Repositories
                        </div>
                      </div>
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {stats.totalStars}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Stars
                        </div>
                      </div>
                      <Star className="w-8 h-8 text-accent" />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {stats.followers}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Followers
                        </div>
                      </div>
                      <Users className="w-8 h-8 text-secondary" />
                    </div>
                  </Card>
                </div>

                {/* Study Hubs Section */}
                <Card className="p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      My Study Hubs ({filteredHubs.length})
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search repositories..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <select
                        value={filter}
                        onChange={(e) =>
                          setFilter(e.target.value as typeof filter)
                        }
                        className="px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                      <Button onClick={handleCreateHub}>
                        <Plus className="w-4 h-4 mr-2" />
                        New
                      </Button>
                    </div>
                  </div>

                  {/* Study Hubs Grid */}
                  <div className="space-y-4">
                    {filteredHubs.map((hub) => (
                      <div
                        key={hub.id}
                        className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => handleViewHub(hub.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-primary hover:text-primary/80">
                                {hub.title}
                              </h3>
                              <Badge
                                variant={
                                  hub.visibility === "public"
                                    ? "primary"
                                    : "secondary"
                                }
                              >
                                {hub.visibility}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-3 line-clamp-2">
                              {hub.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {hub.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <div
                                    className={`w-3 h-3 rounded-full ${getTagColor(
                                      getPrimaryTag(hub.tags)
                                    )}`}
                                  />
                                  {getPrimaryTag(hub.tags)}
                                </div>
                              )}
                              {hub.stars > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4" />
                                  {hub.stars}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Updated{" "}
                                {new Date(hub.updatedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
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
                          </div>
                          <div
                            className="flex items-center gap-2 ml-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link href={`/hub/${hub.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/hub/${hub.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredHubs.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No study hubs found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery
                          ? "Try adjusting your search terms."
                          : "Create your first study hub to get started!"}
                      </p>
                      <Button onClick={handleCreateHub}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Study Hub
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard;
