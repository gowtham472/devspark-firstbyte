// components/pages/LandingPage.tsx
"use client";

import React from "react";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Users,
  Star,
  Upload,
  Search,
  Shield,
  CheckCircle,
  Github,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { Layout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";

// Add the CSS animation styles
const gridStyles = `
  @keyframes gridMove {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(40px, 40px);
    }
  }
  
  @keyframes gridPulse {
    0%, 100% {
      opacity: 0.05;
    }
    50% {
      opacity: 0.15;
    }
  }
  
  @keyframes gridFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    33% {
      transform: translateY(-2px) rotate(0.5deg);
    }
    66% {
      transform: translateY(1px) rotate(-0.3deg);
    }
  }
`;

export function LandingPage() {
  const { user } = useAuth();

  return (
    <>
      {/* CSS Styles */}
      <style jsx>{gridStyles}</style>

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
        {/* Animated Grid Background */}
        <div className="fixed inset-0 z-[-1] overflow-hidden">
          {/* Base gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-white to-blue-50/40"></div>

          {/* Primary moving grid - main pattern */}
          <div className="absolute inset-0 opacity-60">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.06) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.06) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
                animation: "gridMove 25s linear infinite",
              }}
            />
          </div>

          {/* Secondary offset grid for depth - emerald accent */}
          <div className="absolute inset-0 opacity-40">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: "80px 80px",
                animation: "gridMove 35s linear infinite reverse",
              }}
            />
          </div>

          {/* Micro grid for texture */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(99, 102, 241, 0.02) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(99, 102, 241, 0.02) 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
                animation: "gridMove 15s linear infinite",
              }}
            />
          </div>

          {/* Subtle pulsing dots at intersections */}
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 20px 20px, rgba(59, 130, 246, 0.08) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
                animation:
                  "gridMove 25s linear infinite, gridPulse 6s ease-in-out infinite",
              }}
            />
          </div>

          {/* Overlay gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/40"></div>
        </div>

        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 bg-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
              Knowledge sharing for{" "}
              <span className="text-primary">students</span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              A GitHub-inspired platform where students upload, organize, and
              share study materials, notes, and educational resources.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {user ? (
                <Link href="/dashboard">
                  <Button className="w-full sm:w-auto">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth?mode=register">
                    <Button className="w-full sm:w-auto">
                      Get Started
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Search className="mr-2 w-4 h-4" />
                      Explore
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-20 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Built for students
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Simple tools to organize, share, and discover educational
                content
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Upload className="w-6 h-6" />,
                  title: "Easy Upload",
                  description:
                    "Drag and drop files into organized study hubs with tags and descriptions.",
                },
                {
                  icon: <BookOpen className="w-6 h-6" />,
                  title: "Smart Organization",
                  description:
                    "Create collections, tag content, and find everything with powerful search.",
                },
                {
                  icon: <Users className="w-6 h-6" />,
                  title: "Community Driven",
                  description:
                    "Follow other students, collaborate on projects, and build your network.",
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  title: "Privacy Controls",
                  description:
                    "Keep materials private or share publicly. You control the visibility.",
                },
                {
                  icon: <Star className="w-6 h-6" />,
                  title: "Quality Content",
                  description:
                    "Star the best resources and discover trending content from contributors.",
                },
                {
                  icon: <Github className="w-6 h-6" />,
                  title: "Version Control",
                  description:
                    "Track changes to your study materials with simple version history.",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Get started in 3 steps
              </h2>
              <p className="text-lg text-text-secondary">
                Simple process to start sharing knowledge
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Create Account",
                  description:
                    "Sign up with email or Google. Add your institution and interests.",
                  icon: <Users className="w-5 h-5" />,
                },
                {
                  step: "02",
                  title: "Upload Materials",
                  description:
                    "Create study hubs and upload notes, projects, and resources with tags.",
                  icon: <Upload className="w-5 h-5" />,
                },
                {
                  step: "03",
                  title: "Discover & Share",
                  description:
                    "Explore public content, follow students, and build your learning network.",
                  icon: <Search className="w-5 h-5" />,
                },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-semibold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 lg:py-20 bg-surface">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Trusted by students
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  quote:
                    "ByteHub transformed how I organize study materials. Finally found a platform that works like GitHub but for education.",
                  author: "Sarah Chen",
                  role: "Computer Science, MIT",
                },
                {
                  quote:
                    "Love the community aspect. Discovered amazing study resources I wouldn't have found elsewhere.",
                  author: "Marcus Johnson",
                  role: "Engineering, Stanford",
                },
              ].map((testimonial, index) => (
                <Card key={index} className="p-6">
                  <div className="text-text-primary mb-4 leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="font-medium text-text-primary text-sm">
                      {testimonial.author}
                    </div>
                    <div className="text-text-secondary text-xs">
                      {testimonial.role}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 border-t border-border">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Join students who are sharing knowledge and building learning
              communities.
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/auth?mode=register">
                  <Button className="w-full sm:w-auto">
                    Create Account
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Search className="mr-2 w-4 h-4" />
                    Browse Content
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-text-secondary">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Free to use
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                No credit card
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Open source
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
