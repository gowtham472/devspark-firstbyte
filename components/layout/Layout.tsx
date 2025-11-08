// components/layout/Layout.tsx
"use client";

import React from "react";
import { Navigation } from "./Navigation";
import Image from "next/image";

interface LayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    avatar?: string;
    username: string;
  } | null;
}

export function Layout({ children, user }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                  <Image
                    src="/logo.png"
                    alt="ByteHub Logo"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                <span className="font-display font-bold text-lg text-text-primary">
                  ByteHub
                </span>
              </div>
              <p className="text-text-secondary text-sm">
                Empowering students to share knowledge — one Byte at a time.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-text-primary mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a
                    href="/explore"
                    className="hover:text-primary transition-colors"
                  >
                    Explore
                  </a>
                </li>
                <li>
                  <a
                    href="/upload"
                    className="hover:text-primary transition-colors"
                  >
                    Upload
                  </a>
                </li>
                <li>
                  <a
                    href="/dashboard"
                    className="hover:text-primary transition-colors"
                  >
                    Dashboard
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-text-primary mb-3">Community</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Guidelines
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-text-primary mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Open Source
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-text-secondary">
            <p>&copy; 2024 ByteHub. Built with ❤️ for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
