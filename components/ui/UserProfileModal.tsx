import React, { useEffect, useState } from "react";
import {
  X,
  User,
  MapPin,
  Calendar,
  Star,
  Users,
  ExternalLink,
} from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  institution?: string;
  avatarURL?: string;
  joinedAt?: string;
  totalHubs?: number;
  totalStars?: number;
}

interface Hub {
  id: string;
  title: string;
  description: string;
  tags: string[];
  stars: number;
  visibility: "public" | "private";
}

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  isOpen,
  onClose,
  currentUserId,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userHubs, setUserHubs] = useState<Hub[]>([]);
  const [commonHubs, setCommonHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData();
    }
  }, [isOpen, userId]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock user profile data (replace with actual API call)
      const mockProfile: UserProfile = {
        id: userId,
        name: getUserName(userId),
        bio: getUserBio(userId),
        institution: getUserInstitution(userId),
        joinedAt: "2024-01-15",
        totalHubs: Math.floor(Math.random() * 10) + 1,
        totalStars: Math.floor(Math.random() * 50) + 5,
      };

      // Mock user's hubs
      const mockUserHubs: Hub[] = generateMockHubs(userId, 3);

      // Mock common hubs if current user is provided
      const mockCommonHubs: Hub[] =
        currentUserId && currentUserId !== userId
          ? generateMockCommonHubs(2)
          : [];

      setProfile(mockProfile);
      setUserHubs(mockUserHubs);
      setCommonHubs(mockCommonHubs);
    } catch (err) {
      setError("Failed to load user profile");
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (id: string): string => {
    const names = [
      "Alex Johnson",
      "Sarah Chen",
      "Michael Rodriguez",
      "Emma Thompson",
      "David Kim",
    ];
    return (
      names[parseInt(id.charAt(0) || "0") % names.length] || "Unknown User"
    );
  };

  const getUserBio = (id: string): string => {
    const bios = [
      "Computer Science student passionate about algorithms and data structures",
      "Frontend developer with expertise in React and modern web technologies",
      "Machine Learning researcher focusing on computer vision applications",
      "Full-stack developer building innovative educational platforms",
      "Data scientist exploring the intersection of AI and education",
    ];
    return bios[parseInt(id.charAt(1) || "0") % bios.length] || "";
  };

  const getUserInstitution = (id: string): string => {
    const institutions = [
      "MIT",
      "Stanford University",
      "UC Berkeley",
      "Harvard University",
      "CMU",
    ];
    return (
      institutions[parseInt(id.charAt(2) || "0") % institutions.length] ||
      "ByteHub Member"
    );
  };

  const generateMockHubs = (ownerId: string, count: number): Hub[] => {
    const hubTitles = [
      "Advanced Algorithms Study Guide",
      "React Development Patterns",
      "Machine Learning Fundamentals",
      "Database Design Principles",
      "Web Security Best Practices",
      "Data Structures Reference",
      "JavaScript ES6+ Features",
      "Python for Data Science",
    ];

    const tags = [
      ["Computer Science", "Algorithms"],
      ["React", "JavaScript", "Frontend"],
      ["Machine Learning", "Python", "AI"],
      ["Database", "SQL", "Design"],
      ["Security", "Web Development"],
      ["Data Structures", "Programming"],
      ["JavaScript", "ES6", "Programming"],
      ["Python", "Data Science", "Analytics"],
    ];

    return Array.from({ length: count }, (_, index) => ({
      id: `hub_${ownerId}_${index}`,
      title: hubTitles[index % hubTitles.length],
      description: `A comprehensive study resource for ${hubTitles[
        index % hubTitles.length
      ].toLowerCase()}`,
      tags: tags[index % tags.length],
      stars: Math.floor(Math.random() * 30) + 5,
      visibility: "public" as const,
    }));
  };

  const generateMockCommonHubs = (count: number): Hub[] => {
    const commonHubTitles = [
      "Shared CS Fundamentals",
      "Open Source Projects Hub",
    ];

    return Array.from({ length: count }, (_, index) => ({
      id: `common_hub_${index}`,
      title: commonHubTitles[index % commonHubTitles.length],
      description: `A hub you both contribute to: ${
        commonHubTitles[index % commonHubTitles.length]
      }`,
      tags: ["Computer Science", "Collaboration"],
      stars: Math.floor(Math.random() * 50) + 10,
      visibility: "public" as const,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={fetchUserData}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {profile.name}
                  </h3>
                  {profile.bio && (
                    <p className="text-gray-600 mt-1">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    {profile.institution && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.institution}</span>
                      </div>
                    )}
                    {profile.joinedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {formatDate(profile.joinedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Link href={`/profile/${userId}`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.totalHubs}
                  </div>
                  <div className="text-sm text-gray-600">Study Hubs</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {profile.totalStars}
                  </div>
                  <div className="text-sm text-gray-600">Total Stars</div>
                </Card>
              </div>

              {/* Common Hubs */}
              {commonHubs.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Hubs in Common ({commonHubs.length})
                  </h4>
                  <div className="space-y-3">
                    {commonHubs.map((hub) => (
                      <Card key={hub.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Link href={`/hub/${hub.id}`}>
                              <h5 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                {hub.title}
                              </h5>
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">
                              {hub.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex flex-wrap gap-1">
                                {hub.tags.slice(0, 2).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Star className="h-3 w-3" />
                                <span>{hub.stars}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* User's Hubs */}
              <div>
                <h4 className="text-lg font-semibold mb-3">
                  Recent Study Hubs
                </h4>
                <div className="space-y-3">
                  {userHubs.map((hub) => (
                    <Card key={hub.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link href={`/hub/${hub.id}`}>
                            <h5 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {hub.title}
                            </h5>
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            {hub.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex flex-wrap gap-1">
                              {hub.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Star className="h-3 w-3" />
                              <span>{hub.stars}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
