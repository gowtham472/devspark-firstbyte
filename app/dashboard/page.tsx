"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
} from "lucide-react";

interface StudyHub {
  id: string;
  title: string;
  description: string;
  language: string;
  stars: number;
  visibility: "public" | "private";
  updatedAt: Date;
  tags: string[];
}

interface Activity {
  id: string;
  type: "created" | "starred" | "updated" | "commented";
  title: string;
  repository: string;
  time: string;
}

// Mock data - replace with actual API calls
const mockHubs: StudyHub[] = [
  {
    id: "1",
    title: "Data Structures & Algorithms",
    description:
      "Complete notes and implementations for DSA concepts including trees, graphs, and dynamic programming.",
    language: "Python",
    stars: 45,
    visibility: "public",
    updatedAt: new Date("2024-11-07"),
    tags: ["algorithms", "python", "computer-science"],
  },
  {
    id: "2",
    title: "Machine Learning Fundamentals",
    description:
      "Comprehensive study materials for ML basics, linear algebra, and practical implementations.",
    language: "Jupyter",
    stars: 32,
    visibility: "public",
    updatedAt: new Date("2024-11-06"),
    tags: ["machine-learning", "ai", "mathematics"],
  },
  {
    id: "3",
    title: "Personal Study Notes",
    description:
      "Private collection of various course materials and exam preparation notes.",
    language: "Markdown",
    stars: 0,
    visibility: "private",
    updatedAt: new Date("2024-11-05"),
    tags: ["personal", "exams", "notes"],
  },
];

const mockActivity: Activity[] = [
  {
    id: "1",
    type: "updated",
    title: "Added graph algorithms section",
    repository: "Data Structures & Algorithms",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "starred",
    title: "Starred repository",
    repository: "Advanced React Patterns",
    time: "5 hours ago",
  },
  {
    id: "3",
    type: "created",
    title: "Created new repository",
    repository: "Machine Learning Fundamentals",
    time: "1 day ago",
  },
  {
    id: "4",
    type: "commented",
    title: "Commented on discussion",
    repository: "Open Source Contributions",
    time: "2 days ago",
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [studyHubs] = useState<StudyHub[]>(mockHubs);
  const [recentActivity] = useState<Activity[]>(mockActivity);
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const stats = {
    totalHubs: studyHubs.length,
    publicHubs: studyHubs.filter((h) => h.visibility === "public").length,
    totalStars: studyHubs.reduce((sum, h) => sum + h.stars, 0),
    followers: 28,
    following: 42,
  };

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

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      Python: "bg-blue-500",
      JavaScript: "bg-yellow-500",
      TypeScript: "bg-blue-600",
      Java: "bg-orange-500",
      "C++": "bg-pink-500",
      Jupyter: "bg-orange-400",
      Markdown: "bg-gray-500",
    };
    return colors[language] || "bg-gray-400";
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
          {/* Header */}
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
                  <Button className="w-full">
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
                    <Button>
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
                      className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-primary hover:text-primary/80 cursor-pointer">
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
                            <div className="flex items-center gap-1">
                              <div
                                className={`w-3 h-3 rounded-full ${getLanguageColor(
                                  hub.language
                                )}`}
                              />
                              {hub.language}
                            </div>
                            {hub.stars > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                {hub.stars}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Updated {hub.updatedAt.toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {hub.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Star className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
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
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Study Hub
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard;
