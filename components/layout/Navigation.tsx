"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Compass,
  FolderOpen,
  User,
  Plus,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface NavigationProps {
  user?: {
    name: string;
    avatar?: string;
    username: string;
  } | null;
}

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize dark mode from localStorage
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const theme = localStorage.getItem("theme");
      return theme === "dark";
    }
    return false;
  });

  // Apply theme on mount and state changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: FolderOpen,
      requiresAuth: true,
    },
  ];

  const NavLink = ({
    href,
    label,
    icon: Icon,
    requiresAuth = false,
  }: {
    href: string;
    label: string;
    icon: LucideIcon;
    requiresAuth?: boolean;
  }) => {
    if (requiresAuth && !user) return null;
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        onClick={() => setIsMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200",
          "text-sm font-medium",
          isActive
            ? "bg-[var(--color-primary)] text-white"
            : "text-[var(--color-text-primary)] hover:bg-[var(--color-border)] hover:text-[var(--color-primary)]"
        )}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-50 backdrop-blur-md bg-[var(--color-surface)]/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* --- Logo Section --- */}
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/logo.png"
              alt="ByteHub Logo"
              width={80}
              height={80}
              className="object-contain"
            />
            <span className="font-bold text-lg text-[var(--color-text-primary)]">
              ByteHub
            </span>
          </Link>

          {/* --- Desktop Nav --- */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>

          {/* --- Actions --- */}
          <div className="flex items-center gap-3">
            {/* Dark/Light Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="w-10 h-10 p-0"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Authenticated User */}
            {user ? (
              <>
                <Link href="/upload">
                  <Button
                    size="sm"
                    className="hidden sm:flex bg-[var(--color-primary)] hover:bg-[#4aa4ef] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Hub
                  </Button>
                </Link>

                <div className="flex items-center gap-3">
                  <Link href={`/profile/${user.username}`}>
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--color-primary)] flex items-center justify-center">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={36}
                          height={36}
                          className="object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </Link>

                  <Link href="/settings">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:flex w-10 h-10 p-0"
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth?mode=register">
                  <Button
                    size="sm"
                    className="bg-[var(--color-primary)] hover:bg-[#4aa4ef] text-white"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {/* --- Mobile Menu Toggle --- */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden w-10 h-10 p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* --- Mobile Menu --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[var(--color-border)] space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}

            {user && (
              <>
                <Link
                  href="/upload"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Plus className="w-5 h-5" /> Create Hub
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" /> Settings
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
