"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api-service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Layout } from "@/components/layout/Layout";
import {
  User,
  Mail,
  Shield,
  Palette,
  Bell,
  Lock,
  Globe,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon,
} from "lucide-react";

interface UserSettings {
  profileVisibility: "public" | "private";
  emailNotifications: boolean;
  hubNotifications: boolean;
  followNotifications: boolean;
  theme: "light" | "dark" | "system";
  showEmail: boolean;
  showInstitution: boolean;
  emailVerified: boolean;
}

interface ProfileData {
  name: string;
  bio: string;
  institution: string;
  website: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

interface UserData extends ProfileData {
  profileVisibility: "public" | "private";
  emailNotifications: boolean;
  hubNotifications: boolean;
  followNotifications: boolean;
  theme: "light" | "dark" | "system";
  showEmail: boolean;
  showInstitution: boolean;
  emailVerified: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    profileVisibility: "public",
    emailNotifications: true,
    hubNotifications: true,
    followNotifications: true,
    theme: "light",
    showEmail: false,
    showInstitution: true,
    emailVerified: false,
  });
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    institution: "",
    website: "",
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      const result = await apiService.getUser(user.uid);
      if (result.success && result.data) {
        const userData = result.data as UserData;

        setProfileData({
          name: userData.name || "",
          bio: userData.bio || "",
          institution: userData.institution || "",
          website: userData.website || "",
          socialLinks: userData.socialLinks || {
            github: "",
            linkedin: "",
            twitter: "",
          },
        });
        setSettings((prev) => ({
          ...prev,
          profileVisibility: userData.profileVisibility || "public",
          emailNotifications: userData.emailNotifications !== false,
          hubNotifications: userData.hubNotifications !== false,
          followNotifications: userData.followNotifications !== false,
          theme: userData.theme || "light",
          showEmail: userData.showEmail || false,
          showInstitution: userData.showInstitution !== false,
          emailVerified: userData.emailVerified || false,
        }));
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (settings.theme === "light") {
      root.removeAttribute("data-theme");
    } else {
      // System theme
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
    }
  }, [settings.theme]);

  const handleProfileUpdate = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const result = await apiService.updateProfile(user.uid, {
        ...profileData,
        ...settings,
      });

      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update profile",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "An error occurred while updating profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmailVerification = async () => {
    try {
      const result = await apiService.sendEmailVerification();
      if (result.success) {
        setEmailVerificationSent(true);
        setMessage({
          type: "success",
          text: "Verification email sent! Check your inbox.",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to send verification email",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send verification email" });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            </div>
            <p className="text-text-secondary">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Profile Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Display Name
                    </label>
                    <Input
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Institution
                    </label>
                    <Input
                      value={profileData.institution}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          institution: e.target.value,
                        }))
                      }
                      placeholder="Your school or university"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      placeholder="Tell others about yourself..."
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Website
                    </label>
                    <Input
                      value={profileData.website}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    Social Links
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        GitHub
                      </label>
                      <Input
                        value={profileData.socialLinks.github}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              github: e.target.value,
                            },
                          }))
                        }
                        placeholder="github.com/username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        LinkedIn
                      </label>
                      <Input
                        value={profileData.socialLinks.linkedin}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              linkedin: e.target.value,
                            },
                          }))
                        }
                        placeholder="linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Twitter
                      </label>
                      <Input
                        value={profileData.socialLinks.twitter}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              twitter: e.target.value,
                            },
                          }))
                        }
                        placeholder="twitter.com/username"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Privacy Settings */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Privacy Settings
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Profile Visibility
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Control who can see your profile and activities
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={
                          settings.profileVisibility === "public"
                            ? "primary"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            profileVisibility: "public",
                          }))
                        }
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Public
                      </Button>
                      <Button
                        variant={
                          settings.profileVisibility === "private"
                            ? "primary"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            profileVisibility: "private",
                          }))
                        }
                      >
                        <Lock className="w-4 h-4 mr-1" />
                        Private
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Show Email Address
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Display your email address on your public profile
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          showEmail: !prev.showEmail,
                        }))
                      }
                    >
                      {settings.showEmail ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Show Institution
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Display your institution on your public profile
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          showInstitution: !prev.showInstitution,
                        }))
                      }
                    >
                      {settings.showInstitution ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Notification Settings */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Notification Preferences
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Receive email updates about your account
                      </p>
                    </div>
                    <Button
                      variant={
                        settings.emailNotifications ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          emailNotifications: !prev.emailNotifications,
                        }))
                      }
                    >
                      {settings.emailNotifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Hub Activity
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Get notified when someone stars or comments on your hubs
                      </p>
                    </div>
                    <Button
                      variant={
                        settings.hubNotifications ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          hubNotifications: !prev.hubNotifications,
                        }))
                      }
                    >
                      {settings.hubNotifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Follow Notifications
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Get notified when someone follows you
                      </p>
                    </div>
                    <Button
                      variant={
                        settings.followNotifications ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          followNotifications: !prev.followNotifications,
                        }))
                      }
                    >
                      {settings.followNotifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Theme Settings */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Theme Preferences
                  </h2>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant={settings.theme === "light" ? "primary" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, theme: "light" }))
                    }
                  >
                    Light
                  </Button>
                  <Button
                    variant={settings.theme === "dark" ? "primary" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, theme: "dark" }))
                    }
                  >
                    Dark
                  </Button>
                  <Button
                    variant={
                      settings.theme === "system" ? "primary" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, theme: "system" }))
                    }
                  >
                    System
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Status */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Account Status
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      Email Status
                    </span>
                    <Badge
                      variant={settings.emailVerified ? "success" : "warning"}
                    >
                      {settings.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>

                  {!settings.emailVerified && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800 mb-2">
                        Your email address is not verified. Please verify your
                        email to access all features.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSendEmailVerification}
                        disabled={emailVerificationSent}
                      >
                        {emailVerificationSent
                          ? "Email Sent"
                          : "Send Verification Email"}
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Profile</span>
                    <Badge
                      variant={
                        settings.profileVisibility === "public"
                          ? "primary"
                          : "secondary"
                      }
                    >
                      {settings.profileVisibility === "public"
                        ? "Public"
                        : "Private"}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Save Changes */}
              <Card className="p-6">
                <Button
                  className="w-full"
                  onClick={handleProfileUpdate}
                  disabled={saving}
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </div>
                  )}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
