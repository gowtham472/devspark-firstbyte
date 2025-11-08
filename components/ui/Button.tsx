// components/ui/Button.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500/20 shadow-lg hover:shadow-blue-500/25 dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700 dark:text-white",
    secondary:
      "bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 focus:ring-orange-500/20 shadow-lg hover:shadow-orange-500/25 dark:bg-orange-500 dark:hover:bg-orange-600 dark:active:bg-orange-700 dark:text-white",
    outline:
      "border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white active:bg-blue-700 focus:ring-blue-500/20 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900 dark:active:bg-blue-500",
    ghost:
      "text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm rounded-md",
    md: "px-5 py-3 text-base rounded-lg",
    lg: "px-6 py-4 text-lg rounded-xl",
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
